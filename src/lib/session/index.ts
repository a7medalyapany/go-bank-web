import "server-only";

import { cookies } from "next/headers";
import { getIronSession, type IronSession } from "iron-session";
import { SESSION_OPTIONS, type SessionData } from "./config";

// ─── Shared constants
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const RENEW_TIMEOUT_MS = 5_000;

// ─── Raw session handle
// In Next.js 16, cookies() returns a Promise — iron-session v8 accepts it directly.
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
}

// ─── Authenticated session snapshot
// Returns null       → not logged in / session expired.
// Returns SessionData → logged in (access token guaranteed fresh or best-effort).
// Handles silent token rotation transparently — callers never deal with it.
export async function getAuthSession(): Promise<SessionData | null> {
  const session = await getSession();

  if (!session.user || !session.access_token) return null;

  const now = Date.now();
  const accessExpiry = new Date(session.access_token_expires_at).getTime();
  const refreshExpiry = new Date(session.refresh_token_expires_at).getTime();

  // Refresh token dead → wipe cookie and force re-login
  if (now >= refreshExpiry) {
    session.destroy();
    await session.save(); // flush the cleared Set-Cookie header
    return null;
  }

  // Access token still has > 60 s left → fast path, no network call
  if (accessExpiry - now > 60_000) {
    return toSnapshot(session);
  }

  // ── Silent access-token rotation
  // POST /v1/auth/renew_access — { refresh_token } → { accessToken, accessTokenExpiresAt }
  // The refresh token is NOT rotated on renew (matches the Go session-store model).
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RENEW_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}/v1/auth/renew_access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      // Backend rejected the refresh (revoked, expired, etc.) → force logout
      session.destroy();
      await session.save();
      return null;
    }

    const data: { accessToken: string; accessTokenExpiresAt: string } =
      await res.json();

    session.access_token = data.accessToken;
    session.access_token_expires_at = data.accessTokenExpiresAt;
    await session.save();

    return toSnapshot(session);
  } catch {
    // Network blip — don't destroy the session, let upstream calls fail naturally.
    // The user's next request will retry renewal automatically.
    return toSnapshot(session);
  } finally {
    clearTimeout(timer);
  }
}

// ─── Persist a new session (called once after a successful login)
export async function saveSession(data: SessionData): Promise<void> {
  const session = await getSession();
  // Assign only known SessionData keys to avoid sealing unexpected fields.
  session.user = data.user;
  session.session_id = data.session_id;
  session.access_token = data.access_token;
  session.access_token_expires_at = data.access_token_expires_at;
  session.refresh_token = data.refresh_token;
  session.refresh_token_expires_at = data.refresh_token_expires_at;
  await session.save();
}

// ─── Destroy session (logout)
// session.destroy() clears the in-memory data synchronously.
// session.save() flushes the cleared Set-Cookie header into the response.
export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
  await session.save();
}

// ─── Private: plain-object snapshot from iron-session proxy
function toSnapshot(s: IronSession<SessionData>): SessionData {
  return {
    user: s.user,
    access_token: s.access_token,
    access_token_expires_at: s.access_token_expires_at,
    refresh_token: s.refresh_token,
    refresh_token_expires_at: s.refresh_token_expires_at,
    session_id: s.session_id,
  };
}
