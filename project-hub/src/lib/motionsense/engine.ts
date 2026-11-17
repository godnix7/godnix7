"use client";

import type * as OrtNs from "onnxruntime-web";

/**
 * MotionSense inference engine for the browser (ONNX Runtime Web, WebAssembly).
 * Mirrors the Python pipeline: 8 fps sampling, centre crop to 160x160, ImageNet normalisation,
 * MobileNetV3-Large per-frame features, LSTM over 16-frame windows, EMA smoothing, 60% threshold, motion gate.
 * The model is loaded once per page and shared by every view.
 */
type Ort = typeof OrtNs;

export const CLASSES = ["Jumping Jack", "Push-Ups", "Bodyweight Squats", "Lunges", "Tai Chi", "Boxing (Speed Bag)"];
export const CLASS_KEYS = ["JumpingJack", "PushUps", "BodyWeightSquats", "Lunges", "TaiChi", "BoxingSpeedBag"];
export const COLORS = ["#1769aa", "#16a6a1", "#e6a23c", "#7a5cc2", "#d1495b", "#4f6d7a"];
export const UNCERTAIN_COLOR = "#c3cad5";
export const SEQ = 16;
export const SIZE = 160;
export const FPS = 8;
export const INFER_EVERY = 2;
export const ALPHA = 0.4;
export const CONF = 0.6;
export const MOTION_MIN = 0.8;
export const STRIDE = 4;
export const ORT_VERSION = "1.31.1";
export const MODEL_BYTES = { features: 11_877_289, temporal: 9_461_538, runtime: 14_848_852 };

const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

export type Engine = { ort: Ort; feat: OrtNs.InferenceSession; temp: OrtNs.InferenceSession; loadMs: number };

let enginePromise: Promise<Engine> | null = null;
const listeners = new Set<(pct: number) => void>();
let progress = 0;

export function onLoadProgress(fn: (pct: number) => void) {
  listeners.add(fn);
  fn(progress);
  return () => listeners.delete(fn);
}

