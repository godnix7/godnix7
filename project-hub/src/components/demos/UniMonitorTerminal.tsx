"use client";

import { useEffect, useRef, useState } from "react";
import { UNIMONITOR_OPS } from "@/lib/unimonitor";
import { UNIMONITOR_EXAMPLES } from "@/lib/unimonitor-examples";

/**
 * Terminal-style front end for the live UniMonitor demo. Typed input is matched locally against the
 * allow-list; only the operation id is ever sent to the server.
 */
type Line = { kind: "cmd" | "out" | "err" | "info"; text: string };

const ALIASES: Record<string, string> = {
  dashboard: "overview", overview: "overview", "./main.sh": "overview",
  sysinfo: "sysinfo", system: "sysinfo", cpu: "cpu", memory: "memory", mem: "memory", disk: "disk",
  processes: "processes", ps: "processes", top: "processes", network: "network", net: "network",
  health: "health", report: "report", "--report": "report", "./main.sh --report": "report",
  version: "version", "--version": "version", "./main.sh --version": "version",
  help: "help", "--help": "help", "./main.sh --help": "help",
};

const WELCOME: Line[] = [
  { kind: "info", text: "UniMonitor live demo: the real Bash toolkit running in a Linux cloud sandbox." },
  { kind: "info", text: "Click a command or type one (try: dashboard, cpu, memory, disk, processes, health, report)." },
  { kind: "info", text: "Readings describe the sandbox server, never your own computer." },
];

export default function UniMonitorTerminal() {
  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"live" | "examples">("live");
  const screen = useRef<HTMLDivElement>(null);

  useEffect(() => {
    screen.current?.scrollTo({ top: screen.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  const print = (...l: Line[]) => setLines((prev) => [...prev, ...l].slice(-400));

  async function run(opId: string, shown: string) {
    print({ kind: "cmd", text: shown });
    if (mode === "examples") {
      const ex = UNIMONITOR_EXAMPLES[opId];
      print(ex ? { kind: "out", text: ex.output } : { kind: "err", text: "No recorded example for this command." });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/demos/unimonitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: opId }),
      });
      const data = (await res.json()) as { output?: string; error?: string; ms?: number; exitCode?: number };
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      print({ kind: "out", text: data.output?.trimEnd() || "(no output)" }, { kind: "info", text: `exit ${data.exitCode ?? 0} · ${data.ms ?? 0} ms · live` });
    } catch (e) {
      const ex = UNIMONITOR_EXAMPLES[opId];
      print({ kind: "err", text: `Live run unavailable (${e instanceof Error ? e.message : "error"}).` });
      if (ex) print({ kind: "info", text: `Showing a recorded run from ${ex.recordedOn}:` }, { kind: "out", text: ex.output });
    } finally {
      setBusy(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const raw = input.trim().replace(/\s+/g, " ");
    setInput("");
    if (!raw || busy) return;
    if (raw === "clear") return setLines([]);
    const op = ALIASES[raw.toLowerCase()];
    if (!op) {
      print({ kind: "cmd", text: raw }, { kind: "err", text: `${raw.split(" ")[0]}: command not available in this demo. Allowed: ${Object.keys(ALIASES).filter((k) => !k.includes("/") && !k.startsWith("-")).join(", ")}, clear` });
      return;
    }
    void run(op, raw);
  }

  return (
    <section className="um-wrap" aria-label="UniMonitor live terminal">
      <div className="demo-frame-top">
        <span><i /> Live terminal · real UniMonitor scripts</span>
        <span className="um-mode">
          <button className={mode === "live" ? "is-active" : ""} onClick={() => setMode("live")}>Live</button>
          <button className={mode === "examples" ? "is-active" : ""} onClick={() => setMode("examples")}>Examples</button>
        </span>
      </div>
      <div className="um-commands">
        {UNIMONITOR_OPS.map((o) => (
          <button key={o.id} disabled={busy} title={o.description} onClick={() => run(o.id, o.id === "version" || o.id === "help" ? `./main.sh ${o.label}` : o.label)}>
            {o.label}
          </button>
        ))}
        <button onClick={() => setLines([])}>clear</button>
      </div>
      <div className="um-screen" ref={screen} onClick={() => document.getElementById("um-input")?.focus()}>
        {lines.map((l, i) =>
          l.kind === "cmd" ? (
            <div key={i} className="um-cmd"><span>unimonitor@demo:~$</span> {l.text}</div>
          ) : (
            <pre key={i} className={`um-${l.kind}`}>{l.text}</pre>
          ),
        )}
        {busy && <div className="um-info">running…</div>}
        <form onSubmit={submit} className="um-prompt">
          <span>unimonitor@demo:~$</span>
          <input id="um-input" value={input} onChange={(e) => setInput(e.target.value)} maxLength={60} autoComplete="off" spellCheck={false} aria-label="Command" />
        </form>
      </div>
    </section>
  );
}
