import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

import { getAccountsSnapshot } from "@/lib/accounts/accounts-snapshot";
import { Button } from "@/components/ui/Button";
import { CreateAccountForm } from "@/components/accounts/CreateAccountForm";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "New Account" };

export default async function NewAccountPage() {
  const { availableCurrencies, canCreate } = await getAccountsSnapshot();
  const limitReached = !canCreate;

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
          {limitReached || availableCurrencies.length === 0 ? (
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
