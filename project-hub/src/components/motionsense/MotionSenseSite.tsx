"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { InsightsView, OverviewView, SystemView } from "./InfoViews";
import LiveView from "./LiveView";
import VideoView from "./VideoView";
import { useEngine } from "./shared";

const TABS = [
  ["overview", "Overview"],
  ["live", "Live Recognition"],
  ["video", "Video Analysis"],
  ["insights", "Model Insights"],
  ["system", "System"],
] as const;
type Tab = (typeof TABS)[number][0];

export default function MotionSenseSite() {
  const { engine, pct, error } = useEngine(); // the model starts loading immediately, in the background
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1) as Tab;
      if (TABS.some(([k]) => k === h)) setTab(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const go = (t: string) => {
    window.location.hash = t;
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="msa">
      <header className="msa-top">
        <div className="msa-wrap msa-top-inner">
          <button className="msa-brand" onClick={() => go("overview")}>
            <strong>MOTIONSENSE</strong>
            <span>Motion Intelligence Lab</span>
          </button>
          <nav className="msa-tabs">
            {TABS.map(([k, label]) => (
              <button key={k} className={tab === k ? "on" : ""} onClick={() => go(k)}>{label}</button>
            ))}
          </nav>
          <div className="msa-top-right">
            <span className={`msa-model ${engine ? "ok" : error ? "bad" : ""}`}>{engine ? "Model ready" : error ? "Model error" : `Loading model ${pct}%`}</span>
            <Link href="/">Project Lab ↗</Link>
          </div>
        </div>
        {!engine && !error && <div className="msa-top-progress"><i style={{ width: `${pct}%` }} /></div>}
      </header>

      <main className="msa-wrap msa-main">
        {error && <p className="msa-err">The model could not be loaded: {error}. Check your connection and reload.</p>}
        {tab === "overview" && <OverviewView engine={engine} pct={pct} go={go} />}
        {tab === "live" && <LiveView engine={engine} pct={pct} />}
        {tab === "video" && <VideoView engine={engine} pct={pct} />}
        {tab === "insights" && <InsightsView />}
        {tab === "system" && <SystemView engine={engine} />}
      </main>

      <footer className="msa-foot">
        <div className="msa-wrap msa-foot-grid">
          <div>
            <strong>MOTIONSENSE</strong>
            <p>Real-time human activity recognition with a MobileNetV3-Large + LSTM network. Academic deep learning project by Nischay Kademane.</p>
            <a href="https://github.com/godnix7/MotionSense---Deep-Learning-Project" target="_blank" rel="noreferrer">Source code on GitHub</a>
          </div>
          <div>
            <strong>Dataset</strong>
            <p>UCF101 (Soomro, Zamir &amp; Shah, 2012), CRCV, University of Central Florida. Six classes, official split 1. Reported metrics are measured on the official test split.</p>
          </div>
          <div>
            <strong>Stack</strong>
            <p>PyTorch · ONNX · ONNX Runtime Web · Next.js. Inference runs in your browser; camera and video never leave this device.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
