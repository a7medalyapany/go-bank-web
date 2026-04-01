import "server-only";

import { cache } from "react";

import { goApi } from "@/lib/api/client";
import type { GoAccount } from "@/lib/api/types";
import { requireAuth } from "@/lib/auth";
import { buildDashboardPageViewModel } from "@/lib/dashboard/view-models";

export type { GoAccount };

// ─── Unwrap gRPC-Gateway list envelope
// Backend returns { "accounts": [...] }, NOT a bare array.
// We handle both shapes defensively in case the gateway config changes.
export function unwrapAccounts(raw: unknown): GoAccount[] {
  if (Array.isArray(raw)) return raw as GoAccount[];
  if (raw !== null && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    for (const key of ["accounts", "data", "items", "result", "results"]) {
      if (Array.isArray(obj[key])) return obj[key] as GoAccount[];
    }
  }
  return [];
}

// ─── Fetch accounts for the dashboard
// Degrades to [] on any error — the UI handles the empty state.
export async function fetchDashboardAccounts(): Promise<GoAccount[]> {
  try {
    const raw = (await goApi.listAccounts(1, 3)) as unknown;
    return unwrapAccounts(raw);
  } catch {
    return [];
  }
}

export const getDashboardPageData = cache(async () => {
  const session = await requireAuth("/dashboard");
  const accounts = await fetchDashboardAccounts();

  return buildDashboardPageViewModel(
    accounts,
    session.user.full_name,
    session.user.is_email_verified,
  );
});
