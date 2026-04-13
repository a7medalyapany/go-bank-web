import "server-only";

import { getSession } from "@/lib/session";
import type { SessionData } from "@/lib/session/config";

/**
 * Patches specific fields in the current session cookie without invalidating
 * the access/refresh tokens. Call this after any PATCH /v1/users so the
 * sidebar and header immediately reflect the new data without requiring logout.
 *
 * Only the fields provided in `patch` are overwritten; everything else
 * (tokens, session_id, expiry timestamps) is preserved as-is.
 */
export async function patchSessionUser(
  patch: Partial<SessionData["user"]>,
): Promise<void> {
  const session = await getSession();
  if (!session.user) return; // no session to patch

  session.user = { ...session.user, ...patch };
  await session.save();
}
