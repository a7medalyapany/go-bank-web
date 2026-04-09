import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

import { requireAuth } from "@/lib/auth";
import { goApi } from "@/lib/api/client";
import { unwrapAccounts } from "@/lib/dashboard/dashboard-snapshot";
import { Button } from "@/components/ui/Button";
import { CreateAccountForm } from "@/components/accounts/CreateAccountForm";
import { Badge } from "@/components/ui/Badge";
import type { SupportedCurrency } from "@/lib/actions/accounts";

export const metadata: Metadata = { title: "New Account" };

const ALL_CURRENCIES: SupportedCurrency[] = ["USD", "EUR", "EGP"];
const MAX_ACCOUNTS = 3;

export default async function NewAccountPage() {
  await requireAuth("/accounts/new");

  let usedCurrencies: SupportedCurrency[] = [];
  let accountCount = 0;

  try {
    const raw = await goApi.listAccounts(1, 10);
    const accounts = unwrapAccounts(raw);
    accountCount = accounts.length;
    usedCurrencies = accounts.map((a) => a.currency as SupportedCurrency);
  } catch {
    usedCurrencies = [];
  }

  const availableCurrencies = ALL_CURRENCIES.filter(
    (c) => !usedCurrencies.includes(c),
  );
  const limitReached = accountCount >= MAX_ACCOUNTS;

  return (
    <div className="flex h-full min-h-0 flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/accounts">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-obsidian-600 bg-obsidian-800 text-ash-400 transition-colors hover:border-obsidian-500 hover:text-ash-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div>
          <Badge
            text="New account"
            variant="gold"
            icon={<Plus className="size-3.5 text-gold-400" />}
          />
          <h1 className="mt-1.5 font-display text-3xl text-ash-50">
            Open an account
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 items-start justify-center pt-4">
        <div className="w-full max-w-md">
          {limitReached ? (
            <LimitReachedState />
          ) : availableCurrencies.length === 0 ? (
            <LimitReachedState />
          ) : (
            <CreateAccountForm availableCurrencies={availableCurrencies} />
          )}
        </div>
      </div>
    </div>
  );
}

function LimitReachedState() {
  return (
    <div className="rounded-[28px] border border-obsidian-700 bg-obsidian-900/60 p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-500/20 bg-gold-400/8">
        <Plus className="h-6 w-6 text-gold-400" strokeWidth={1.5} />
      </div>
      <h2 className="mt-5 font-display text-2xl text-ash-100">
        Account limit reached
      </h2>
      <p className="mt-3 text-sm leading-7 text-ash-500">
        You&apos;ve opened accounts for all supported currencies (USD, EUR,
        EGP). No additional accounts can be created.
      </p>
      <Link href="/accounts" className="mt-6 inline-block">
        <Button variant="secondary" size="md">
          View your accounts
        </Button>
      </Link>
    </div>
  );
}
