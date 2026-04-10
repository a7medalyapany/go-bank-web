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

  // Revalidate so /accounts reflects the new account immediately.
  // No redirect here — the modal client component handles closing via router.back()
  // so the intercepting route is dismissed without a full navigation.
  revalidatePath("/accounts");
  return { status: "success" };
}

export async function deleteAccountAction(
  accountId: number,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    await goApi.deleteAccount(accountId);
    revalidatePath("/accounts");
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
