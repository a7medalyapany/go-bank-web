"use server";

import { redirect } from "next/navigation";
import {
  registerSchema,
  loginSchema,
  type ActionState,
} from "@/lib/validation/auth";
import { saveSession, destroySession } from "@/lib/session";
import type { GoLoginResponse, GoRegisterResponse } from "@/lib/api/client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// gRPC-Gateway error shape: { "message": "...", "code": N }
function parseGrpcError(body: unknown): string {
  if (typeof body === "object" && body !== null && "message" in body) {
    return (body as { message: string }).message;
  }
  return "Something went wrong. Please try again.";
}

// ─── Register
// POST /v1/users — public, no auth.
// Go backend dispatches an email verification job via Redis/Asynq after creation.
// User must then login separately (register returns user, NOT tokens).
export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    username: formData.get("username"),
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    const res = await fetch(`${API_BASE}/v1/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      // gRPC AlreadyExists = HTTP 409 / sometimes 403 via gRPC-gateway
      const message =
        res.status === 409 || res.status === 403
          ? "Username or email is already taken."
          : parseGrpcError(body);
      return { status: "error", message };
    }

    const _user: GoRegisterResponse = await res.json(); // eslint-disable-line @typescript-eslint/no-unused-vars
  } catch {
    return {
      status: "error",
      message: "Network error — could not reach the server.",
    };
  }

  // Verification email was dispatched async by Go backend.
  // Redirect to login with a "registered" flag so the login page shows
  // a banner telling the user to check their email.
  redirect("/login?registered=1");
}

// ─── Login
// POST /v1/auth/login — public, no auth.
// callbackUrl is bound via .bind(null, callbackUrl) in the form component.
export async function loginAction(
  callbackUrl: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  let data: GoLoginResponse;

  try {
    const res = await fetch(`${API_BASE}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message =
        res.status === 401
          ? "Invalid username or password."
          : res.status === 404
            ? "No account found with that username."
            : parseGrpcError(body);
      return { status: "error", message };
    }

    data = await res.json();
  } catch {
    return {
      status: "error",
      message: "Network error — could not reach the server.",
    };
  }

  // ── Persist encrypted session cookie
  // iron-session seals everything into one httpOnly cookie with AES-256-CBC.
  // Access token, refresh token, expiry timestamps, session_id — none of it
  // is ever accessible from client JavaScript.
  await saveSession({
    user: {
      username: data.user.username,
      full_name: data.user.fullName,
      email: data.user.email,
      is_email_verified: data.user.isEmailVerified,
    },
    session_id: data.sessionId,
    access_token: data.accessToken,
    access_token_expires_at: data.accessTokenExpiresAt,
    refresh_token: data.refreshToken,
    refresh_token_expires_at: data.refreshTokenExpiresAt,
  });

  // Guard against open redirect — only accept relative paths
  const safe =
    callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/dashboard";

  redirect(safe);
}

// ─── Logout
// Destroys the local session cookie.
// Note: GoBank backend doesn't expose a dedicated logout/revoke endpoint yet
// If added later, call it here before destroySession().
export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
