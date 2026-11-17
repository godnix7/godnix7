import { NextResponse } from "next/server";
import { clearAdminSession, requestOriginIsValid } from "@/lib/auth";

export async function POST(request: Request) {
  if (!requestOriginIsValid(request)) return NextResponse.json({ error: "Request origin rejected." }, { status: 403 });
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
