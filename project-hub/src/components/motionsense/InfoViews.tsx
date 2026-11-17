"use client";

import { useEffect, useState } from "react";
import { CLASSES, CLASS_KEYS, COLORS, MODEL_BYTES, ORT_VERSION, SEQ, SIZE, classify, features, type Engine } from "@/lib/motionsense/engine";
import { ConfusionMatrix, GroupedBars, LineChart, StackedBars } from "./charts";
import { Architecture, Metric, PageHead, Section, useReports } from "./shared";

/* ------------------------------------------------------------ benchmark (shared) */
type Bench = { windowMs: number; stepMs: number; cnnMs: number; lstmMs: number };
let benchPromise: Promise<Bench> | null = null;
export function useBenchmark(engine: Engine | null): Bench | null {
  const [b, setB] = useState<Bench | null>(null);
  useEffect(() => {
    if (!engine) return;
    benchPromise ??= (async () => {
      const frame = () => Float32Array.from({ length: 3 * SIZE * SIZE }, () => Math.random() * 2 - 1);
      await features(engine, [frame()]); // warm-up
      let t = performance.now();
      const f16 = await features(engine, Array.from({ length: SEQ }, frame));
      const cnn16 = performance.now() - t;
      t = performance.now();
      await classify(engine, f16);
      const lstm = performance.now() - t;
      t = performance.now();
      await features(engine, [frame()]);
      const cnn1 = performance.now() - t;
      return { windowMs: cnn16 + lstm, stepMs: cnn1 + lstm, cnnMs: cnn1, lstmMs: lstm };
    })();
    benchPromise.then(setB).catch(() => undefined);
  }, [engine]);
  return b;
}

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

