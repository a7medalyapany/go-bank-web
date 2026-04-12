// ─── GoBank API Client
// Server-side ONLY. Never import from a "use client" component.
// All authenticated requests go through apiFetch (Bearer token from session).
// Unauthenticated public endpoints go through goPublicApi (no token).

import { getAuthSession, destroySession } from "@/lib/session";
import type {
  GoUser,
  GoAccount,
  GoAccountListResponse,
  GoActivityEntryListResponse,
  GoTransferResult,
  GoAccountLookupResponse,
} from "@/lib/api/types";

// Re-export types so callers can import from one place
export type {
  GoRegisterResponse,
  GoUser,
  GoLoginResponse,
  GoRenewAccessResponse,
  GoAccount,
  GoAccountListResponse,
  GoActivityEntry,
  GoActivityEntryListResponse,
  GoEntry,
  GoTransferResult,
  GoAccountLookupResponse,
} from "@/lib/api/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const DEFAULT_TIMEOUT_MS = 8_000;

// ─── Error types
export class AuthError extends Error {
  constructor(message = "Unauthorized — please sign in again.") {
    super(message);
    this.name = "AuthError";
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly raw: unknown = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Internal: raw fetch with timeout
async function timedFetch(
  url: string,
  init: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new ApiError(408, "Request timed out. Please try again.");
    }
    throw new ApiError(0, "Network error — could not reach the server.");
  } finally {
    clearTimeout(timer);
  }
}

// ─── Core authenticated fetch
type FetchOpts = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
  timeoutMs?: number;
};

async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOpts } = opts;

  const auth = await getAuthSession();
  if (!auth) throw new AuthError();

  const res = await timedFetch(
    `${API_BASE}${path}`,
    {
      ...fetchOpts,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.access_token}`,
        ...fetchOpts.headers,
      },
      cache: "no-store",
    },
    timeoutMs,
  );

  if (res.status === 401) {
    await destroySession();
    throw new AuthError();
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new ApiError(
      res.status,
      body?.message ?? `Request failed (${res.status})`,
      body,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Core public fetch (no auth token)
async function publicFetch<T>(
  path: string,
  init: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<
  { ok: true; data: T } | { ok: false; status: number; message: string }
> {
  let res: Response;
  try {
    res = await timedFetch(
      `${API_BASE}${path}`,
      { ...init, cache: "no-store" },
      timeoutMs,
    );
  } catch (err) {
    const ae = err as ApiError;
    return { ok: false, status: ae.status, message: ae.message };
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    return {
      ok: false,
      status: res.status,
      message: body.message ?? `Request failed (${res.status})`,
    };
  }

  const data: T = await res.json();
  return { ok: true, data };
}

// ─── Public API surface (no authentication required)
export const goPublicApi = {
  verifyEmail: (emailId: string, secretCode: string) =>
    publicFetch<{ message?: string }>(
      `/v1/verify_email?email_id=${encodeURIComponent(emailId)}&secret_code=${encodeURIComponent(secretCode)}`,
      { method: "GET" },
    ),
};

// ─── Authenticated API surface
export const goApi = {
  // ── Users
  getUser: (username: string) => apiFetch<GoUser>(`/v1/users/${username}`),

  updateUser: (
    body: Partial<{
      fullName: string;
      email: string;
      password: string;
      old_password: string;
    }>,
  ) =>
    apiFetch<GoUser>("/v1/users", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  // ── Accounts
  createAccount: (currency: "USD" | "EUR" | "EGP") =>
    apiFetch<GoAccount>("/v1/accounts", {
      method: "POST",
      body: JSON.stringify({ currency }),
    }),

  // Returns the gRPC-Gateway envelope { accounts: GoAccount[] }.
  // Callers must unwrap — use the unwrapAccounts() helper in dashboard-snapshot.ts.
  listAccounts: (page_id = 1, page_size = 10) =>
    apiFetch<GoAccountListResponse>(
      `/v1/accounts?page_id=${page_id}&page_size=${page_size}`,
    ),

  getAccount: (id: number) => apiFetch<GoAccount>(`/v1/accounts/${id}`),

  // ── Account Lookup (for transfers — returns minimal public info)
  // GET /v1/accounts/lookup?id=<id>
  // Returns id, owner, currency — does NOT require the account to belong to caller.
  lookupAccount: (id: number) =>
    apiFetch<GoAccountLookupResponse>(`/v1/accounts/lookup?id=${id}`),

  listEntries: (page_id = 1, page_size = 5) =>
    apiFetch<GoActivityEntryListResponse>(
      `/v1/entries?page_id=${page_id}&page_size=${page_size}`,
    ),

  updateAccount: (id: number, balance: number) =>
    apiFetch<GoAccount>(`/v1/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify({ balance }),
    }),

  deleteAccount: (id: number) =>
    apiFetch<void>(`/v1/accounts/${id}`, { method: "DELETE" }),

  // ── Transfers
  createTransfer: (body: {
    from_account_id: number;
    to_account_id: number;
    amount: number;
    currency: string;
  }) =>
    apiFetch<GoTransferResult>("/v1/transfers", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
