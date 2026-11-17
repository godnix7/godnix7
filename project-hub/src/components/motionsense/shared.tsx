"use client";

import { useEffect, useState } from "react";
import { loadEngine, onLoadProgress, type Engine } from "@/lib/motionsense/engine";

export function Section({ n, title, aside, children }: { n: string; title: string; aside?: string; children: React.ReactNode }) {
  return (
    <section className="msa-section">
      <div className="msa-section-head">
        <h2><span>{n}</span>{title}</h2>
        {aside && <small>{aside}</small>}
      </div>
      {children}
    </section>
  );
}

export function PageHead({ crumb, title, lead }: { crumb: string; title: string; lead: string }) {
  return (
    <header className="msa-pagehead">
      <p className="msa-crumb">MotionSense / <b>{crumb}</b></p>
      <h1>{title}</h1>
      <p>{lead}</p>
    </header>
  );
}

export function Metric({ label, value, unit, sub }: { label: string; value: string; unit?: string; sub?: string }) {
  return (
    <div className="msa-metric">
      <span>{label}</span>
      <strong>{value}{unit && <small> {unit}</small>}</strong>
      {sub && <em>{sub}</em>}
    </div>
  );
}

export function Architecture() {
  const steps = [
    ["01", "Video input", "webcam · mp4 / webm / mov", "H×W×3 @ 25–60 fps", false],
    ["02", "Frame sampling", "fixed 8 fps · rolling", "T = 16 ≈ 2 s", false],
    ["03", "Preprocessing", "crop · ImageNet norm", "T×3×160×160", false],
    ["04", "MobileNetV3-L", "ImageNet weights · per frame", "T×960 features", true],
    ["05", "LSTM", "[fₜ ; Δfₜ] · hidden 256", "last ‖ mean", true],
    ["06", "FC classifier", "512→256→6", "6 logits", true],
    ["07", "Softmax", "EMA · threshold", "label + confidence", false],
  ] as const;
  return (
    <div className="msa-arch">
      <div className="msa-arch-row">
        {steps.map(([n, t, s, o, net]) => (
          <div key={n} className={`msa-arch-box${net ? " net" : ""}`}>
            <span>{n}</span>
            <strong>{t}</strong>
            <small>{s}</small>
            <code>{o}</code>
          </div>
        ))}
      </div>
      <p className="msa-arch-note">
        LIVE MODE · each sampled frame passes the CNN once; its feature is cached in a rolling buffer and the LSTM re-classifies the
        latest window every 2 new frames. Δfₜ = fₜ − fₜ₋₁ emphasises motion over static background.
      </p>
    </div>
  );
}

export type Reports = {
  metrics: {
    accuracy: number; precision_macro: number; recall_macro: number; f1_macro: number; clip_accuracy?: number;
    confusion_matrix: number[][];
    classification_report: Record<string, { precision: number; recall: number; "f1-score": number; support: number }>;
  };
  selection: Record<string, { unfreeze_blocks: number; use_deltas: boolean; best_val_f1_macro: number }>;
  distribution: { counts: Record<string, { train: number; val: number; test: number }>; mean_cached_frames: number };
  history: { config: Record<string, unknown>; history: { epoch: number; train_loss: number; train_acc: number; val_loss: number; val_clip_acc: number; val_video_acc: number; val_f1_macro: number; epoch_time_s: number }[] };
};

let reportsPromise: Promise<Reports> | null = null;
export function useReports(): Reports | null {
  const [r, setR] = useState<Reports | null>(null);
  useEffect(() => {
    reportsPromise ??= Promise.all(
      ["test_metrics", "model_selection", "class_distribution", "training_history"].map((n) => fetch(`/motionsense/reports/${n}.json`).then((x) => x.json())),
    ).then(([metrics, selection, distribution, history]) => ({ metrics, selection, distribution, history }) as Reports);
    reportsPromise.then(setR).catch(() => undefined);
  }, []);
  return r;
}

/** Starts loading the model as soon as any view mounts; exposes progress and the ready engine. */
export function useEngine() {
  const [engine, setEngine] = useState<Engine | null>(null);
  const [pct, setPct] = useState(0);
  const [error, setError] = useState("");
  useEffect(() => {
    const off = onLoadProgress(setPct);
    loadEngine().then(setEngine).catch((e) => setError(e instanceof Error ? e.message : "Model failed to load"));
    return () => {
      off();
    };
  }, []);
  return { engine, pct, error };
}