/* ------------------------------------------------------------ Overview */
export function OverviewView({ engine, pct: loadPct, go }: { engine: Engine | null; pct: number; go: (tab: string) => void }) {
  const r = useReports();
  const bench = useBenchmark(engine);
  const f1 = (k: string) => r?.metrics.classification_report[k]?.["f1-score"] ?? 0;
  return (
    <>
      <div className="msa-hero">
        <div>
          <span className="msa-kicker">Deep learning · Computer vision</span>
          <h1>Motion Intelligence Lab</h1>
          <p className="msa-hero-sub">Real-time human activity recognition</p>
          <p>
            MotionSense recognises human activities from a live camera or recorded video. MobileNetV3-Large encodes each frame,
            and an LSTM models how those features change across a 16-frame window (about 2 seconds). Every prediction is based on
            motion over time, never on a single image. The network is trained and evaluated on UCF101 with the official
            train/test protocol, and runs here entirely in your browser.
          </p>
          <div className="msa-hero-cta">
            <button className="msa-btn" onClick={() => go("live")}>Open Live Recognition</button>
            <button className="msa-btn ghost" onClick={() => go("video")}>Analyse a video</button>
          </div>
        </div>
        <dl className="msa-status">
          <dt>System status</dt><dd />
          <dt>Model</dt><dd>{engine ? <b className="ok">Ready</b> : `Loading ${loadPct}%`}</dd>
          <dt>Compute</dt><dd>WebAssembly · in browser</dd>
          <dt>Test accuracy</dt><dd>{r ? pct(r.metrics.accuracy) : "72.9%"}</dd>
          <dt>Test macro-F1</dt><dd>{r ? r.metrics.f1_macro.toFixed(3) : "0.738"}</dd>
          <dt>Parameters</dt><dd>5.34 M</dd>
          <dt>Benchmark</dt><dd>UCF101 split 1</dd>
        </dl>
      </div>

      <Section n="01" title="Model architecture" aside="MobileNetV3-Large → LSTM → classifier · PyTorch → ONNX">
        <Architecture />
      </Section>

      <Section n="02" title="Supported activities" aside="frames are real UCF101 test-split samples · bar = test F1-score">
        <div className="msa-classes">
          {CLASSES.map((c, i) => (
            <div key={c} className="msa-class">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/motionsense/assets/${CLASS_KEYS[i]}.jpg`} alt={c} loading="lazy" />
              <strong>{c}</strong>
              <span>Test F1 <b>{f1(CLASS_KEYS[i]).toFixed(2)}</b></span>
              <i><em style={{ width: `${f1(CLASS_KEYS[i]) * 100}%`, background: COLORS[i] }} /></i>
            </div>
          ))}
        </div>
        <p className="msa-note">Movements outside these six classes, and low-confidence windows, are reported as <b>Unknown / uncertain activity</b> instead of being forced into a class.</p>
      </Section>

      <div className="msa-two">
        <Section n="03" title="Dataset" aside="UCF101 · CRCV, University of Central Florida">
          <div className="msa-metrics four">
            <Metric label="Classes" value="6" sub="of 101 · six-class configuration" />
            <Metric label="Training" value="412" unit="videos" sub="official trainlist" />
            <Metric label="Validation" value="87" unit="videos" sub="groups g08–g10" />
            <Metric label="Test" value="199" unit="videos" sub="official testlist01" />
          </div>
          <p className="msa-note">UCF101 contains 13,320 real-world videos in 101 action classes. Clips are grouped by actor and scene; the official split keeps whole groups in either training or test, and validation holds out further whole groups, so no person or scene appears in two subsets.</p>
        </Section>
        <Section n="04" title="Inference performance" aside="benchmarked in this browser">
          <div className="msa-metrics four">
            <Metric label="Full window" value={bench ? bench.windowMs.toFixed(0) : "…"} unit="ms" sub="16 frames, CNN + LSTM" />
            <Metric label="Live step" value={bench ? bench.stepMs.toFixed(0) : "…"} unit="ms" sub="1 new frame + LSTM" />
            <Metric label="Throughput" value={bench ? (1000 / bench.stepMs).toFixed(0) : "…"} unit="win/s" sub="incremental mode" />
            <Metric label="Precision" value="FP32" sub="ONNX Runtime Web · WASM" />
          </div>
          <p className="msa-note">The trained PyTorch checkpoint was exported to ONNX; outputs match PyTorch to within 0.000002. Video and camera frames never leave this device.</p>
          <div className="msa-pills"><span className={engine ? "on" : ""}>{engine ? "Model ready" : `Loading model ${loadPct}%`}</span><span className="on">WebAssembly · ONNX Runtime {ORT_VERSION}</span></div>
        </Section>
      </div>

      <Section n="05" title="Demonstration guide" aside="how to run a live demo">
        <div className="msa-steps">
          {[
            ["Open Live Recognition", "Choose Webcam and allow camera access. The status reads Collecting until the first 16-frame window (about 2 s) is filled."],
            ["Frame the whole body", "Stand 2–3 m from the camera with your full body visible and even lighting, similar to the UCF101 recordings."],
            ["Hold each activity", "Perform one exercise for 3–4 s. Standing still shows No movement; low confidence shows Uncertain."],
            ["No camera? Use a video", "Pick a demo clip on the Live page, or upload a clip on Video Analysis. All six activities plays every class in sequence."],
          ].map(([t, d], i) => (
            <div key={t} className="msa-step"><span>Step 0{i + 1}</span><strong>{t}</strong><p>{d}</p></div>
          ))}
        </div>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------ Model insights */
export function InsightsView() {
  const r = useReports();
  if (!r) return <p className="msa-note">Loading reports…</p>;
  const m = r.metrics;
  const h = r.history.history;
  const epochs = h.map((e) => e.epoch);
  const report = CLASS_KEYS.map((k) => m.classification_report[k]);
  const cfg = r.history.config as Record<string, number | string | boolean>;
  const best = Math.max(...h.map((e) => e.val_f1_macro));
  return (
    <>
      <PageHead crumb="Model insights" title="Training & Evaluation Results" lead="Learning curves from the training run and final metrics on the held-out official UCF101 test split." />
      <div className="msa-metrics five">
        <Metric label="Test accuracy" value={pct(m.accuracy)} sub="video-level · 199 test videos" />
        <Metric label="Clip accuracy" value="72.2%" sub="single 16-frame windows" />
        <Metric label="Macro precision" value={m.precision_macro.toFixed(3)} />
        <Metric label="Macro recall" value={m.recall_macro.toFixed(3)} />
        <Metric label="Macro F1" value={m.f1_macro.toFixed(3)} sub="UCF101 official testlist01" />
      </div>
      <p className="msa-note">Offline test performance is measured on UCF101 test videos never seen in training or model selection. Live webcam behaviour differs (viewpoint, lighting, clothing, framing).</p>

      <Section n="01" title="Architecture" aside="MobileNetV3-Large → LSTM → FC → Softmax"><Architecture /></Section>

      <Section n="02" title="Learning curves" aside={`${h.length} epochs · best val macro-F1 ${best.toFixed(3)}`}>
        <div className="msa-two">
          <div className="msa-card"><LineChart x={epochs} yMin={0.2} yMax={1.5} yFmt={(v) => v.toFixed(1)} xLabel="Epoch" series={[
            { name: "Training loss", color: COLORS[0], values: h.map((e) => e.train_loss) },
            { name: "Validation loss", color: COLORS[1], values: h.map((e) => e.val_loss), dashed: true },
          ]} /></div>
          <div className="msa-card"><LineChart x={epochs} xLabel="Epoch" series={[
            { name: "Train acc (clip)", color: COLORS[0], values: h.map((e) => e.train_acc) },
            { name: "Val acc (clip)", color: COLORS[1], values: h.map((e) => e.val_clip_acc), dashed: true },
            { name: "Val acc (video)", color: COLORS[2], values: h.map((e) => e.val_video_acc), dashed: true },
          ]} /></div>
        </div>
        <p className="msa-note">Training metrics use augmented clips (label smoothing 0.1), so training loss is not directly comparable to validation loss. Validation = training-list groups g08–g10 (never in test).</p>
      </Section>

      <Section n="03" title="Test-set evaluation" aside="official split · confusion matrix and per-class report">
        <div className="msa-two">
          <div className="msa-card"><p className="msa-card-t">Confusion matrix (rows = true class)</p><ConfusionMatrix matrix={m.confusion_matrix} labels={CLASSES} /></div>
          <div>
            <table className="msa-table">
              <thead><tr><th>Class</th><th>Precision</th><th>Recall</th><th>F1-score</th><th>Support</th></tr></thead>
              <tbody>
                {report.map((c, i) => (
                  <tr key={CLASSES[i]}><td>{CLASSES[i]}</td><td>{c.precision.toFixed(3)}</td><td>{c.recall.toFixed(3)}</td><td>{c["f1-score"].toFixed(3)}</td><td>{c.support}</td></tr>
                ))}
                <tr className="sum"><td>Macro avg</td><td>{m.precision_macro.toFixed(3)}</td><td>{m.recall_macro.toFixed(3)}</td><td>{m.f1_macro.toFixed(3)}</td><td>199</td></tr>
              </tbody>
            </table>
            <div className="msa-card" style={{ marginTop: 14 }}>
              <GroupedBars labels={CLASSES} groups={[
                { name: "Precision", color: COLORS[0], values: report.map((c) => c.precision) },
                { name: "Recall", color: COLORS[1], values: report.map((c) => c.recall) },
                { name: "F1-score", color: COLORS[2], values: report.map((c) => c["f1-score"]) },
              ]} />
            </div>
          </div>
        </div>
      </Section>

      <div className="msa-two">
        <Section n="04" title="Dataset class distribution" aside="videos per subset">
          <div className="msa-card">
            <StackedBars labels={CLASSES} parts={[
              { name: "Train", color: COLORS[0], values: CLASS_KEYS.map((k) => r.distribution.counts[k].train) },
              { name: "Val", color: COLORS[1], values: CLASS_KEYS.map((k) => r.distribution.counts[k].val) },
              { name: "Test", color: COLORS[2], values: CLASS_KEYS.map((k) => r.distribution.counts[k].test) },
            ]} />
          </div>
        </Section>
        <Section n="05" title="Training configuration">
          <table className="msa-table">
            <tbody>
              {[
                ["Optimizer", `AdamW (wd ${cfg.weight_decay})`],
                ["Learning rate", `head ${cfg.lr_head} · backbone ${cfg.lr_backbone} · cosine`],
                ["Loss", "CrossEntropyLoss (label smoothing 0.1)"],
                ["Epochs / batch", `${cfg.epochs} / ${cfg.batch_size} clips`],
                ["Sequence", `${cfg.seq_len} frames @ ${cfg.sample_fps} fps, ${cfg.img_size}²`],
                ["Backbone", "ImageNet MobileNetV3-L, frozen feature extractor"],
                ["Temporal", `LSTM hidden ${cfg.lstm_hidden}, ${cfg.lstm_layers} layer, input [fₜ ; fₜ − fₜ₋₁]`],
                ["Augmentation", "resized crop, flip, brightness/contrast, grayscale, temporal jitter"],
                ["Precision", "mixed (FP16 autocast) for training"],
                ["Seed", String(cfg.seed)],
              ].map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}
            </tbody>
          </table>
        </Section>
      </div>

      <Section n="06" title="Model selection" aside="chosen by validation macro-F1 only — the test split was used once, afterwards">
        <table className="msa-table">
          <thead><tr><th>Experiment</th><th>Backbone</th><th>LSTM input</th><th>Best val macro-F1</th><th>Selected</th></tr></thead>
          <tbody>
            {Object.entries(r.selection).map(([name, s]) => (
              <tr key={name}><td>{name}</td><td>{s.unfreeze_blocks ? `last ${s.unfreeze_blocks} blocks tuned` : "frozen"}</td><td>{s.use_deltas ? "[fₜ ; Δfₜ]" : "fₜ"}</td><td>{s.best_val_f1_macro.toFixed(3)}</td><td>{name === "d0" ? "yes" : ""}</td></tr>
            ))}
          </tbody>
        </table>
        <p className="msa-note">Validation errors of the first model clustered by UCF101 group (shared actor and background), indicating scene memorisation. Feeding temporal feature differences and freezing the backbone reduced this; the frozen variant was selected.</p>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------ System */
export function SystemView({ engine }: { engine: Engine | null }) {
  const r = useReports();
  const bench = useBenchmark(engine);
  const [env, setEnv] = useState<{ ua: string; cores: number; mem: string; simd: boolean; platform: string }>({ ua: "", cores: 0, mem: "", simd: false, platform: "" });
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number; userAgentData?: { platform?: string } };
    const simd = WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]));
    setEnv({
      ua: nav.userAgent,
      cores: nav.hardwareConcurrency ?? 0,
      mem: nav.deviceMemory ? `${nav.deviceMemory} GB` : "not exposed",
      simd,
      platform: nav.userAgentData?.platform ?? nav.platform,
    });
  }, []);
  const browser = /Edg\//.test(env.ua) ? "Microsoft Edge" : /Chrome\//.test(env.ua) ? "Google Chrome" : /Firefox\//.test(env.ua) ? "Firefox" : /Safari\//.test(env.ua) ? "Safari" : "Browser";
  const mb = (b: number) => `${(b / 1048576).toFixed(1)} MB`;
  return (
    <>
      <PageHead crumb="System" title="System Information" lead="Runtime environment, model footprint and measured inference speed in this browser." />
      <Section n="01" title="Compute device">
        <div className="msa-metrics five">
          <Metric label="Device" value="WASM" sub={`WebAssembly ${env.simd ? "SIMD" : "(no SIMD)"} · CPU`} />
          <Metric label="Browser" value={browser} sub={env.platform} />
          <Metric label="Logical cores" value={String(env.cores || "—")} sub="1 inference thread" />
          <Metric label="Device memory" value={env.mem} sub="navigator.deviceMemory" />
          <Metric label="Model load" value={engine ? (engine.loadMs / 1000).toFixed(1) : "…"} unit="s" sub="download + session init" />
        </div>
      </Section>
      <div className="msa-two">
        <Section n="02" title="Model">
          <div className="msa-metrics four">
            <Metric label="Total parameters" value="5.34" unit="M" />
            <Metric label="Backbone" value="2.97" unit="M" sub="MobileNetV3-Large" />
            <Metric label="LSTM" value="2.23" unit="M" />
            <Metric label="FC head" value="134" unit="K" />
          </div>
          <table className="msa-table">
            <thead><tr><th>File</th><th>Role</th><th>Size</th></tr></thead>
            <tbody>
              <tr><td>features.onnx</td><td>MobileNetV3-L → 960-d per frame</td><td>{mb(MODEL_BYTES.features)}</td></tr>
              <tr><td>temporal.onnx</td><td>LSTM + classifier + softmax</td><td>{mb(MODEL_BYTES.temporal)}</td></tr>
              <tr><td>ort-wasm-simd.wasm</td><td>ONNX Runtime Web</td><td>{mb(MODEL_BYTES.runtime)}</td></tr>
            </tbody>
          </table>
          <p className="msa-note">Checkpoint epoch 16 · val macro-F1 0.799 · trained with PyTorch 2.8 on an RTX 4050 laptop GPU, exported to ONNX (opset 17).</p>
        </Section>
        <div>
          <Section n="03" title="Inference benchmark" aside="measured live in this browser">
            <table className="msa-table">
              <thead><tr><th>Measurement</th><th>Latency</th><th>Throughput</th></tr></thead>
              <tbody>
                <tr><td>Full window (16 frames, CNN + LSTM)</td><td>{bench ? `${bench.windowMs.toFixed(1)} ms` : "…"}</td><td>{bench ? `${(1000 / bench.windowMs).toFixed(1)} windows/s` : ""}</td></tr>
                <tr><td>Incremental live step (1 frame + LSTM)</td><td>{bench ? `${bench.stepMs.toFixed(1)} ms` : "…"}</td><td>{bench ? `${(1000 / bench.stepMs).toFixed(0)} steps/s` : ""}</td></tr>
                <tr><td>CNN, one frame</td><td>{bench ? `${bench.cnnMs.toFixed(1)} ms` : "…"}</td><td /></tr>
                <tr><td>LSTM, one window</td><td>{bench ? `${bench.lstmMs.toFixed(1)} ms` : "…"}</td><td /></tr>
              </tbody>
            </table>
            <p className="msa-note">Reference on the training laptop (RTX 4050, FP16): 14.0 ms per full window, 13.1 ms per live step.</p>
          </Section>
          <Section n="04" title="Software environment">
            <table className="msa-table"><tbody>
              <tr><td>Runtime</td><td>ONNX Runtime Web {ORT_VERSION} (WebAssembly)</td></tr>
              <tr><td>Training framework</td><td>PyTorch 2.8 · torchvision 0.23</td></tr>
              <tr><td>Front end</td><td>Next.js · React</td></tr>
              <tr><td>Browser</td><td>{browser}</td></tr>
            </tbody></table>
          </Section>
        </div>
      </div>
      {r && (
        <Section n="05" title="Dataset" aside={`UCF101 official split 1 · frames sampled at 8 fps · mean ${r.distribution.mean_cached_frames.toFixed(0)} sampled frames per video`}>
          <table className="msa-table">
            <thead><tr><th>Class</th><th>Train</th><th>Val</th><th>Test</th></tr></thead>
            <tbody>{CLASS_KEYS.map((k, i) => <tr key={k}><td>{CLASSES[i]}</td><td>{r.distribution.counts[k].train}</td><td>{r.distribution.counts[k].val}</td><td>{r.distribution.counts[k].test}</td></tr>)}</tbody>
          </table>
        </Section>
      )}
    </>
  );
}
