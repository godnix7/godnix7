import "server-only";
import { createHash } from "node:crypto";
import { compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { neon } from "@neondatabase/serverless";

const cookieName = "portfolio_admin_session";
const sessionDurationSeconds = 60 * 60 * 24 * 7;

function getSessionKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters.");
  return new TextEncoder().encode(secret);
}

function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");
  return neon(connectionString);
}

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD_HASH && process.env.SESSION_SECRET && process.env.DATABASE_URL);
}

export async function createAdminSession(username: string) {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime(`${sessionDurationSeconds}s`)
    .sign(getSessionKey());

  const store = await cookies();
  store.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: sessionDurationSeconds,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(cookieName);
}

export async function getAdminSession() {
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSessionKey(), { algorithms: ["HS256"] });
    if (payload.role !== "admin" || typeof payload.sub !== "string" || payload.sub !== process.env.ADMIN_USERNAME) return null;
    return { username: payload.sub };
  } catch {
    return null;
  }
}

export function requestOriginIsValid(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function hashClientAddress(address: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters.");
  return createHash("sha256").update(`${secret}:${address}`).digest("hex");
}

export async function consumeLoginAttempt(addressHash: string) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO admin_login_limits (address_hash, window_started_at, attempts, blocked_until)
    VALUES (${addressHash}, now(), 1, NULL)
    ON CONFLICT (address_hash) DO UPDATE SET
      window_started_at = CASE
        WHEN admin_login_limits.window_started_at < now() - interval '15 minutes' THEN now()
        ELSE admin_login_limits.window_started_at
      END,
      attempts = CASE
        WHEN admin_login_limits.window_started_at < now() - interval '15 minutes' THEN 1
        ELSE admin_login_limits.attempts + 1
      END,
      blocked_until = CASE
        WHEN admin_login_limits.window_started_at < now() - interval '15 minutes' THEN NULL
        WHEN admin_login_limits.attempts >= 5 THEN COALESCE(admin_login_limits.blocked_until, now() + interval '15 minutes')
        ELSE admin_login_limits.blocked_until
      END
    RETURNING attempts, blocked_until
  `;
  const blockedUntil = rows[0]?.blocked_until ? new Date(String(rows[0].blocked_until)) : null;
  return { blocked: Boolean(blockedUntil && blockedUntil.getTime() > Date.now()) };
}

export async function clearLoginAttempts(addressHash: string) {
  const sql = getSql();
  await sql`DELETE FROM admin_login_limits WHERE address_hash = ${addressHash}`;
}

export async function verifyAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedUsername || !passwordHash) return false;

  // Verify a bcrypt-shaped hash even when the username is wrong to keep the
  // response time close to the normal credential-check path.
  const passwordMatches = await compare(password, passwordHash).catch(() => false);
  return username === expectedUsername && passwordMatches;
}
