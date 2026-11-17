import { NextResponse } from "next/server";
import { z } from "zod";
import {
  clearLoginAttempts,
  consumeLoginAttempt,
  createAdminSession,
  hashClientAddress,
  isAdminConfigured,
  requestOriginIsValid,
  verifyAdminCredentials,
} from "@/lib/auth";

export const runtime = "nodejs";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(120),
  password: z.string().min(1).max(1024),
});

export async function POST(request: Request) {
  if (!requestOriginIsValid(request)) return NextResponse.json({ error: "Request origin rejected." }, { status: 403 });
  if (!isAdminConfigured()) return NextResponse.json({ error: "Administrator setup is incomplete." }, { status: 503 });

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter your username and password." }, { status: 400 });

  const forwarded = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-client";
  const addressHash = hashClientAddress(forwarded);
  try {
    const { blocked } = await consumeLoginAttempt(addressHash);
    if (blocked) return NextResponse.json({ error: "Too many sign-in attempts. Try again in 15 minutes." }, { status: 429 });
    const valid = await verifyAdminCredentials(parsed.data.username, parsed.data.password);
    if (!valid) return NextResponse.json({ error: "The username or password is incorrect." }, { status: 401 });
    await clearLoginAttempts(addressHash);
    await createAdminSession(parsed.data.username);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sign-in is temporarily unavailable. Check the admin setup." }, { status: 503 });
  }
}
