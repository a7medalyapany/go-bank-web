"use client";

import { useEffect, useRef, useActionState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { createAccountAction } from "@/lib/actions/accounts";
import type { SupportedCurrency } from "@/lib/actions/accounts";
import type { ActionState } from "@/lib/validation/auth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const CURRENCY_META: Record<
  SupportedCurrency,
  { label: string; description: string; symbol: string; colorClass: string }
> = {
  USD: {
    label: "US Dollar",
    description: "International reserve currency",
    symbol: "$",
    colorClass:
      "border-gold-500/30 bg-gold-400/6 hover:border-gold-500/50 hover:bg-gold-400/10",
  },
  EUR: {
    label: "Euro",
    description: "European monetary union",
    symbol: "€",
    colorClass:
      "border-silver-400/25 bg-silver-300/5 hover:border-silver-400/40 hover:bg-silver-300/10",
  },
  EGP: {
    label: "Egyptian Pound",
    description: "Cairo local account",
    symbol: "E£",
    colorClass:
      "border-obsidian-500 bg-obsidian-800/60 hover:border-obsidian-400 hover:bg-obsidian-700/60",
  },
};

const INITIAL: ActionState = { status: "idle" };

interface CreateAccountModalProps {
  availableCurrencies: SupportedCurrency[];
  limitReached: boolean;
}

export function CreateAccountModal({
  availableCurrencies,
  limitReached,
}: CreateAccountModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, pending] = useActionState(
    createAccountAction,
    INITIAL,
  );

  // Open on mount
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Close on ESC (native dialog handles it, we wire router.back)
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = () => router.back();
    el.addEventListener("cancel", handler);
    return () => el.removeEventListener("cancel", handler);
  }, [router]);

  // Close backdrop click
  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) router.back();
  }

  const globalError = state.status === "error" ? state.message : undefined;

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className={cn(
        "fixed inset-0 m-0 h-full w-full max-w-none max-h-none p-0",
        "bg-transparent backdrop:bg-obsidian-950/70 backdrop:backdrop-blur-sm",
        "open:flex open:items-center open:justify-center",
        // animate in
        "open:animate-fade-in",
      )}
    >
      <div
        className="relative w-full max-w-md rounded-[28px] border border-obsidian-600 bg-obsidian-900 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.6)] animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-xl border border-obsidian-600 bg-obsidian-800 text-ash-500 transition-colors hover:border-obsidian-500 hover:text-ash-200"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-6 pr-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/20 bg-gold-400/8">
            <Plus className="h-4 w-4 text-gold-400" />
          </div>
          <h2 className="mt-4 font-display text-2xl text-ash-50">
            Open an account
          </h2>
          <p className="mt-1.5 text-sm text-ash-500">
            {limitReached
              ? "You've reached the 3-account limit."
              : "Choose a currency for your new account."}
          </p>
        </div>

        {limitReached ? (
          <div className="rounded-xl border border-obsidian-600 bg-obsidian-800/60 px-4 py-4 text-sm text-ash-400">
            All supported currencies (USD, EUR, EGP) already have accounts.
          </div>
        ) : (
          <>
            {globalError && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
              >
                {globalError}
              </div>
            )}

            <form action={formAction} className="space-y-3">
              <fieldset disabled={pending}>
                <legend className="sr-only">Select currency</legend>

                {availableCurrencies.map((currency) => {
                  const meta = CURRENCY_META[currency];
                  return (
                    <label
                      key={currency}
                      className={cn(
                        "flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all duration-200",
                        meta.colorClass,
                        "has-[:checked]:ring-2 has-[:checked]:ring-gold-500/40",
                      )}
                    >
                      <input
                        type="radio"
                        name="currency"
                        value={currency}
                        required
                        className="sr-only"
                      />
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/4 font-display text-lg text-ash-200">
                        {meta.symbol}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ash-100">
                          {meta.label}
                        </p>
                        <p className="text-xs text-ash-500">
                          {meta.description}
                        </p>
                      </div>
                      <span className="font-mono text-xs uppercase tracking-[0.2em] text-ash-500">
                        {currency}
                      </span>
                    </label>
                  );
                })}
              </fieldset>

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={pending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="flex-1"
                  loading={pending}
                >
                  {pending ? "Creating…" : "Open account"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}
