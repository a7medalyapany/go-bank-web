// src/lib/actions/settings.ts
"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/lib/session";
import { goApi, ApiError } from "@/lib/api/client";
import type { ActionState } from "@/lib/validation/auth";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "@/lib/validation/settings";

// ─── Shared gRPC-Gateway error parser
function parseBackendMessage(err: ApiError): string {
  const raw = err.raw as { message?: string; details?: unknown[] } | null;
  return raw?.message ?? err.message ?? "An unexpected error occurred.";
}

// ─── Field-level error mapper for 400 responses
function map400ToFieldErrors(raw: string): {
  fieldErrors?: Record<string, string[]>;
  message: string;
} {
  const lower = raw.toLowerCase();

  if (lower.includes("email")) {
    return {
      fieldErrors: { email: [raw] },
      message: "Please fix the errors below.",
    };
  }
  if (
    lower.includes("full_name") ||
    lower.includes("fullname") ||
    lower.includes("name")
  ) {
    return {
      fieldErrors: { fullName: [raw] },
      message: "Please fix the errors below.",
    };
  }
  if (lower.includes("password")) {
    return {
      fieldErrors: { password: [raw] },
      message: "Please fix the errors below.",
    };
  }

  return {
    message:
      "The server rejected the request. Make sure all fields meet the requirements.",
  };
}

// ─── Shared API error handler
function handleApiError(err: unknown): ActionState {
  if (err instanceof ApiError) {
    const backendMessage = parseBackendMessage(err);

    if (err.status === 400) {
      return { status: "error", ...map400ToFieldErrors(backendMessage) };
    }
    if (err.status === 409) {
      return {
        status: "error",
        message: "Please fix the errors below.",
        fieldErrors: {
          email: ["This email address is already in use by another account."],
        },
      };
    }
    if (err.status === 401) {
      return {
        status: "error",
        message: "Your session has expired. Please sign in again.",
      };
    }
    if (err.status === 403) {
      return {
        status: "error",
        message: "You are not authorised to perform this action.",
      };
    }
    if (err.status === 404) {
      return {
        status: "error",
        message: "User not found. Please sign out and back in.",
      };
    }
    if (err.status >= 500) {
      return {
        status: "error",
        message: "Something went wrong on our end. Please try again shortly.",
      };
    }
    return { status: "error", message: backendMessage };
  }
  return {
    status: "error",
    message: "An unexpected error occurred. Please try again.",
  };
}

// ─── Update Profile
// PATCH /v1/users — requires `username` to identify who to update.
// The backend Go handler checks: authPayload.Username == req.GetUsername()
// Without sending username, the backend fails with "invalid parameters".
export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Get the authenticated session to extract the username.
  // This is the source of truth — we never trust a client-supplied username.
  const session = await getAuthSession();
  if (!session) {
    return {
      status: "error",
      message: "Your session has expired. Please sign in again.",
    };
  }

  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
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

  const { fullName, email } = parsed.data;

  // Read baseline values embedded as hidden inputs by the form.
  // We diff against these so we only send what actually changed.
  const currentFullName =
    (formData.get("_currentFullName") as string | null)?.trim() ?? "";
  const currentEmail =
    (formData.get("_currentEmail") as string | null)?.trim() ?? "";

  // Build the patch — only include fields that actually changed.
  const patch: { username: string; fullName?: string; email?: string } = {
    // username is ALWAYS required by the backend to identify the user.
    username: session.user.username,
  };

  if (fullName.trim() !== currentFullName) patch.fullName = fullName.trim();
  if (email.trim() !== currentEmail) patch.email = email.trim();

  // If nothing changed beyond username, return success without a network call.
  if (!patch.fullName && !patch.email) {
    return { status: "success" };
  }

  try {
    await goApi.updateUser(patch);
    revalidatePath("/settings");
    revalidatePath("/dashboard"); // sidebar shows user.full_name
    return { status: "success" };
  } catch (err) {
    return handleApiError(err);
  }
}

// ─── Change Password
// PATCH /v1/users — requires `username` alongside the new password.
// The backend validates: username matches auth token, password >= 8 chars.
export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getAuthSession();
  if (!session) {
    return {
      status: "error",
      message: "Your session has expired. Please sign in again.",
    };
  }

  const parsed = changePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
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
    // Send username + password — the backend requires both.
    await goApi.updateUser({
      username: session.user.username,
      password: parsed.data.password,
    });
    revalidatePath("/settings/security");
    return { status: "success" };
  } catch (err) {
    return handleApiError(err);
  }
}
