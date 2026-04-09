"use client";

import { useActionState } from "react";
import { createAccountAction } from "@/lib/actions/accounts";
import type { SupportedCurrency } from "@/lib/actions/accounts";
import type { ActionState } from "@/lib/validation/auth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const CURRENCY_META: Record<
  SupportedCurrency,
  { label: string; description: string; symbol: string; color: string }
> = {
  USD: {
    label: "US Dollar",
    description: "International reserve currency",
    symbol: "$",
    color:
      "border-gold-500/30 bg-gold-400/6 hover:border-gold-500/50 hover:bg-gold-400/10",
  },
  EUR: {
    label: "Euro",
    description: "European monetary union",
    symbol: "€",
    color:
      "border-silver-400/25 bg-silver-300/5 hover:border-silver-400/40 hover:bg-silver-300/10",
  },
  EGP: {
    label: "Egyptian Pound",
    description: "Cairo local account",
    symbol: "E£",
    color:
      "border-obsidian-500 bg-obsidian-800/60 hover:border-obsidian-400 hover:bg-obsidian-700/60",
  },
};

const INITIAL: ActionState = { status: "idle" };

interface CreateAccountFormProps {
  availableCurrencies: SupportedCurrency[];
}

export function CreateAccountForm({
  availableCurrencies,
}: CreateAccountFormProps) {
  const [state, formAction, pending] = useActionState(
    createAccountAction,
    INITIAL,
  );

  const globalError = state.status === "error" ? state.message : undefined;

  return (
    <div className="rounded-[28px] border border-obsidian-700 bg-obsidian-900/80 p-7 shadow-card">
      <div className="mb-6">
        <h2 className="font-display text-2xl text-ash-50">Choose a currency</h2>
        <p className="mt-1.5 text-sm text-ash-500">
          Each account holds one currency. You can open up to 3 accounts total.
        </p>
      </div>

      {globalError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
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
                  meta.color,
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
                  <p className="text-xs text-ash-500">{meta.description}</p>
                </div>
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-ash-500">
                  {currency}
                </div>
              </label>
            );
          })}
        </fieldset>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={pending}
          className="mt-2"
        >
          {pending ? "Creating…" : "Open account"}
        </Button>
      </form>
    </div>
  );
}
