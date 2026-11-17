import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getAdminSession, requestOriginIsValid } from "@/lib/auth";

export const runtime = "nodejs";

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const presentationType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const maxImageBytes = 5 * 1024 * 1024;
const maxPresentationBytes = 100 * 1024 * 1024;

export async function POST(request: Request) {
  if (!requestOriginIsValid(request)) return NextResponse.json({ error: "Request origin rejected." }, { status: 403 });
  if (!(await getAdminSession())) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  try {
    const body = await request.json() as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const cleanPath = pathname.replaceAll("\\", "/");
        const filename = cleanPath.split("/").at(-1) || "";
        if (!/^projects\/[a-zA-Z0-9][a-zA-Z0-9._-]{0,115}\.(jpe?g|png|webp|avif|pptx)$/i.test(cleanPath)) {
          throw new Error("Upload path is not allowed.");
        }
        if (/\.pptx$/i.test(filename)) {
          return {
            allowedContentTypes: [presentationType],
            maximumSizeInBytes: maxPresentationBytes,
            addRandomSuffix: true,
          };
        }
        return {
          allowedContentTypes: imageTypes,
          maximumSizeInBytes: maxImageBytes,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "File upload could not be started.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
