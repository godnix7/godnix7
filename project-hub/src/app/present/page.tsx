import type { Metadata } from "next";
import Link from "next/link";
import { list } from "@vercel/blob";
import { Download, Play } from "lucide-react";
import { HubFooter, HubNav } from "@/components/hub/HubChrome";
import { DeckUploader, PresentLink } from "@/components/hub/DeckTools";
import { DECK_PREFIX, blobConfigured, deckTitle, uploadsEnabled } from "@/lib/decks";

export const metadata: Metadata = { title: "Present", description: "Upload and present PowerPoint decks." };
export const dynamic = "force-dynamic";

async function decks() {
  if (!blobConfigured()) return [];
  try {
    const { blobs } = await list({ prefix: DECK_PREFIX, limit: 100 });
    return blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));
  } catch {
    return [];
  }
}

export default async function PresentPage() {
  const items = await decks();
  return (
    <div className="hub">
      <HubNav />
      <main className="h-wrap" style={{ paddingBottom: 90 }}>
        <section className="h-hero" style={{ paddingBottom: 34 }}>
          <span className="h-eyebrow">Present</span>
          <h1>Upload a deck. <em>Present it here.</em></h1>
          <p>
            PowerPoint files open full screen in Microsoft&apos;s PowerPoint web viewer, which plays slide transitions and most
            animations. Click or use the arrow keys to advance.
          </p>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18, marginBottom: 46 }}>
          <div className="h-panel">
            <h2 style={{ margin: "0 0 14px", fontSize: 20 }}>Upload a presentation</h2>
            <DeckUploader enabled={uploadsEnabled()} />
          </div>
          <div className="h-panel">
            <h2 style={{ margin: "0 0 14px", fontSize: 20 }}>Present from a link</h2>
            <PresentLink />
            <p className="h-note" style={{ marginTop: 12 }}>
              For the most faithful animations, upload the deck to OneDrive and use PowerPoint for the web&apos;s
              File → Share → Embed link here.
            </p>
          </div>
        </div>

        <div className="h-section-head"><div><span className="h-eyebrow">Library · {items.length}</span><h2>Your decks</h2></div></div>
        {items.length === 0 ? (
          <p className="h-note">No decks uploaded yet.</p>
        ) : (
          <div className="h-decks">
            {items.map((b) => (
              <div key={b.pathname} className="h-deck">
                <strong>{deckTitle(b.pathname)}</strong>
                <small>{(b.size / 1048576).toFixed(1)} MB · {new Date(b.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</small>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link className="h-btn h-btn-dark h-btn-sm" href={`/present/view?u=${encodeURIComponent(`/${b.pathname}`)}&t=${encodeURIComponent(deckTitle(b.pathname))}`}><Play size={14} /> Present</Link>
                  <a className="h-btn h-btn-light h-btn-sm" href={`/${b.pathname}?download=1`}><Download size={14} /> Download</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <HubFooter />
    </div>
  );
}
