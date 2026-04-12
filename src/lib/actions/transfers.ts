"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { goApi, ApiError } from "@/lib/api/client";
import type { ActionState } from "@/lib/validation/auth";
import type { GoTransferResult } from "@/lib/api/types";

export interface TransferInput {
  fromAccountId: number;
  toAccountId: number;
  amount: number; // in major currency unit (dollars), e.g. 10.50
  currency: string;
}

export type TransferActionState = ActionState<{ transferId: number }>;

// ─── Perform Transfer
// POST /v1/transfers — authenticated.
// amount is in major currency unit per the Swagger spec.
export async function createTransferAction(
  input: TransferInput,
): Promise<TransferActionState> {
  // Validate input defensively on the server too
  if (!input.fromAccountId || !input.toAccountId) {
    return { status: "error", message: "Invalid account selection." };
  }
  if (input.fromAccountId === input.toAccountId) {
    return { status: "error", message: "Cannot transfer to the same account." };
  }
  if (!input.amount || input.amount <= 0) {
    return { status: "error", message: "Amount must be greater than zero." };
  }
  if (!input.currency) {
    return { status: "error", message: "Currency is required." };
  }

  try {
    const result: GoTransferResult = await goApi.createTransfer({
      from_account_id: input.fromAccountId,
      to_account_id: input.toAccountId,
      amount: input.amount,
      currency: input.currency,
    });

    // Revalidate pages that display account balances/activity
    revalidatePath("/dashboard");
    revalidatePath("/accounts");
    revalidatePath("/transfers");

    return {
      status: "success",
      data: { transferId: result.transfer.id },
    };
  } catch (err) {
    if (err instanceof ApiError) {
      const message = getTransferErrorMessage(err.status, err.message);
      return { status: "error", message };
    }
    return {
      status: "error",
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

function getTransferErrorMessage(status: number, raw: string): string {
  switch (status) {
    case 400:
      // Could be insufficient balance or currency mismatch
      if (raw.toLowerCase().includes("insufficient")) {
        return "Insufficient balance to complete this transfer.";
      }
      if (raw.toLowerCase().includes("currency")) {
        return "Currency mismatch — both accounts must hold the same currency.";
      }
      return raw || "Invalid transfer request. Please check the details.";
    case 401:
      return "Session expired. Please sign in again.";
    case 403:
      return "You are not authorised to transfer from this account.";
    case 404:
      return "One or more accounts were not found. Please verify the account ID.";
    case 408:
      return "Request timed out. Please try again.";
    case 500:
      return "Server error. Please try again in a moment.";
    default:
      return raw || "Transfer failed. Please try again.";
  }
}
