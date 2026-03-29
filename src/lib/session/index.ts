import { cookies } from "next/headers";
import { getIronSession, type IronSession } from "iron-session";
import { SESSION_OPTIONS, type SessionData } from "./config";

// ─── Raw session (iron-session handle)
// In Next.js 16, cookies() returns Promise — iron-session v8 accepts it directly.
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
}

// ─── Authenticated session snapshot
// Returns null → not logged in.
// Returns SessionData → logged in (with access token guaranteed fresh or best-effort).
// Handles silent token rotation transparently — callers never think about it.
export async function getAuthSession(): Promise<SessionData | null> {
  const session = await getSession();

  if (!session.user || !session.access_token) return null;

  const now = Date.now();
  const accessExpiry = new Date(session.access_token_expires_at).getTime();
  const refreshExpiry = new Date(session.refresh_token_expires_at).getTime();

  // Refresh token dead → wipe cookie, force re-login
  if (now >= refreshExpiry) {
    session.destroy();
    return null;
  }

  // Access token still has > 60 s left → return as-is (the common path)
  if (accessExpiry - now > 60_000) {
    return toSnapshot(session);
  }

  // ── Silent access-token rotation
  // POST /v1/auth/renew_access
  // Body: { refresh_token: string }
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  try {
    const res = await fetch(`${API_BASE}/v1/auth/renew_access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
      cache: "no-store",
    });

    if (!res.ok) {
      // Backend rejected the refresh (revoked session, expired, etc.) → logout
      session.destroy();
      return null;
    }

    // Go backend /v1/auth/renew_access response shape:
    // { access_token, access_token_expires_at }
    // Note: refresh token is NOT rotated on renew — same refresh token is reused
    // until it expires. This matches the Go session-store model.
    const data: {
      accessToken: string;
      accessTokenExpiresAt: string;
    } = await res.json();

    session.access_token = data.accessToken;
    session.access_token_expires_at = data.accessTokenExpiresAt;
    await session.save();

    return toSnapshot(session);
  } catch {
    // Network blip — don't destroy session, let the upstream call fail naturally
    return toSnapshot(session);
  }
}

// ─── Persist a new session (called once after login)
export async function saveSession(data: SessionData): Promise<void> {
  const session = await getSession();
  Object.assign(session, data);
  await session.save();
}

// ─── Destroy session (logout)
// session.destroy() is sync in iron-session v8.
// The cleared cookie header is written into the response automatically.
export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}

// ─── Private helper
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

