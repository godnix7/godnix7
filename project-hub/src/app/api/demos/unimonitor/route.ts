import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { UNIMONITOR_OPS, isUnimonitorOp } from "@/lib/unimonitor";

/**
 * Live UniMonitor demo. Runs the real Bash toolkit (bundled in /unimonitor) inside this serverless
 * function's Linux sandbox.
 *
 * Security model: the browser sends only an operation id. It is checked against a fixed allow-list and
 * passed as the single argument of a fixed script (unimonitor/run-op.sh). No shell is spawned by Node,
 * no user text reaches the command line, stdin is closed, the environment is minimal, and every run
 * has a timeout and an output cap. Output describes this cloud sandbox, never the visitor's device.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ROOT = path.join(process.cwd(), "unimonitor");
const TMP = "/tmp/unimonitor-demo";
const MAX_OUTPUT = 64 * 1024;
const ANSI = /\x1b\[[0-9;?]*[ -/]*[@-~]/g;

// Best-effort per-instance rate limit (serverless instances are short-lived; Vercel's own limits apply too).
const hits = new Map<string, number[]>();
function allowed(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= 12) return false;
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

export async function GET() {
  return Response.json({ operations: UNIMONITOR_OPS.map(({ id, label, description }) => ({ id, label, description })) });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return Response.json({ error: "Forbidden" }, { status: 403 });

  const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (!allowed(ip)) return Response.json({ error: "Too many runs. Please wait a minute." }, { status: 429 });

  let op: unknown;
  try {
    op = ((await request.json()) as { op?: unknown }).op;
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  if (typeof op !== "string" || !isUnimonitorOp(op)) return Response.json({ error: "Unknown operation" }, { status: 400 });

  // UniMonitor writes reports/logs; the deployment bundle is read-only, so point it at /tmp.
  await mkdir(`${TMP}/reports`, { recursive: true });
  await mkdir(`${TMP}/logs`, { recursive: true });
  await writeFile(`${TMP}/settings.conf`, `REPORT_DIR=${TMP}/reports\nLOG_DIR=${TMP}/logs\n`);

  const started = Date.now();
  const result = await new Promise<{ code: number; out: string; error?: string }>((resolve) => {
    execFile(
      "/bin/bash",
      [path.join(ROOT, "run-op.sh"), op],
      {
        cwd: ROOT,
        env: { PATH: "/usr/local/bin:/usr/bin:/bin", HOME: TMP, LANG: "C.UTF-8", NO_COLOR: "1", TERM: "dumb", COLUMNS: "88", UNIMONITOR_CONFIG: `${TMP}/settings.conf` } as unknown as NodeJS.ProcessEnv,
        encoding: "utf8",
        timeout: 20_000,
        maxBuffer: 1024 * 1024,
        windowsHide: true,
      },
      (err: (Error & { code?: unknown; killed?: boolean }) | null, stdout: string, stderr: string) => {
        const out = `${stdout}${stderr ? `\n${stderr}` : ""}`.replace(ANSI, "").slice(0, MAX_OUTPUT);
        if (err && err.code === "ENOENT") resolve({ code: 127, out: "", error: "Bash is not available in this runtime" });
        else if (err && err.killed) resolve({ code: 124, out, error: "The operation timed out" });
        else resolve({ code: err ? Number((err as { code?: number }).code ?? 1) : 0, out });
      },
    );
  });

  if (result.error && !result.out) return Response.json({ error: result.error }, { status: 503 });
  return Response.json({ op, exitCode: result.code, output: result.out, ms: Date.now() - started, ranAt: new Date().toISOString() });
}
