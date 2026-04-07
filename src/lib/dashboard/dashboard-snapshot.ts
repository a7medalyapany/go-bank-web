import "server-only";

import { cache } from "react";

import { goApi } from "@/lib/api/client";
import type { GoAccount, GoActivityEntry } from "@/lib/api/types";
import { requireAuth } from "@/lib/auth";
import {
  buildDashboardPageViewModel,
  type DashboardActivityEntry,
} from "@/lib/dashboard/view-models";

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

function getNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function getNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return getNumber(value);
}

function getNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return getString(value);
}

export function normalizeActivityEntry(
  raw: GoActivityEntry | Record<string, unknown>,
): DashboardActivityEntry | null {
  const id = getNumber(raw.id);
  const accountId = getNumber(raw.accountId ?? raw.account_id);
  const amount = getNumber(raw.amount);
  const currency = getString(raw.currency);
  const createdAt = getString(raw.createdAt ?? raw.created_at);

  if (
    id === null ||
    accountId === null ||
    amount === null ||
    currency === null ||
    createdAt === null
  ) {
    return null;
  }

  return {
    id,
    accountId,
    amount,
    currency,
    createdAt,
    transferId: getNullableNumber(raw.transferId ?? raw.transfer_id),
    counterpartAccountId: getNullableNumber(
      raw.counterpartAccountId ?? raw.counterpart_account_id,
    ),
    counterpartOwner: getNullableString(
      raw.counterpartOwner ?? raw.counterpart_owner,
    ),
    counterpartCurrency: getNullableString(
      raw.counterpartCurrency ?? raw.counterpart_currency,
    ),
  };
}

export function unwrapEntries(raw: unknown): DashboardActivityEntry[] {
  if (Array.isArray(raw)) {
    return raw
      .map((entry) =>
        entry !== null && typeof entry === "object"
          ? normalizeActivityEntry(entry as Record<string, unknown>)
          : null,
      )
      .filter((entry): entry is DashboardActivityEntry => entry !== null);
  }

  if (raw !== null && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    for (const key of ["entries", "data", "items", "result", "results"]) {
      if (Array.isArray(obj[key])) return unwrapEntries(obj[key]);
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

export async function fetchDashboardActivity(): Promise<DashboardActivityEntry[]> {
  try {
    const raw = (await goApi.listEntries(1, 5)) as unknown;
    return unwrapEntries(raw);
  } catch (error) {
    console.error("Failed to load dashboard activity", error);
    return [];
  }
}

export const getDashboardPageData = cache(async () => {
  const session = await requireAuth("/dashboard");
  const [accounts, activity] = await Promise.all([
    fetchDashboardAccounts(),
    fetchDashboardActivity(),
  ]);

  return buildDashboardPageViewModel(
    accounts,
    activity,
    session.user.full_name,
    session.user.is_email_verified,
  );
});
