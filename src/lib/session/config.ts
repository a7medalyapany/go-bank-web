import type { SessionOptions } from "iron-session";

// ─── Session Data Shape
// Sealed inside one AES-256-CBC + HMAC-SHA256 encrypted httpOnly cookie.
// Nothing here ever reaches client JS.
export interface SessionData {
  // Subset of *pb.User — exact fields depend on user.proto.
  user: {
    username: string;
    full_name: string;
    email: string;
    is_email_verified: boolean;
  };
  // From LoginUserResponse (rpc_login_user.pb.go):
  session_id: string; // plain UUID string
  access_token: string;
  // google.protobuf.Timestamp → gRPC-Gateway serialises to RFC 3339:
  // e.g. "2025-01-15T10:30:00Z" — directly parseable with new Date()
  access_token_expires_at: string;
  refresh_token: string;
  refresh_token_expires_at: string;
}

// ─── iron-session Options
// PASSWORD must be ≥ 32 chars (SESSION_SECRET env var).
// Cookie TTL matches the refresh token lifetime (24 h).
export const SESSION_OPTIONS: SessionOptions = {
  cookieName: "gobank_sid",
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 h — matches REFRESH_TOKEN_DURATION in app.env
    path: "/",
  },
};
