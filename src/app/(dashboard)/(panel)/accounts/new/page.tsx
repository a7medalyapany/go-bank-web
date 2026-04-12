import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

import { getAccountsSnapshot } from "@/lib/accounts/accounts-snapshot";
import { Button } from "@/components/ui/Button";
import { CreateAccountForm } from "@/components/accounts/CreateAccountForm";
import { PanelHeader } from "@/components/ui/PanelHeader";

export const metadata: Metadata = { title: "New Account" };

export default async function NewAccountPage() {
  const { availableCurrencies, canCreate } = await getAccountsSnapshot();
  const limitReached = !canCreate;

  return (
    <>
      <PanelHeader
        badgeText="New account"
        badgeIcon={<Plus className="size-3.5 text-gold-400" />}
        title="Open an account."
        description="Choose a currency. One account per currency, up to three total."
        action={
          <Link href="/accounts">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-obsidian-600 bg-obsidian-800 text-ash-400 transition-colors hover:border-obsidian-500 hover:text-ash-200"
              aria-label="Back to accounts"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
        }
      />

      <div className="min-h-0 flex-1">
        <div className="mx-auto max-w-md">
          {limitReached || availableCurrencies.length === 0 ? (
            <LimitReachedState />
          ) : (
            <CreateAccountForm availableCurrencies={availableCurrencies} />
          )}
        </div>
      </div>
    </>
  );
}

function LimitReachedState() {
  return (
    <div className="rounded-[28px] border border-obsidian-700 bg-obsidian-900/40 p-10 text-center">
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
