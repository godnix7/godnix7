"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type * as OrtNs from "onnxruntime-web";

/**
 * MotionSense running entirely in the visitor's browser (ONNX Runtime Web, WebAssembly).
 * Same pipeline as the Python app: frames sampled at 8 fps, centre-cropped to 160x160, ImageNet
 * normalisation, MobileNetV3-Large features per frame, LSTM over a 16-frame (~2 s) window,
 * EMA smoothing, a confidence threshold and a motion gate. Nothing is uploaded anywhere.
 */
type Ort = typeof OrtNs;

const CLASSES = ["Jumping Jack", "Push-Ups", "Bodyweight Squats", "Lunges", "Tai Chi", "Boxing (Speed Bag)"];
const SAMPLES = [
  { file: "mixed_activities.mp4", label: "All six activities" },
  { file: "JumpingJack_g02_c03.mp4", label: "Jumping Jack" },
  { file: "PushUps_g04_c05.mp4", label: "Push-Ups" },
  { file: "BodyWeightSquats_g01_c01.mp4", label: "Squats" },
  { file: "Lunges_g01_c04.mp4", label: "Lunges" },
  { file: "TaiChi_g03_c01.mp4", label: "Tai Chi" },
  { file: "BoxingSpeedBag_g04_c07.mp4", label: "Boxing" },
];
const SEQ = 16;
const SIZE = 160;
const SAMPLE_DT = 1 / 8;
const INFER_EVERY = 2;
const ALPHA = 0.4;
const CONF = 0.6;
const MOTION_MIN = 0.8;
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

let ortPromise: Promise<Ort> | null = null;
function loadOrt(): Promise<Ort> {
  ortPromise ??= import(/* webpackIgnore: true */ /* turbopackIgnore: true */ "/ort/ort.wasm.bundle.min.mjs" as string).then(
    (mod: unknown) => {
      const ort = mod as Ort;
      ort.env.wasm.wasmPaths = "/ort/";
      ort.env.wasm.numThreads = 1; // no SharedArrayBuffer / cross-origin isolation needed
      return ort;
    },
  );
  return ortPromise;
}

async function fetchWithProgress(url: string, onBytes: (n: number) => void): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`Could not load ${url}`);
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
    onBytes(value.length);
  }
  const out = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.length;
  }
  return out;
}

type Snapshot = {
  probs: number[];
  label: string;
  confidence: number;
  status: "warming" | "confident" | "uncertain" | "still";
  motion: number;
  cnnMs: number;
  lstmMs: number;
  windows: number;
};

const EMPTY: Snapshot = { probs: CLASSES.map(() => 0), label: "—", confidence: 0, status: "warming", motion: 0, cnnMs: 0, lstmMs: 0, windows: 0 };

