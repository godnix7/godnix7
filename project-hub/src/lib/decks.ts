import { timingSafeEqual, createHash } from "node:crypto";

/** Presentations live in Vercel Blob under decks/. No database needed. */
export const DECK_PREFIX = "decks/";
export const DECK_MAX = 100 * 1024 * 1024;
export const DECK_EXT_RE = /\.(pptx|ppt|ppsx|pps|potx|pptm|odp|pdf)$/i;
export const DECK_TYPES = [
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
  "application/vnd.openxmlformats-officedocument.presentationml.template",
  "application/vnd.ms-powerpoint.presentation.macroenabled.12",
  "application/vnd.ms-powerpoint",
  "application/vnd.oasis.opendocument.presentation",
  "application/pdf",
  "application/octet-stream",
];

export const blobConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
export const uploadsEnabled = () => blobConfigured() && (process.env.PRESENTER_KEY ?? "").length >= 8;

export function keyMatches(given: unknown): boolean {
  const expected = process.env.PRESENTER_KEY ?? "";
  if (typeof given !== "string" || expected.length < 8) return false;
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/** Only https URLs; Office viewer for PowerPoint files, the browser's viewer for PDFs, as-is for embed links. */
export function viewerUrl(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const path = u.pathname.toLowerCase();
  if (/\.(pptx|ppt|ppsx|pps|potx|pptm|odp)$/.test(path)) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(u.toString())}`;
  }
  return u.toString(); // PDFs, PowerPoint-for-the-web / OneDrive / Google Slides embed links
}

export function deckTitle(pathname: string): string {
  const name = decodeURIComponent(pathname.split("/").pop() ?? "Presentation");
  return name.replace(/-[A-Za-z0-9]{20,}(?=\.\w+$)/, "").replace(DECK_EXT_RE, "").replace(/[_-]+/g, " ");
}