async function fetchBytes(url: string, onBytes: (n: number) => void): Promise<Uint8Array> {
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

export function loadEngine(): Promise<Engine> {
  enginePromise ??= (async () => {
    const t0 = performance.now();
    const total = MODEL_BYTES.features + MODEL_BYTES.temporal + MODEL_BYTES.runtime;
    let got = 0;
    const tick = (n: number) => {
      got += n;
      progress = Math.min(99, Math.round((got / total) * 100));
      listeners.forEach((l) => l(progress));
    };
    const ortP = import(/* webpackIgnore: true */ /* turbopackIgnore: true */ "/ort/ort.wasm.bundle.min.mjs" as string).then(
      (mod: unknown) => {
        const ort = mod as Ort;
        ort.env.wasm.wasmPaths = "/ort/";
        ort.env.wasm.numThreads = 1;
        return ort;
      },
    );
    const [featBytes, tempBytes] = await Promise.all([
      fetchBytes("/motionsense/features.onnx", tick),
      fetchBytes("/motionsense/temporal.onnx", tick),
    ]);
    const ort = await ortP;
    tick(MODEL_BYTES.runtime);
    const opts: OrtNs.InferenceSession.SessionOptions = { executionProviders: ["wasm"], graphOptimizationLevel: "all" };
    const [feat, temp] = await Promise.all([ort.InferenceSession.create(featBytes, opts), ort.InferenceSession.create(tempBytes, opts)]);
    progress = 100;
    listeners.forEach((l) => l(100));
    return { ort, feat, temp, loadMs: performance.now() - t0 };
  })().catch((e) => {
    enginePromise = null;
    throw e;
  });
  return enginePromise;
}

/** Canvas helpers reused between frames. */
export class FrameReader {
  private crop = Object.assign(document.createElement("canvas"), { width: SIZE, height: SIZE });
  private small = Object.assign(document.createElement("canvas"), { width: 64, height: 64 });
  private cctx = this.crop.getContext("2d", { willReadFrequently: true })!;
  private sctx = this.small.getContext("2d", { willReadFrequently: true })!;
  private prev: Float32Array | null = null;

  reset() {
    this.prev = null;
  }

  /** Returns the normalised CHW tensor data and the motion score vs. the previous frame (0-255 scale). */
  read(source: CanvasImageSource, w: number, h: number): { input: Float32Array; motion: number } | null {
    if (!w || !h) return null;
    const side = Math.min(w, h);
    this.cctx.imageSmoothingEnabled = true;
    this.cctx.imageSmoothingQuality = "high";
    this.cctx.drawImage(source, (w - side) / 2, (h - side) / 2, side, side, 0, 0, SIZE, SIZE);
    const px = this.cctx.getImageData(0, 0, SIZE, SIZE).data;
    const plane = SIZE * SIZE;
    const input = new Float32Array(3 * plane);
    for (let i = 0; i < plane; i++) {
      input[i] = (px[i * 4] / 255 - MEAN[0]) / STD[0];
      input[plane + i] = (px[i * 4 + 1] / 255 - MEAN[1]) / STD[1];
      input[2 * plane + i] = (px[i * 4 + 2] / 255 - MEAN[2]) / STD[2];
    }
    this.sctx.drawImage(this.crop, 0, 0, 64, 64);
    const sp = this.sctx.getImageData(0, 0, 64, 64).data;
    const gray = new Float32Array(64 * 64);
    for (let i = 0; i < gray.length; i++) gray[i] = 0.299 * sp[i * 4] + 0.587 * sp[i * 4 + 1] + 0.114 * sp[i * 4 + 2];
    let motion = 0;
    if (this.prev) {
      for (let i = 0; i < gray.length; i++) motion += Math.abs(gray[i] - this.prev[i]);
      motion /= gray.length;
    }
    this.prev = gray;
    return { input, motion };
  }
}

// ONNX Runtime Web sessions must not run concurrently: serialise every inference call.
let queue: Promise<unknown> = Promise.resolve();
function exclusive<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

export function features(e: Engine, inputs: Float32Array[]): Promise<Float32Array[]> {
  return exclusive(() => featuresRaw(e, inputs));
}

export function classify(e: Engine, window: Float32Array[]): Promise<number[]> {
  return exclusive(() => classifyRaw(e, window));
}

async function featuresRaw(e: Engine, inputs: Float32Array[]): Promise<Float32Array[]> {
  const n = inputs.length;
  const batch = new Float32Array(n * 3 * SIZE * SIZE);
  inputs.forEach((x, i) => batch.set(x, i * x.length));
  const out = await e.feat.run({ frames: new e.ort.Tensor("float32", batch, [n, 3, SIZE, SIZE]) });
  const data = out.features.data as Float32Array;
  return Array.from({ length: n }, (_, i) => data.slice(i * 960, (i + 1) * 960));
}

async function classifyRaw(e: Engine, window: Float32Array[]): Promise<number[]> {
  const seq = new Float32Array(window.length * 960);
  window.forEach((f, i) => seq.set(f, i * 960));
  const res = await e.temp.run({ features: new e.ort.Tensor("float32", seq, [1, window.length, 960]) });
  return Array.from(res.probs.data as Float32Array);
}

export const ema = (prev: number[] | null, p: number[]) => (prev ? prev.map((v, i) => ALPHA * p[i] + (1 - ALPHA) * v) : p);

export type Decision = { label: string; index: number; confidence: number; status: "confident" | "uncertain" | "still" };

export function decide(probs: number[], motion: number): Decision {
  const index = probs.indexOf(Math.max(...probs));
  const confidence = probs[index];
  if (motion < MOTION_MIN) return { label: "No movement", index: -1, confidence, status: "still" };
  if (confidence < CONF) return { label: "Uncertain", index: -1, confidence, status: "uncertain" };
  return { label: CLASSES[index], index, confidence, status: "confident" };
}

/** UCF101 official test-split clips (never seen in training). conf = model's video-level confidence. */
export const SAMPLES = [
  { file: "mixed_activities.mp4", label: "All six activities · mixed sequence", conf: null },
  { file: "TaiChi_g03_c01.mp4", label: "Tai Chi · g03 c01", conf: 0.92 },
  { file: "PushUps_g05_c03.mp4", label: "Push-Ups · g05 c03", conf: 0.91 },
  { file: "BoxingSpeedBag_g06_c03.mp4", label: "Boxing (Speed Bag) · g06 c03", conf: 0.91 },
  { file: "TaiChi_g07_c01.mp4", label: "Tai Chi · g07 c01", conf: 0.91 },
  { file: "BodyWeightSquats_g01_c01.mp4", label: "Bodyweight Squats · g01 c01", conf: 0.93 },
  { file: "Lunges_g01_c04.mp4", label: "Lunges · g01 c04", conf: 0.93 },
  { file: "PushUps_g04_c05.mp4", label: "Push-Ups · g04 c05", conf: 0.89 },
  { file: "BodyWeightSquats_g05_c04.mp4", label: "Bodyweight Squats · g05 c04", conf: 0.88 },
  { file: "BoxingSpeedBag_g04_c07.mp4", label: "Boxing (Speed Bag) · g04 c07", conf: 0.88 },
  { file: "JumpingJack_g02_c03.mp4", label: "Jumping Jack · g02 c03", conf: 0.81 },
  { file: "BodyWeightSquats_g06_c01.mp4", label: "Bodyweight Squats · g06 c01", conf: 0.77 },
  { file: "PushUps_g01_c04.mp4", label: "Push-Ups · g01 c04", conf: 0.66 },
];
