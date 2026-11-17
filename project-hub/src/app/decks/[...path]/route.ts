import { get } from "@vercel/blob";
import { DECK_PREFIX } from "@/lib/decks";

/**
 * Serves decks from the private Blob store on our own domain, so PowerPoint's web viewer
 * (which needs a public https URL ending in .pptx) can open them. Only paths under decks/ are served.
 */
const TYPES: Record<string, string> = {
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppt: "application/vnd.ms-powerpoint",
  ppsx: "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
  pps: "application/vnd.ms-powerpoint",
  potx: "application/vnd.openxmlformats-officedocument.presentationml.template",
  pptm: "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
  odp: "application/vnd.oasis.opendocument.presentation",
  pdf: "application/pdf",
};

export async function GET(request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const pathname = `${DECK_PREFIX}${path.map(decodeURIComponent).join("/")}`;
  const ext = pathname.split(".").pop()?.toLowerCase() ?? "";
  if (path.some((p) => p === ".." || p.includes("\\")) || !TYPES[ext]) return new Response("Not found", { status: 404 });

  const blob = await get(pathname, { access: "private" }).catch(() => null);
  if (!blob?.stream) return new Response("Not found", { status: 404 });

  const download = new URL(request.url).searchParams.has("download");
  const name = (pathname.split("/").pop() ?? "presentation").replace(/[^A-Za-z0-9._ -]/g, "_");
  return new Response(blob.stream, {
    headers: {
      "Content-Type": TYPES[ext],
      "Content-Disposition": `${download || ext !== "pdf" ? "attachment" : "inline"}; filename="${name}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=300",
    },
  });
}
