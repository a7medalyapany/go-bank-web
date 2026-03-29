// ─── GoBank API Client
// Server-side ONLY. Never import from a "use client" component.
// All requests are authenticated via Bearer token from the active session.

import { getAuthSession, destroySession } from "@/lib/session";
import type { GoUser, GoAccount, GoTransferResult } from "@/lib/api/types";

// Re-export types so callers can import from one place
export type {
  GoRegisterResponse,
  GoUser,
  GoLoginResponse,
  GoRenewAccessResponse,
  GoAccount,
  GoEntry,
  GoTransferResult,
} from "@/lib/api/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

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

// ─── Core authenticated fetch
// All errors surface as AuthError or ApiError — never raw fetch errors.
type FetchOpts = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
  timeoutMs?: number;
};

async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { timeoutMs = 8_000, ...fetchOpts } = opts;

  const auth = await getAuthSession();
  if (!auth) throw new AuthError();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...fetchOpts,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.access_token}`,
        ...fetchOpts.headers,
      },
      cache: "no-store",
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new ApiError(408, "Request timed out. Please try again.");
    }
    throw new ApiError(0, "Network error — could not reach the server.");
  } finally {
    clearTimeout(timer);
  }

  // getAuthSession() already attempted token renewal.
  // A 401 here means the session is truly dead.
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

// ─── GoBank API surface
export const goApi = {
  // ── Users
  // POST /v1/users — PUBLIC, called directly in registerAction (no auth needed)

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

  // ── Auth
  // POST /v1/auth/login      — PUBLIC, called in loginAction
  // POST /v1/auth/renew_access — called inside getAuthSession() only

  // ── Accounts
  // POST /v1/accounts require auth
  createAccount: (currency: "USD" | "EUR" | "EGP") =>
    apiFetch<GoAccount>("/v1/accounts", {
      method: "POST",
      body: JSON.stringify({ currency }),
    }),

  // GET /v1/accounts require auth — paginated
  listAccounts: (page_id = 1, page_size = 10) =>
    apiFetch<GoAccount[]>(
      `/v1/accounts?page_id=${page_id}&page_size=${page_size}`,
    ),

  // GET /v1/accounts/:id require auth
  getAccount: (id: number) => apiFetch<GoAccount>(`/v1/accounts/${id}`),

  // PUT /v1/accounts/:id require auth — update balance (backend-controlled)
  updateAccount: (id: number, balance: number) =>
    apiFetch<GoAccount>(`/v1/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify({ balance }),
    }),

  // DELETE /v1/accounts/:id require auth
  deleteAccount: (id: number) =>
    apiFetch<void>(`/v1/accounts/${id}`, { method: "DELETE" }),

  // ── Transfers
  // POST /v1/transfers require auth
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
