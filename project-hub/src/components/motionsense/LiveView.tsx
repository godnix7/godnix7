"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CLASSES, COLORS, FPS, FrameReader, INFER_EVERY, SEQ, UNCERTAIN_COLOR, classify, decide, ema, features, type Engine,
} from "@/lib/motionsense/engine";
import { ProbBars } from "./charts";
import { Metric, PageHead, Section } from "./shared";

type Snap = { probs: number[]; label: string; index: number; confidence: number; status: string; motion: number; cnnMs: number; lstmMs: number; windows: number; fps: number };
const EMPTY: Snap = { probs: CLASSES.map(() => 0), label: "Collecting…", index: -1, confidence: 0, status: "warming", motion: 0, cnnMs: 0, lstmMs: 0, windows: 0, fps: 0 };

export default function LiveView({ engine, pct }: { engine: Engine | null; pct: number }) {
  const video = useRef<HTMLVideoElement>(null);
  const reader = useRef<FrameReader | null>(null);
  const st = useRef({ feats: [] as Float32Array[], motion: [] as number[], ema: null as number[] | null, since: 0, lastT: -1, busy: false, windows: 0, stamps: [] as number[] });
  const stream = useRef<MediaStream | null>(null);
  const objUrl = useRef<string | null>(null);
  const [mode, setMode] = useState<"none" | "camera" | "upload">("none");
  const [snap, setSnap] = useState<Snap>(EMPTY);
  const [history, setHistory] = useState<{ c: string; l: string }[]>([]);
  const [err, setErr] = useState("");

  const reset = useCallback(() => {
    st.current = { feats: [], motion: [], ema: null, since: 0, lastT: -1, busy: false, windows: 0, stamps: [] };
    reader.current?.reset();
    setSnap(EMPTY);
    setHistory([]);
  }, []);

  const stopCam = () => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  };

  const playFile = useCallback((src: string) => {
    const v = video.current;
    if (!v) return;
    stopCam();
    v.srcObject = null;
    v.src = src;
    v.loop = true;
    reset();
    void v.play().catch(() => undefined);
  }, [reset]);

  async function startCamera() {
    setErr("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: "user" }, audio: false });
      stopCam();
      stream.current = s;
      const v = video.current!;
      v.removeAttribute("src");
      v.srcObject = s;
      v.loop = false;
      reset();
      setMode("camera");
      await v.play();
    } catch {
      setErr("Camera permission was denied or no camera is available. Use a demo video instead.");
    }
  }

  function onUpload(f?: File) {
    if (!f) return;
    if (objUrl.current) URL.revokeObjectURL(objUrl.current);
    objUrl.current = URL.createObjectURL(f); // stays on this device
    setMode("upload");
    playFile(objUrl.current);
  }

  useEffect(() => () => {
    stopCam();
    if (objUrl.current) URL.revokeObjectURL(objUrl.current);
  }, []);

  // 8 fps sampling loop driven by the video clock (files) or wall clock (camera)
  useEffect(() => {
    if (!engine) return;
    reader.current ??= new FrameReader();
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const v = video.current;
      const s = st.current;
      if (!v || s.busy || v.paused || v.readyState < 2) return;
      const now = stream.current ? performance.now() / 1000 : v.currentTime;
      if (now < s.lastT) {
        s.feats = []; s.motion = []; s.since = 0; reader.current!.reset();
      }
      if (s.lastT >= 0 && now >= s.lastT && now - s.lastT < 1 / FPS) return;
      s.lastT = now;
      s.busy = true;
      void (async () => {
        try {
          const fr = reader.current!.read(v, v.videoWidth, v.videoHeight);
          if (!fr) return;
          const t0 = performance.now();
          const [f] = await features(engine, [fr.input]);
          const cnnMs = performance.now() - t0;
          s.feats.push(f); s.motion.push(fr.motion);
          if (s.feats.length > SEQ) { s.feats.shift(); s.motion.shift(); }
          s.stamps.push(performance.now()); s.stamps = s.stamps.filter((x) => performance.now() - x < 2000);
          const fps = s.stamps.length / 2;
          s.since++;
          if (s.feats.length < SEQ || s.since < INFER_EVERY) {
            setSnap((p) => ({ ...p, cnnMs, motion: fr.motion, fps }));
            return;
          }
          s.since = 0;
          const t1 = performance.now();
          const probs = await classify(engine, s.feats);
          const lstmMs = performance.now() - t1;
          s.ema = ema(s.ema, probs);
          s.windows++;
          const motion = s.motion.reduce((a, b) => a + b, 0) / s.motion.length;
          const d = decide(s.ema, motion);
          setSnap({ probs: s.ema, label: d.label, index: d.index, confidence: d.confidence, status: d.status, motion, cnnMs, lstmMs, windows: s.windows, fps });
          setHistory((h) => [...h.slice(-59), { c: d.index >= 0 ? COLORS[d.index] : UNCERTAIN_COLOR, l: d.label }]);
        } finally {
          s.busy = false;
        }
      })();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [engine]);

  const color = snap.index >= 0 ? COLORS[snap.index] : "#8a94a3";
  return (
    <>
      <PageHead crumb="Live recognition" title="Live Activity Recognition" lead="Webcam or video stream, classified continuously by the network running in your browser. Predictions use the last ~2 seconds of motion." />
      <div className="msa-live">
        <div>
          <div className="msa-source">
            <button className={mode === "camera" ? "on" : ""} onClick={startCamera}>Webcam</button>
            <label className={mode === "upload" ? "on" : ""}>Your video<input type="file" accept="video/*" hidden onChange={(e) => onUpload(e.target.files?.[0])} /></label>
          </div>
          <div className="msa-stage">
            <video ref={video} muted playsInline autoPlay className={mode === "camera" ? "mirror" : ""} />
            {mode === "none" && engine && <div className="msa-loading idle"><b>Choose Webcam or upload a video to start</b><span>Stand 2–3 m from the camera with your whole body in view.</span></div>}
            {!engine && <div className="msa-loading"><b>Loading model… {pct}%</b><i><em style={{ width: `${pct}%` }} /></i></div>}
            <div className="msa-hud" style={{ borderColor: color }}>
              <strong style={{ color }}>{snap.label}</strong>
              <span>{snap.status === "confident" ? `${Math.round(snap.confidence * 100)}% confidence` : snap.status === "warming" ? "Filling the 16-frame window" : snap.status === "still" ? "Move to start recognition" : "Below the 60% threshold"}</span>
            </div>
          </div>
          {err && <p className="msa-err">{err}</p>}
          <div className="msa-strip" aria-label="Recent predictions">{history.map((h, i) => <i key={i} title={h.l} style={{ background: h.c }} />)}</div>
        </div>
        <div>
          <Section n="01" title="Class probabilities" aside="EMA-smoothed">
            <ProbBars labels={CLASSES} values={snap.probs} colors={COLORS} highlight={snap.windows ? snap.probs.indexOf(Math.max(...snap.probs)) : undefined} />
          </Section>
          <Section n="02" title="Runtime">
            <div className="msa-metrics two">
              <Metric label="Sampling" value={snap.fps.toFixed(1)} unit="fps" sub={`target ${FPS} fps`} />
              <Metric label="Windows" value={String(snap.windows)} sub="every 2 new frames" />
              <Metric label="CNN / frame" value={snap.cnnMs ? snap.cnnMs.toFixed(0) : "—"} unit="ms" />
              <Metric label="LSTM / window" value={snap.lstmMs ? snap.lstmMs.toFixed(1) : "—"} unit="ms" />
              <Metric label="Motion" value={snap.motion.toFixed(2)} sub="gate 0.80" />
              <Metric label="Threshold" value="60" unit="%" sub="else Uncertain" />
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}
