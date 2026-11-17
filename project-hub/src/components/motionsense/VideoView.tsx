"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CLASSES, COLORS, FPS, FrameReader, SEQ, STRIDE, UNCERTAIN_COLOR, classify, decide, ema, features, type Engine,
} from "@/lib/motionsense/engine";
import { LineChart, ProbBars, TimelineBar } from "./charts";
import { Metric, PageHead, Section } from "./shared";

type Win = { start: number; end: number; probs: number[]; raw: number[]; motion: number; label: string; index: number; confidence: number };
type Result = { windows: Win[]; frames: number; duration: number; w: number; h: number; ms: number; cnnMs: number; lstmMs: number };
type Seg = { label: string; index: number; start: number; end: number; conf: number };

function seekTo(v: HTMLVideoElement, t: number) {
  return new Promise<void>((resolve) => {
    const done = () => {
      v.removeEventListener("seeked", done);
      resolve();
    };
    v.addEventListener("seeked", done);
    v.currentTime = t;
  });
}

export default function VideoView({ engine, pct }: { engine: Engine | null; pct: number }) {
  const work = useRef<HTMLVideoElement>(null);
  const player = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const [t, setT] = useState(0);
  const [err, setErr] = useState("");

  useEffect(() => () => {
    if (src) URL.revokeObjectURL(src);
  }, [src]);

  function pick(f?: File) {
    if (!f) return;
    if (src) URL.revokeObjectURL(src);
    setSrc(URL.createObjectURL(f)); // never leaves this device
    setName(f.name);
    setRes(null);
    setErr("");
  }

  async function analyse() {
    const v = work.current;
    if (!engine || !v || !src) return;
    setBusy(true);
    setErr("");
    setProgress(0);
    try {
      v.src = src;
      await new Promise<void>((ok, bad) => {
        v.onloadeddata = () => ok();
        v.onerror = () => bad(new Error("This video format can't be decoded by the browser. Try an MP4 (H.264) or WebM file."));
      });
      const duration = v.duration;
      if (!Number.isFinite(duration) || duration <= 0) throw new Error("Could not read the video duration.");
      const reader = new FrameReader();
      const times: number[] = [];
      for (let x = 0; x < duration - 0.02; x += 1 / FPS) times.push(x);
      const t0 = performance.now();
      const feats: Float32Array[] = [];
      const motions: number[] = [];
      let cnnMs = 0;
      const BATCH = 8;
      for (let i = 0; i < times.length; i += BATCH) {
        const inputs: Float32Array[] = [];
        for (const time of times.slice(i, i + BATCH)) {
          await seekTo(v, time);
          const fr = reader.read(v, v.videoWidth, v.videoHeight);
          if (fr) {
            inputs.push(fr.input);
            motions.push(fr.motion);
          }
        }
        const c0 = performance.now();
        feats.push(...(await features(engine, inputs)));
        cnnMs += performance.now() - c0;
        setProgress(Math.round(((i + BATCH) / times.length) * 90));
      }
      const windows: Win[] = [];
      let smooth: number[] | null = null;
      let lstmMs = 0;
      const starts: number[] = [];
      for (let s = 0; s + SEQ <= feats.length; s += STRIDE) starts.push(s);
      if (!starts.length && feats.length) starts.push(0);
      for (const s of starts) {
        const l0 = performance.now();
        const raw = await classify(engine, feats.slice(s, s + SEQ));
        lstmMs += performance.now() - l0;
        smooth = ema(smooth, raw);
        const motion = motions.slice(s, s + SEQ).reduce((a, b) => a + b, 0) / Math.max(1, Math.min(SEQ, motions.length - s));
        const d = decide(smooth, motion);
        windows.push({ start: s / FPS, end: (s + SEQ) / FPS, probs: smooth, raw, motion, label: d.label, index: d.index, confidence: d.confidence });
      }
      setProgress(100);
      setRes({ windows, frames: feats.length, duration, w: v.videoWidth, h: v.videoHeight, ms: performance.now() - t0, cnnMs, lstmMs });
      setT(0);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setBusy(false);
    }
  }

  // committed label per window -> contiguous segments
  const segments = useMemo<Seg[]>(() => {
    if (!res) return [];
    const out: Seg[] = [];
    res.windows.forEach((w, i) => {
      const start = i === 0 ? 0 : w.start + (SEQ - STRIDE) / FPS;
      const end = i === res.windows.length - 1 ? res.duration : w.start + SEQ / FPS;
      const last = out[out.length - 1];
      if (last && last.label === w.label) {
        last.end = end;
        last.conf = (last.conf + w.confidence) / 2;
      } else out.push({ label: w.label, index: w.index, start, end, conf: w.confidence });
    });
    return out;
  }, [res]);

  const current = res?.windows.reduce((best, w) => (Math.abs((w.start + w.end) / 2 - t) < Math.abs((best.start + best.end) / 2 - t) ? w : best), res.windows[0]);
  const activities = [...new Set(segments.filter((s) => s.index >= 0).map((s) => s.label))];
  const longest = segments.filter((s) => s.index >= 0).sort((a, b) => b.end - b.start - (a.end - a.start))[0];
  const legend = [...CLASSES.map((c, i) => ({ label: c, color: COLORS[i] })), { label: "Uncertain", color: UNCERTAIN_COLOR }];

  return (
    <>
      <PageHead crumb="Video analysis" title="Recorded Video Analysis" lead="Upload a video. It is sampled at the training frame rate, encoded by MobileNetV3 and classified by the LSTM over sliding temporal windows — all inside your browser." />
      <div className="msa-input">
        <label className="msa-btn ghost">Choose a video<input type="file" accept="video/*" hidden onChange={(e) => pick(e.target.files?.[0])} /></label>
        <span className="msa-file">{name || "MP4 / WebM / MOV · stays on this device"}</span>
        <button className="msa-btn" disabled={!engine || !src || busy} onClick={analyse}>
          {!engine ? `Loading model ${pct}%` : busy ? `Analysing… ${progress}%` : "Analyse video"}
        </button>
      </div>
      {busy && <div className="msa-progress"><i style={{ width: `${progress}%` }} /></div>}
      {err && <p className="msa-err">{err}</p>}
      <video ref={work} muted playsInline preload="auto" style={{ display: "none" }} />

      {res && current && (
        <>
          <Section n="01" title="Result" aside={`${res.windows.length} windows · ${res.frames} sampled frames`}>
            <div className="msa-metrics four">
              <Metric label="Activities detected" value={String(activities.length)} sub={activities.join(" → ") || "none above threshold"} />
              <Metric label="Longest activity" value={longest?.label ?? "—"} sub={longest ? `${(longest.end - longest.start).toFixed(1)} s` : ""} />
              <Metric label="Duration" value={res.duration.toFixed(1)} unit="s" sub={`${res.w}×${res.h}`} />
              <Metric label="Processing time" value={(res.ms / 1000).toFixed(1)} unit="s" sub={`${(res.duration / (res.ms / 1000)).toFixed(1)}× real time · WASM`} />
            </div>
          </Section>

          <div className="msa-two">
            <Section n="02" title="Video with predictions" aside="label follows playback">
              <div className="msa-stage">
                <video ref={player} src={src ?? undefined} controls playsInline onTimeUpdate={(e) => setT(e.currentTarget.currentTime)} />
                <div className="msa-hud" style={{ borderColor: current.index >= 0 ? COLORS[current.index] : "#8a94a3" }}>
                  <strong style={{ color: current.index >= 0 ? COLORS[current.index] : "#8a94a3" }}>{current.label}</strong>
                  <span>{Math.round(current.confidence * 100)}% · window {current.start.toFixed(1)}–{current.end.toFixed(1)} s</span>
                </div>
              </div>
            </Section>
            <Section n="03" title="Window inspector" aside="scrub to inspect each window">
              <input className="msa-range" type="range" min={0} max={res.duration} step={0.05} value={t} onChange={(e) => {
                const nt = Number(e.target.value);
                setT(nt);
                if (player.current) player.current.currentTime = nt;
              }} />
              <p className="msa-note">Time {t.toFixed(2)} s · smoothed class probabilities for this window</p>
              <ProbBars labels={CLASSES} values={current.probs} colors={COLORS} highlight={current.index >= 0 ? current.index : undefined} />
            </Section>
          </div>

          <Section n="04" title="Activity timeline" aside="committed label per window after smoothing + threshold">
            <div className="msa-card"><TimelineBar duration={res.duration} cursor={t} legend={legend} segments={segments.map((s) => ({ ...s, color: s.index >= 0 ? COLORS[s.index] : UNCERTAIN_COLOR }))} /></div>
            <div className="msa-card" style={{ marginTop: 12 }}>
              <LineChart x={res.windows.map((w) => (w.start + w.end) / 2)} xLabel="Time (s)" threshold={0.6} height={240}
                series={CLASSES.map((c, i) => ({ name: c.replace(" (Speed Bag)", ""), color: COLORS[i], values: res.windows.map((w) => w.probs[i]) }))} />
            </div>
          </Section>

          <div className="msa-two">
            <Section n="05" title="Detected segments">
              <table className="msa-table">
                <thead><tr><th>Activity</th><th>Start (s)</th><th>End (s)</th><th>Mean confidence</th></tr></thead>
                <tbody>{segments.map((s, i) => <tr key={i}><td><i className="msa-dot" style={{ background: s.index >= 0 ? COLORS[s.index] : UNCERTAIN_COLOR }} />{s.index >= 0 ? s.label : "Uncertain / unknown"}</td><td>{s.start.toFixed(2)}</td><td>{s.end.toFixed(2)}</td><td>{(s.conf * 100).toFixed(1)}%</td></tr>)}</tbody>
              </table>
            </Section>
            <Section n="06" title="Processing information">
              <div className="msa-metrics two">
                <Metric label="Sampled frames" value={String(res.frames)} sub="at 8 fps" />
                <Metric label="Windows" value={String(res.windows.length)} sub="16 frames each, stride 4" />
                <Metric label="CNN time" value={res.cnnMs.toFixed(0)} unit="ms" sub="MobileNetV3 (batch 8)" />
                <Metric label="LSTM time" value={res.lstmMs.toFixed(0)} unit="ms" sub="all windows" />
              </div>
            </Section>
          </div>
        </>
      )}
    </>
  );
}
