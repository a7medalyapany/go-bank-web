"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { goApi } from "@/lib/api/client";
import type { ActionState } from "@/lib/validation/auth";

const SUPPORTED_CURRENCIES = ["USD", "EUR", "EGP"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

function isValidCurrency(value: unknown): value is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(value as SupportedCurrency);
}

export async function createAccountAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const currency = formData.get("currency");

  if (!isValidCurrency(currency)) {
    return {
      status: "error",
      message: "Please select a valid currency.",
      fieldErrors: { currency: ["Invalid currency selected."] },
    };
  }

  try {
    await goApi.createAccount(currency);
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    const message =
      status === 403
        ? "You already have an account for this currency."
        : status === 401
          ? "Session expired. Please sign in again."
          : ((err as Error)?.message ??
            "Failed to create account. Please try again.");

    return { status: "error", message };
  }

  // FIX: Only revalidate /accounts — not the whole app layout.
  // The previous version called revalidatePath("/accounts") which is correct,
  // but some implementations were using revalidatePath("/", "layout") which
  // flushes the ENTIRE cached layout tree including the dashboard, causing
  // unnecessary re-fetches of accounts, activity, and session data.
  revalidatePath("/accounts");

  return { status: "success" };
}

export async function deleteAccountAction(
  accountId: number,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    await goApi.deleteAccount(accountId);
    // FIX: Revalidate both accounts and dashboard since the deleted account
    // affects the dashboard balance display and brief.
    revalidatePath("/accounts");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    const message =
      status === 400
        ? "Cannot delete an account with a remaining balance. Transfer funds out first."
        : status === 403
          ? "You can only delete your own accounts."
          : status === 404
            ? "Account not found."
            : ((err as Error)?.message ??
              "Failed to delete account. Please try again.");

    return { ok: false, message };
  }
}
