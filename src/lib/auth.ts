import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/session";
import type { SessionData } from "@/lib/session/config";

// ─── requireAuth
// Drop-in replacement for the boilerplate in every protected page.
// Centralises the redirect logic so changing it later is one-line.
//
// Usage:
//   const session = await requireAuth("/dashboard");
//
// callbackUrl defaults to "/dashboard" if omitted.
export async function requireAuth(
  callbackUrl = "/dashboard",
): Promise<SessionData> {
  const session = await getAuthSession();
  if (!session) {
    const params = new URLSearchParams({ callbackUrl });
    redirect(`/login?${params.toString()}`);
  }
  return session;
}
