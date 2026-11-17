import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { neon } from "@neondatabase/serverless";

/**
 * Single-administrator login configured only through environment variables:
 *   ADMIN_USERNAME  + ADMIN_PASSWORD        (simplest), or
 *   ADMIN_USERNAME  + ADMIN_PASSWORD_HASH   (bcrypt)
 *   SESSION_SECRET  optional; if absent, a signing key is derived from the credentials
 *                   (changing the password then signs everyone out).
 * A database is optional: with DATABASE_URL, login throttling is shared across instances;
 * without it, throttling is kept in memory per server instance.
 */
const cookieName = "portfolio_admin_session";
const sessionDurationSeconds = 60 * 60 * 24 * 7;

const sha256 = (s: string) => createHash("sha256").update(s).digest();

function getSessionKey() {
  const explicit = process.env.SESSION_SECRET;
  if (explicit && explicit.length >= 32) return new TextEncoder().encode(explicit);
  const user = process.env.ADMIN_USERNAME ?? "";
  const cred = process.env.ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD_HASH ?? "";
  if (!user || !cred) throw new Error("Admin credentials are not configured.");
  return new Uint8Array(sha256(`project-lab-session-v1:${user}:${cred}`));
}

function getSql() {
  const connectionString = process.env.DATABASE_URL;
  return connectionString ? neon(connectionString) : null;
}

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_USERNAME && (process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD_HASH));
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
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
  if (!isAdminConfigured()) return null;
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
  return createHash("sha256").update(`${Buffer.from(getSessionKey()).toString("hex")}:${address}`).digest("hex");
}

// ---------------------------------------------------------------- login throttling
const memoryAttempts = new Map<string, { start: number; attempts: number; blockedUntil: number }>();
const WINDOW_MS = 15 * 60 * 1000;

export async function consumeLoginAttempt(addressHash: string) {
  const sql = getSql();
  if (!sql) {
    const now = Date.now();
    const cur = memoryAttempts.get(addressHash);
    const entry = !cur || now - cur.start > WINDOW_MS ? { start: now, attempts: 0, blockedUntil: 0 } : cur;
    entry.attempts += 1;
    if (entry.attempts > 5 && !entry.blockedUntil) entry.blockedUntil = now + WINDOW_MS;
    memoryAttempts.set(addressHash, entry);
    return { blocked: entry.blockedUntil > now };
  }
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
  if (!sql) {
    memoryAttempts.delete(addressHash);
    return;
  }
  await sql`DELETE FROM admin_login_limits WHERE address_hash = ${addressHash}`;
}

export async function verifyAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  if (!expectedUsername) return false;
  const userOk = timingSafeEqual(sha256(username), sha256(expectedUsername));

  const plain = process.env.ADMIN_PASSWORD;
  if (plain) return userOk && timingSafeEqual(sha256(password), sha256(plain));

  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!passwordHash) return false;
  const passwordMatches = await compare(password, passwordHash).catch(() => false);
  return userOk && passwordMatches;
}
