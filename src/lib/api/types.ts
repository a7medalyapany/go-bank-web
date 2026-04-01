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
// The proto field name becomes the JSON key, so ListAccountsResponse { repeated Account accounts }
// serialises to { "accounts": [...] }.
export interface GoAccountListResponse {
  accounts: GoAccount[];
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
