"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DECK_ACCEPT = ".pptx,.ppt,.ppsx,.pps,.potx,.pptm,.odp,.pdf";
const DECK_RE = /\.(pptx|ppt|ppsx|pps|potx|pptm|odp|pdf)$/i;

export function DeckUploader({ enabled, admin }: { enabled: boolean; admin: boolean }) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<{ busy: boolean; pct: number; msg: string; ok: boolean }>({ busy: false, pct: 0, msg: "", ok: false });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    if (!DECK_RE.test(file.name)) return setState({ busy: false, pct: 0, msg: "Choose a PowerPoint (.pptx, .ppt, .ppsx, .pps, .potx, .pptm), .odp or .pdf file.", ok: false });
    setState({ busy: true, pct: 0, msg: "", ok: false });
    try {
      const safe = file.name.replace(/[^A-Za-z0-9._ -]/g, "_");
      await upload(`decks/${safe}`, file, {
        access: "private",
        handleUploadUrl: "/api/present/upload",
        clientPayload: JSON.stringify({ key }),
        multipart: file.size > 8 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setState((s) => ({ ...s, pct: Math.round(percentage) })),
      });
      setState({ busy: false, pct: 100, msg: "Uploaded. It's now in the list below.", ok: true });
      setFile(null);
      router.refresh();
    } catch (err) {
      setState({ busy: false, pct: 0, msg: err instanceof Error ? err.message : "Upload failed", ok: false });
    }
  }

  if (!enabled) {
    return (
      <p className="h-note">
        <a href="/admin/login" style={{ textDecoration: "underline", fontWeight: 600 }}>Sign in</a> to upload presentations
        (PowerPoint .pptx, .ppt, .ppsx, .pps, .potx, .pptm, OpenDocument .odp, or PDF). Anyone can view and present the decks below.
      </p>
    );
  }
  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      <input className="h-input" type="file" accept={DECK_ACCEPT} onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
      <span className="h-note">PowerPoint .pptx, .ppt, .ppsx, .pps, .potx, .pptm · OpenDocument .odp · PDF · up to 100 MB</span>
      {!admin && <input className="h-input" type="password" placeholder="Presenter key" value={key} onChange={(e) => setKey(e.target.value)} required autoComplete="current-password" />}
      <button className="h-btn h-btn-dark" disabled={state.busy}>{state.busy ? `Uploading… ${state.pct}%` : "Upload presentation"}</button>
      {state.msg && <p className={state.ok ? "h-ok" : "h-error"}>{state.msg}</p>}
    </form>
  );
}

export function PresentLink() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/present/view?u=${encodeURIComponent(url.trim())}`);
      }}
      style={{ display: "grid", gap: 12 }}
    >
      <input className="h-input" type="url" placeholder="https://…/deck.pptx or a PowerPoint/OneDrive embed link" value={url} onChange={(e) => setUrl(e.target.value)} required pattern="https://.*" />
      <button className="h-btn h-btn-light">Present this link</button>
    </form>
  );
}