export default function MotionSenseDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cropRef = useRef<HTMLCanvasElement | null>(null);
  const smallRef = useRef<HTMLCanvasElement | null>(null);
  const sessions = useRef<{ ort: Ort; feat: OrtNs.InferenceSession; temp: OrtNs.InferenceSession } | null>(null);
  const state = useRef({ feats: [] as Float32Array[], motion: [] as number[], prevSmall: null as Float32Array | null, ema: null as number[] | null, since: 0, lastT: -1, busy: false, windows: 0 });
  const rafRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [phase, setPhase] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [source, setSource] = useState<string>(SAMPLES[0].file);
  const [snap, setSnap] = useState<Snapshot>(EMPTY);
  const [timeline, setTimeline] = useState<{ label: string; ok: boolean }[]>([]);

  const reset = useCallback(() => {
    state.current = { feats: [], motion: [], prevSmall: null, ema: null, since: 0, lastT: -1, busy: false, windows: 0 };
    setSnap(EMPTY);
    setTimeline([]);
  }, []);

  const load = useCallback(async () => {
    if (sessions.current || phase === "loading") return;
    setPhase("loading");
    setError("");
    try {
      const TOTAL = 11_877_289 + 9_461_538 + 14_848_852;
      let got = 0;
      const tick = (n: number) => {
        got += n;
        setProgress(Math.min(99, Math.round((got / TOTAL) * 100)));
      };
      const ortP = loadOrt();
      const [featBytes, tempBytes] = await Promise.all([
        fetchWithProgress("/motionsense/features.onnx", tick),
        fetchWithProgress("/motionsense/temporal.onnx", tick),
      ]);
      const ort = await ortP;
      tick(14_848_852);
      const opts: OrtNs.InferenceSession.SessionOptions = { executionProviders: ["wasm"], graphOptimizationLevel: "all" };
      const [feat, temp] = await Promise.all([ort.InferenceSession.create(featBytes, opts), ort.InferenceSession.create(tempBytes, opts)]);
      sessions.current = { ort, feat, temp };
      setProgress(100);
      setPhase("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load the model");
      setPhase("error");
    }
  }, [phase]);

  // Frame step: crop -> features -> (every 2 frames) LSTM window -> smoothed prediction
  const step = useCallback(async (video: HTMLVideoElement) => {
    const s = sessions.current;
    if (!s) return;
    const crop = (cropRef.current ??= Object.assign(document.createElement("canvas"), { width: SIZE, height: SIZE }));
    const small = (smallRef.current ??= Object.assign(document.createElement("canvas"), { width: 64, height: 64 }));
    const cctx = crop.getContext("2d", { willReadFrequently: true })!;
    const sctx = small.getContext("2d", { willReadFrequently: true })!;
    const vw = video.videoWidth, vh = video.videoHeight;
    if (!vw || !vh) return;
    const side = Math.min(vw, vh);
    cctx.imageSmoothingEnabled = true;
    cctx.imageSmoothingQuality = "high";
    cctx.drawImage(video, (vw - side) / 2, (vh - side) / 2, side, side, 0, 0, SIZE, SIZE);
    const px = cctx.getImageData(0, 0, SIZE, SIZE).data;

    const input = new Float32Array(3 * SIZE * SIZE);
    const plane = SIZE * SIZE;
    for (let i = 0; i < plane; i++) {
      input[i] = (px[i * 4] / 255 - MEAN[0]) / STD[0];
      input[plane + i] = (px[i * 4 + 1] / 255 - MEAN[1]) / STD[1];
      input[2 * plane + i] = (px[i * 4 + 2] / 255 - MEAN[2]) / STD[2];
    }

    sctx.drawImage(crop, 0, 0, 64, 64);
    const sp = sctx.getImageData(0, 0, 64, 64).data;
    const gray = new Float32Array(64 * 64);
    for (let i = 0; i < gray.length; i++) gray[i] = 0.299 * sp[i * 4] + 0.587 * sp[i * 4 + 1] + 0.114 * sp[i * 4 + 2];
    const st = state.current;
    let motion = 0;
    if (st.prevSmall) {
      for (let i = 0; i < gray.length; i++) motion += Math.abs(gray[i] - st.prevSmall[i]);
      motion /= gray.length;
    }
    st.prevSmall = gray;

    const t0 = performance.now();
    const out = await s.feat.run({ frames: new s.ort.Tensor("float32", input, [1, 3, SIZE, SIZE]) });
    const cnnMs = performance.now() - t0;
    st.feats.push(out.features.data as Float32Array);
    st.motion.push(motion);
    if (st.feats.length > SEQ) {
      st.feats.shift();
      st.motion.shift();
    }
    st.since++;
    if (st.feats.length < SEQ || st.since < INFER_EVERY) {
      setSnap((p) => ({ ...p, cnnMs, motion }));
      return;
    }
    st.since = 0;
    const seq = new Float32Array(SEQ * 960);
    st.feats.forEach((f, i) => seq.set(f, i * 960));
    const t1 = performance.now();
    const res = await s.temp.run({ features: new s.ort.Tensor("float32", seq, [1, SEQ, 960]) });
    const lstmMs = performance.now() - t1;
    const probs = Array.from(res.probs.data as Float32Array);
    st.ema = st.ema ? st.ema.map((v, i) => ALPHA * probs[i] + (1 - ALPHA) * v) : probs;
    st.windows++;
    const avgMotion = st.motion.reduce((a, b) => a + b, 0) / st.motion.length;
    const best = st.ema.indexOf(Math.max(...st.ema));
    const confidence = st.ema[best];
    const status: Snapshot["status"] = avgMotion < MOTION_MIN ? "still" : confidence >= CONF ? "confident" : "uncertain";
    const label = status === "still" ? "No movement" : status === "uncertain" ? "Uncertain" : CLASSES[best];
    setSnap({ probs: st.ema, label, confidence, status, motion: avgMotion, cnnMs, lstmMs, windows: st.windows });
    setTimeline((tl) => [...tl.slice(-47), { label: status === "confident" ? CLASSES[best] : label, ok: status === "confident" }]);
  }, []);

  // Drive sampling from the video clock (files) or wall clock (webcam) at 8 fps.
  useEffect(() => {
    if (phase !== "ready") return;
    const video = videoRef.current;
    if (!video) return;
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      const st = state.current;
      if (st.busy || video.paused || video.readyState < 2) return;
      const now = streamRef.current ? performance.now() / 1000 : video.currentTime;
      if (now < st.lastT) {
        // the clip looped or was seeked backwards: start a fresh window
        st.feats = [];
        st.motion = [];
        st.prevSmall = null;
        st.since = 0;
      }
      if (st.lastT >= 0 && now - st.lastT < SAMPLE_DT && now >= st.lastT) return;
      st.lastT = now;
      st.busy = true;
      step(video).finally(() => {
        st.busy = false;
      });
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, step]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const playSample = (file: string) => {
    stopCamera();
    const v = videoRef.current;
    if (!v) return;
    v.srcObject = null;
    v.src = `/motionsense/videos/${file}`;
    v.loop = true;
    setSource(file);
    reset();
    void v.play().catch(() => undefined);
  };

  const playUpload = (f: File | undefined) => {
    if (!f) return;
    stopCamera();
    const v = videoRef.current;
    if (!v) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = URL.createObjectURL(f); // stays on this device; never uploaded
    v.srcObject = null;
    v.src = objectUrlRef.current;
    v.loop = true;
    setSource("upload");
    reset();
    void v.play().catch(() => undefined);
  };

  const useCamera = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" }, audio: false });
      stopCamera();
      streamRef.current = stream;
      v.removeAttribute("src");
      v.srcObject = stream;
      setSource("camera");
      reset();
      await v.play();
    } catch {
      setError("Camera permission was denied or no camera is available.");
    }
  };

  // Start the mixed-activity sample as soon as the model is ready.
  useEffect(() => {
    if (phase === "ready" && videoRef.current && !videoRef.current.src && !videoRef.current.srcObject) playSample(SAMPLES[0].file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => () => {
    stopCamera();
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  const started = phase === "ready";
  const topIdx = snap.probs.indexOf(Math.max(...snap.probs));

  return (
    <section className="ms-wrap" aria-label="MotionSense live demonstration">
      <div className="demo-frame-top">
        <span><i /> Live model · runs in your browser</span>
        <span>MobileNetV3-Large + LSTM · ONNX Runtime Web</span>
      </div>

      {!started ? (
        <div className="ms-start">
          <div>
            <h2>Run the trained network here.</h2>
            <p>
              The real MotionSense checkpoint (converted to ONNX, outputs identical to PyTorch) loads into this page and
              classifies six activities from motion over ~2 seconds. Video never leaves your device.
            </p>
          </div>
          <button className="button button-primary" onClick={load} disabled={phase === "loading"}>
            {phase === "loading" ? `Loading model… ${progress}%` : "Load model (≈36 MB)"}
          </button>
          {phase === "loading" && <div className="ms-progress"><span style={{ width: `${progress}%` }} /></div>}
          {error && <p className="ms-error">{error}</p>}
        </div>
      ) : null}

      <div className="ms-grid" style={{ display: started ? undefined : "none" }}>
        <div className="ms-stage">
          <video ref={videoRef} className="ms-video" muted playsInline autoPlay crossOrigin="anonymous" />
          <div className={`ms-overlay ms-${snap.status}`}>
            <strong>{snap.label}</strong>
            <span>{snap.status === "confident" ? `${Math.round(snap.confidence * 100)}% confidence` : snap.status === "warming" ? "Collecting a 2-second window…" : snap.status === "still" ? "Move to start recognition" : "Below the 60% threshold"}</span>
          </div>
          <div className="ms-sources">
            {SAMPLES.map((s) => (
              <button key={s.file} className={source === s.file ? "is-active" : ""} onClick={() => playSample(s.file)}>{s.label}</button>
            ))}
            <label className={source === "upload" ? "is-active" : ""}>
              Your video
              <input type="file" accept="video/*" onChange={(e) => playUpload(e.target.files?.[0])} hidden />
            </label>
            <button className={source === "camera" ? "is-active" : ""} onClick={useCamera}>Webcam</button>
          </div>
          {error && <p className="ms-error">{error}</p>}
        </div>

        <aside className="ms-panel">
          <span className="detail-meta-label">Class probabilities (smoothed)</span>
          <ul className="ms-bars">
            {CLASSES.map((c, i) => (
              <li key={c} className={i === topIdx && snap.windows > 0 ? "is-top" : ""}>
                <span>{c}</span>
                <b>{Math.round((snap.probs[i] ?? 0) * 100)}%</b>
                <i style={{ width: `${(snap.probs[i] ?? 0) * 100}%` }} />
              </li>
            ))}
          </ul>
          <dl className="ms-stats">
            <div><dt>CNN / frame</dt><dd>{snap.cnnMs ? `${snap.cnnMs.toFixed(0)} ms` : "—"}</dd></div>
            <div><dt>LSTM / window</dt><dd>{snap.lstmMs ? `${snap.lstmMs.toFixed(1)} ms` : "—"}</dd></div>
            <div><dt>Motion</dt><dd>{snap.motion.toFixed(2)}</dd></div>
            <div><dt>Windows</dt><dd>{snap.windows}</dd></div>
          </dl>
          <span className="detail-meta-label">Recent windows</span>
          <div className="ms-timeline">
            {timeline.map((t, i) => (
              <i key={i} title={t.label} className={t.ok ? `c${CLASSES.indexOf(t.label)}` : "c-none"} />
            ))}
          </div>
          <p className="ms-note">Sampling 8 fps · 16-frame window · 60% confidence threshold · motion gate. Test-split accuracy 72.9 % (6 classes, UCF101).</p>
        </aside>
      </div>
    </section>
  );
}
