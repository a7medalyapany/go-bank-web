"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/lib/session";
import { goApi, ApiError } from "@/lib/api/client";
import { patchSessionUser } from "@/lib/session/refresh";
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
// After a successful update we also patch the session cookie so the sidebar
// reflects the new name/email immediately without requiring logout.
export async function updateProfileAction(
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

  const currentFullName =
    (formData.get("_currentFullName") as string | null)?.trim() ?? "";
  const currentEmail =
    (formData.get("_currentEmail") as string | null)?.trim() ?? "";

  const patch: { username: string; fullName?: string; email?: string } = {
    username: session.user.username,
  };

  if (fullName.trim() !== currentFullName) patch.fullName = fullName.trim();
  if (email.trim() !== currentEmail) patch.email = email.trim();

  // Nothing changed — short-circuit without a network call.
  if (!patch.fullName && !patch.email) {
    return { status: "success" };
  }

  try {
    await goApi.updateUser(patch);

    // FIX: Patch the session cookie so the sidebar shows the new data
    // immediately. Without this, the old name/email persists until logout.
    const sessionPatch: Partial<{ full_name: string; email: string }> = {};
    if (patch.fullName) sessionPatch.full_name = patch.fullName;
    if (patch.email) sessionPatch.email = patch.email;
    await patchSessionUser(sessionPatch);

    // Revalidate all pages that display user data from the session.
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/", "layout"); // sidebar lives in the dashboard layout

    return { status: "success" };
  } catch (err) {
    return handleApiError(err);
  }
}

// ─── Change Password
// PATCH /v1/users — requires `username` alongside the new password.
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
