"use server";

// server-only is implicit via "use server" but the explicit import provides
// a build-time error if this module is ever accidentally imported client-side.
import "server-only";

import { redirect } from "next/navigation";
import {
  registerSchema,
  loginSchema,
  extractFieldErrors,
  type ActionState,
} from "@/lib/validation/auth";
import { saveSession, destroySession } from "@/lib/session";
import type { GoLoginResponse, GoRegisterResponse } from "@/lib/api/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const FETCH_TIMEOUT = 8_000;

// ─── Shared fetch helper for PUBLIC endpoints (no auth required)
// Returns a discriminated union — callers handle errors without try/catch.
// Kept here (rather than goPublicApi) because these actions need to map
// specific HTTP status codes to user-facing ActionState messages.
async function publicFetch<T>(
  path: string,
  init: RequestInit,
): Promise<
  { ok: true; data: T } | { ok: false; status: number; message: string }
> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });

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
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      return {
        ok: false,
        status: 408,
        message: "Request timed out. Please try again.",
      };
    }
    return {
      ok: false,
      status: 0,
      message: "Network error — could not reach the server.",
    };
  } finally {
    clearTimeout(timer);
  }
}

// ─── Register
// POST /v1/users — public, no auth.
// Go backend dispatches an email verification job via Redis/Asynq after creation.
// User must login separately — register returns the user object, NOT tokens.
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
      fieldErrors: extractFieldErrors(parsed.error),
    };
  }

  const result = await publicFetch<GoRegisterResponse>("/v1/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (!result.ok) {
    const message =
      result.status === 409 || result.status === 403
        ? "Username or email is already taken."
        : result.message;
    return { status: "error", message };
  }

  // Verification email was dispatched async by Go backend.
  // Redirect to login with registered=1 so the page shows the verify-email banner.
  redirect("/login?registered=1");
}

// ─── Login
// POST /v1/auth/login — public, no auth.
// callbackUrl is bound via loginAction.bind(null, callbackUrl) in the form component.
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
      fieldErrors: extractFieldErrors(parsed.error),
    };
  }

  const result = await publicFetch<GoLoginResponse>("/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (!result.ok) {
    const message =
      result.status === 401
        ? "Invalid username or password."
        : result.status === 404
          ? "No account found with that username."
          : result.message;
    return { status: "error", message };
  }

  const data = result.data;

  // ── Persist encrypted session cookie
  // iron-session seals everything into one httpOnly AES-256-CBC cookie.
  // Access token, refresh token, expiry timestamps — none of it is accessible
  // from client JavaScript.
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

  // Guard against open redirect — only accept relative paths.
  const safe =
    callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/dashboard";

  redirect(safe);
}

// ─── Logout
// Destroys the local session cookie.
// If the Go backend adds a POST /v1/auth/logout endpoint later,
// call goApi.logout() here before destroySession().
export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
