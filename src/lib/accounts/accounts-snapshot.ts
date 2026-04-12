// ─── Shared Accounts Snapshot
// Single source of truth for the current user's accounts list.
// React's cache() ensures this runs at most ONCE per server request,
// regardless of how many RSCs import it — no redundant fetches.
//
// Usage pattern:
//   import { getAccountsSnapshot } from "@/lib/accounts/accounts-snapshot";
//   const { accounts } = await getAccountsSnapshot();
//
// This replaces duplicated goApi.listAccounts() calls across:
//   /accounts, /accounts/new (intercepted modal), /transfers

import "server-only";

import { cache } from "react";
import { goApi } from "@/lib/api/client";
import { requireAuth } from "@/lib/auth";
import type { GoAccount } from "@/lib/api/types";
import type { SupportedCurrency } from "@/lib/actions/accounts";

export type { GoAccount };

// ─── Unwrap gRPC-Gateway list envelope
// Backend returns { "accounts": [...] }, NOT a bare array.
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

export interface AccountsSnapshot {
  accounts: GoAccount[];
  usedCurrencies: SupportedCurrency[];
  availableCurrencies: SupportedCurrency[];
  canCreate: boolean;
}

const ALL_CURRENCIES: SupportedCurrency[] = ["USD", "EUR", "EGP"];
const MAX_ACCOUNTS = 3;

// ─── Cached per-request accounts fetch
// cache() from React deduplicates calls within a single server render tree.
export const getAccountsSnapshot = cache(
  async (): Promise<AccountsSnapshot> => {
    await requireAuth();

    let accounts: GoAccount[] = [];
    try {
      const raw = await goApi.listAccounts(1, 10);
      accounts = unwrapAccounts(raw);
    } catch {
      accounts = [];
    }

    const usedCurrencies = accounts.map((a) => a.currency as SupportedCurrency);
    const availableCurrencies = ALL_CURRENCIES.filter(
      (c) => !usedCurrencies.includes(c),
    );
    const canCreate = accounts.length < MAX_ACCOUNTS;

    return { accounts, usedCurrencies, availableCurrencies, canCreate };
  },
);
