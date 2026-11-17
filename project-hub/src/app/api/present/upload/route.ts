import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getAdminSession } from "@/lib/auth";
import { DECK_EXT_RE, DECK_MAX, DECK_PREFIX, DECK_TYPES, blobConfigured, keyMatches } from "@/lib/decks";

/**
 * Issues a short-lived token so the browser can upload a deck straight to Vercel Blob
 * (serverless request bodies are capped at ~4.5 MB). Requires the presenter key.
 */
export async function POST(request: Request): Promise<Response> {
  if (!blobConfigured()) return Response.json({ error: "Uploads are not configured" }, { status: 503 });
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const { key } = JSON.parse(clientPayload ?? "{}") as { key?: unknown };
        // signed-in admin, or the optional PRESENTER_KEY
        if (!(await getAdminSession()) && !keyMatches(key)) throw new Error("Sign in to upload presentations");
        if (!pathname.startsWith(DECK_PREFIX) || !DECK_EXT_RE.test(pathname)) throw new Error("Use a PowerPoint (.pptx, .ppt, .ppsx, .pps, .potx), .odp or .pdf file");
        return { allowedContentTypes: DECK_TYPES, maximumSizeInBytes: DECK_MAX, addRandomSuffix: true };
      },
      onUploadCompleted: async () => {},
    });
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 400 });
  }
}
