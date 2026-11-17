import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { viewerUrl } from "@/lib/decks";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ u?: string; t?: string }> };

export default async function PresentView({ searchParams }: Props) {
  const { u = "", t = "" } = await searchParams;
  const src = viewerUrl(u);
  return (
    <div className="hub">
      <div className="h-present-shell">
        <div className="h-present-bar">
          <Link href="/present" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><ArrowLeft size={16} /> Decks</Link>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t || "Presentation"}</span>
          <span style={{ fontSize: 12, color: "#8193ab" }}>Use the viewer&apos;s ⛶ button for full screen</span>
        </div>
        {src ? (
          <iframe src={src} title={t || "Presentation"} allowFullScreen allow="fullscreen; autoplay" />
        ) : (
          <p style={{ color: "#fff", padding: 30 }}>That link isn&apos;t a valid https presentation URL.</p>
        )}
      </div>
    </div>
  );
}
