from __future__ import annotations

import json
import os
import shutil
import signal
import subprocess
import tempfile
import threading
import time
from collections import defaultdict, deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


APP_DIR = Path(__file__).resolve().parent
SOURCE_DIR = Path("/opt/unimonitor")
STATIC_FILE = APP_DIR / "static" / "index.html"
MAX_BODY_BYTES = 2048
MAX_OUTPUT_BYTES = 96 * 1024
COMMAND_TIMEOUT_SECONDS = 24
RATE_LIMIT_COUNT = 6
RATE_LIMIT_WINDOW_SECONDS = 60
ALLOWED_OPERATIONS = {
    "help": ["--help"],
    "version": ["--version"],
    "report": ["--report"],
}

_rate_lock = threading.Lock()
_rate_windows: dict[str, deque[float]] = defaultdict(deque)
_run_slots = threading.BoundedSemaphore(2)


def _client_key(headers) -> str:
    direct = headers.get("x-real-ip")
    forwarded = headers.get("x-forwarded-for", "").split(",", 1)[0].strip()
    return direct or forwarded or "unknown-client"


def _rate_limited(key: str) -> bool:
    now = time.monotonic()
    cutoff = now - RATE_LIMIT_WINDOW_SECONDS
    with _rate_lock:
        window = _rate_windows[key]
        while window and window[0] < cutoff:
            window.popleft()
        if len(window) >= RATE_LIMIT_COUNT:
            return True
        window.append(now)
        if len(_rate_windows) > 2000:
            expired = [address for address, events in _rate_windows.items() if not events or events[-1] < cutoff]
            for address in expired:
                _rate_windows.pop(address, None)
        return False


def _apply_process_limits(command: list[str]) -> list[str]:
    prlimit = shutil.which("prlimit")
    if not prlimit:
        raise RuntimeError("The isolated process-limit utility is unavailable.")
    return [prlimit, "--cpu=18", "--fsize=1048576", "--nproc=32", "--nofile=64", "--", *command]


def _run_operation(operation: str) -> dict:
    if not SOURCE_DIR.joinpath("main.sh").is_file():
        raise RuntimeError("The UniMonitor source is not present in this image.")

    with tempfile.TemporaryDirectory(prefix="unimonitor-demo-") as temp_root:
        working_dir = Path(temp_root) / "unimonitor"
        shutil.copytree(SOURCE_DIR, working_dir, ignore=shutil.ignore_patterns(".git", "__pycache__", "*.log"))
        command = _apply_process_limits([
            "/bin/bash",
            str(working_dir / "main.sh"),
            *ALLOWED_OPERATIONS[operation],
        ])
        safe_env = {
            "HOME": temp_root,
            "LANG": "C.UTF-8",
            "LC_ALL": "C.UTF-8",
            "NO_COLOR": "1",
            "PATH": "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
            "TERM": "dumb",
            "TMPDIR": temp_root,
            "UNIMONITOR_CONFIG": str(working_dir / "config" / "settings.conf"),
        }
        with tempfile.TemporaryFile(mode="w+b", dir=temp_root) as output:
            process = subprocess.Popen(
                command,
                cwd=working_dir,
                env=safe_env,
                stdin=subprocess.DEVNULL,
                stdout=output,
                stderr=subprocess.STDOUT,
                close_fds=True,
                start_new_session=True,
            )
            try:
                exit_code = process.wait(timeout=COMMAND_TIMEOUT_SECONDS)
            except subprocess.TimeoutExpired:
                os.killpg(process.pid, signal.SIGTERM)
                try:
                    process.wait(timeout=1)
                except subprocess.TimeoutExpired:
                    os.killpg(process.pid, signal.SIGKILL)
                    process.wait(timeout=1)
                exit_code = 124
            output.seek(0)
            raw = output.read(MAX_OUTPUT_BYTES + 1)
            truncated = len(raw) > MAX_OUTPUT_BYTES
            text = raw[:MAX_OUTPUT_BYTES].decode("utf-8", errors="replace")
            return {
                "operation": operation,
                "exitCode": exit_code,
                "output": text,
                "truncated": truncated,
                "timedOut": exit_code == 124,
            }


class DemoHandler(BaseHTTPRequestHandler):
    server_version = "UniMonitorDemo/1.0"

    def log_message(self, format_string: str, *args) -> None:
        print(f"{self.client_address[0]} - {format_string % args}")

    def _send(self, status: int, body: bytes, content_type: str) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'self' https://nischay.tech https://www.nischay.tech https://admin.nischay.tech https://project.nischay.tech; base-uri 'none'; form-action 'none'")
        self.end_headers()
        self.wfile.write(body)

    def _json(self, status: int, payload: dict) -> None:
        self._send(status, json.dumps(payload).encode("utf-8"), "application/json; charset=utf-8")

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/healthz":
            self._send(200, b"ok", "text/plain; charset=utf-8")
            return
        if path in ("/", "/index.html"):
            try:
                self._send(200, STATIC_FILE.read_bytes(), "text/html; charset=utf-8")
            except OSError:
                self._send(500, b"Demo interface unavailable", "text/plain; charset=utf-8")
            return
        self._json(404, {"error": "Not found."})

    def do_POST(self) -> None:
        if urlparse(self.path).path != "/api/run":
            self._json(404, {"error": "Not found."})
            return

        content_length = self.headers.get("Content-Length", "0")
        try:
            size = int(content_length)
        except ValueError:
            self._json(400, {"error": "Invalid request size."})
            return
        if size < 0 or size > MAX_BODY_BYTES:
            self._json(413, {"error": "Request is too large."})
            return

        try:
            request_data = json.loads(self.rfile.read(size).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._json(400, {"error": "Send a valid JSON request."})
            return
        operation = request_data.get("operation") if isinstance(request_data, dict) else None
        if not isinstance(operation, str) or operation not in ALLOWED_OPERATIONS:
            self._json(400, {"error": "Choose one of the listed UniMonitor operations."})
            return
        if _rate_limited(_client_key(self.headers)):
            self._json(429, {"error": "Demo limit reached. Try again in a minute."})
            return
        if not _run_slots.acquire(blocking=False):
            self._json(429, {"error": "The demo is busy. Try again in a moment."})
            return

        try:
            result = _run_operation(operation)
            self._json(200, result)
        except Exception as error:  # Return a generic failure; details stay in service logs.
            print(f"Demo operation failed ({operation}): {type(error).__name__}: {error}")
            self._json(503, {"error": "The isolated demo could not complete this operation."})
        finally:
            _run_slots.release()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "10000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), DemoHandler)
    server.daemon_threads = True
    server.serve_forever()
