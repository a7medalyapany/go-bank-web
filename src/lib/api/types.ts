// ─── GoBank API Types
// All gRPC-Gateway / protobuf response shapes live here.
// Keep this file import-free — it's pure TypeScript interfaces.
// gRPC-Gateway serialises google.protobuf.Timestamp → RFC 3339 strings.

// ── POST /v1/users
export interface GoRegisterResponse {
  username: string;
  fullName: string;
  email: string;
  isEmailVerified: boolean;
  passwordChangedAt: string; // RFC 3339
  createdAt: string; // RFC 3339
}

// ── *pb.User (shared shape across multiple endpoints)
export interface GoUser {
  username: string;
  fullName: string;
  email: string;
  isEmailVerified: boolean;
  passwordChangedAt: string; // RFC 3339 — zero value = "0001-01-01T00:00:00Z"
  createdAt: string; // RFC 3339
}

// ── POST /v1/auth/login
export interface GoLoginResponse {
  sessionId: string; // UUID
  accessToken: string;
  accessTokenExpiresAt: string; // RFC 3339
  refreshToken: string;
  refreshTokenExpiresAt: string; // RFC 3339
  user: GoUser;
}

// ── POST /v1/auth/renew_access
// Only the access token is returned — the refresh token is NOT rotated.
export interface GoRenewAccessResponse {
  accessToken: string;
  accessTokenExpiresAt: string; // RFC 3339
}

// ── GET /v1/accounts | POST /v1/accounts | GET /v1/accounts/:id
export interface GoAccount {
  id: number;
  owner: string;
  balance: number; // integer cents (int64) — NEVER treat as float
  currency: "USD" | "EUR" | "EGP";
  createdAt: string; // RFC 3339
}

// ── GET /v1/accounts (list) — gRPC-Gateway wraps repeated fields in an envelope.
export interface GoAccountListResponse {
  accounts: GoAccount[];
}

// ── GET /v1/accounts/lookup — minimal public account info (for transfer destination)
// Does NOT include balance — intentionally lightweight for recipient lookup.
export interface GoAccountLookup {
  id: number; // int64 serialised as string in JSON — we parse it
  owner: string;
  currency: string;
}

export interface GoAccountLookupResponse {
  account: GoAccountLookup;
}

export interface GoActivityEntry {
  id: number | string;
  accountId?: number | string;
  account_id?: number | string;
  amount: number | string;
  currency: string;
  createdAt?: string;
  created_at?: string;
  transferId?: number | string | null;
  transfer_id?: number | string | null;
  counterpartAccountId?: number | string | null;
  counterpart_account_id?: number | string | null;
  counterpartOwner?: string | null;
  counterpart_owner?: string | null;
  counterpartCurrency?: string | null;
  counterpart_currency?: string | null;
}

export interface GoActivityEntryListResponse {
  entries: GoActivityEntry[];
}

// ── POST /v1/transfers
export interface GoEntry {
  id: number;
  account_id: number;
  amount: number; // negative = debit, positive = credit
  createdAt: string;
}

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
