"use server";

import { redirect } from "next/navigation";
import { registerSchema, ActionState } from "@/lib/validation/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ─── Register Action

export async function registerAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    username: formData.get("username"),
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<string, string[]>> = {};
    for (const [field, errors] of Object.entries(
      parsed.error.flatten().fieldErrors,
    )) {
      fieldErrors[field] = errors;
    }
    return {
      status: "error",
      message: "Please fix the errors below.",
      fieldErrors,
    };
  }

  try {
    const res = await fetch(`${API_BASE}/v1/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message =
        res.status === 403
          ? "Username or email is already taken."
          : (body?.message ?? "Registration failed. Please try again.");
      return { status: "error", message };
    }
  } catch {
    return {
      status: "error",
      message: "Network error — could not reach the server.",
    };
  }

  redirect("/login?registered=1");
}
