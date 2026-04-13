"use server";

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

  redirect("/login?registered=1");
}

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

  const safe =
    callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/dashboard";

  redirect(safe);
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
