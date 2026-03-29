// ─── GoBank API Client
// Server-side ONLY. Never import from a "use client" component.
// All requests authenticated via Bearer token from the active session.

import { getAuthSession, destroySession } from "@/lib/session";

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

// ─── Go / gRPC-Gateway response types
// gRPC-Gateway wraps errors as: { "message": "...", "code": N }
// NOT { "error": "..." } — this is a critical difference from plain REST APIs.

// POST /v1/users
export interface GoRegisterResponse {
  username: string;
  fullName: string;
  email: string;
  isEmailVerified: boolean;
  passwordChangedAt: string;
  createdAt: string;
}

// POST /v1/auth/login
// google.protobuf.Timestamp fields arrive as RFC 3339 strings via gRPC-Gateway.
export interface GoLoginResponse {
  sessionId: string; // UUID — tracks session server-side
  accessToken: string;
  accessTokenExpiresAt: string; // RFC 3339, e.g. "2025-01-15T10:30:00Z"
  refreshToken: string;
  refreshTokenExpiresAt: string; // RFC 3339
  user: GoUser; // *pb.User — see user.proto for full shape
}

// POST /v1/auth/renew_access
// Only a new access token is returned — refresh token is NOT rotated.
export interface GoRenewAccessResponse {
  accessToken: string;
  accessTokenExpiresAt: string; // RFC 3339
}

// *pb.User — exact fields from user.proto
// password_changed_at and created_at are google.protobuf.Timestamp
// gRPC-Gateway serialises them as RFC 3339 strings.
export interface GoUser {
  username: string;
  fullName: string;
  email: string;
  isEmailVerified: boolean;
  passwordChangedAt: string; // RFC 3339 — zero value = "0001-01-01T00:00:00Z"
  createdAt: string; // RFC 3339
}

// GET /v1/accounts, POST /v1/accounts, GET /v1/accounts/:id
export interface GoAccount {
  id: number;
  owner: string;
  balance: number; // integer cents (int64) — NEVER treat as float
  currency: string; // "USD" | "EUR" | "EGP"
  createdAt: string;
}

// POST /v1/transfers
export interface GoTransferResult {
  transfer: {
    id: number;
    from_account_id: number;
    to_account_id: number;
    amount: number;
    createdAt: string;
  };
  from_account: GoAccount;
  to_account: GoAccount;
  from_entry: GoEntry;
  to_entry: GoEntry;
}

export interface GoEntry {
  id: number;
  account_id: number;
  amount: number; // negative = debit, positive = credit
  createdAt: string;
}

// ─── Core authenticated fetch
type FetchOpts = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const auth = await getAuthSession();
  if (!auth) throw new AuthError();

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.access_token}`,
      ...opts.headers,
    },
    cache: "no-store",
  });

  // getAuthSession() already attempted renew — a 401 here = truly dead session
  if (res.status === 401) {
    await destroySession();
    throw new AuthError();
  }

  if (!res.ok) {
    // gRPC-Gateway error shape: { "message": "...", "code": N }
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

// ─── Complete GoBank API surface
export const goApi = {
  // ── Users
  // POST /v1/users — PUBLIC, no auth (called directly in registerAction)

  // GET /v1/users/:username require auth
  getUser: (username: string) => apiFetch<GoUser>(`/v1/users/${username}`),

  // PATCH /v1/users require auth — update full_name, email, password
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
  // POST /v1/auth/login    — PUBLIC (called directly in loginAction)
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
