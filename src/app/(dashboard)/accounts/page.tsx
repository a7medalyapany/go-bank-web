import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Wallet } from "lucide-react";

import { requireAuth } from "@/lib/auth";
import { goApi } from "@/lib/api/client";
import { unwrapAccounts } from "@/lib/dashboard/dashboard-snapshot";
import { Button } from "@/components/ui/Button";
import { AccountListCard } from "@/components/accounts/AccountListCard";
import { Badge } from "@/components/ui/Badge";
import { AccountsFooterInfo } from "@/components/accounts/AccountsFooterInfo";

export const metadata: Metadata = { title: "Accounts" };

const MAX_ACCOUNTS = 3;

export default async function AccountsPage() {
  await requireAuth("/accounts");

  let accounts: Awaited<ReturnType<typeof unwrapAccounts>> = [];
  try {
    const raw = await goApi.listAccounts(1, 10);
    accounts = unwrapAccounts(raw);
  } catch {
    accounts = [];
  }

  const canCreate = accounts.length < MAX_ACCOUNTS;

  return (
    <div className="flex h-full min-h-0 flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Badge
            text="Accounts"
            variant="gold"
            icon={<Wallet className="size-3.5 text-gold-400" />}
          />
          <h1 className="mt-3 font-display text-3xl text-ash-50">
            Your accounts
          </h1>
          <p className="mt-1 text-sm text-ash-500">
            {accounts.length} of {MAX_ACCOUNTS} accounts opened
          </p>
        </div>

        {/* Link to /accounts/new — intercepted as modal on client nav */}
        <Link
          href="/accounts/new"
          aria-disabled={!canCreate}
          tabIndex={canCreate ? undefined : -1}
          className={!canCreate ? "pointer-events-none" : ""}
        >
          <Button
            variant="primary"
            size="md"
            disabled={!canCreate}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New account
          </Button>
        </Link>
      </div>

      {/* Account grid */}
      <div className="min-h-0 flex-1">
        {accounts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <AccountListCard key={account.id} account={account} />
            ))}
            {canCreate &&
              Array.from({ length: MAX_ACCOUNTS - accounts.length }).map(
                (_, i) => <GhostSlot key={`ghost-${i}`} index={i} />,
              )}
          </div>
        )}
      </div>

      {/* Footer info strip — only shown when accounts exist */}
      {accounts.length > 0 && (
        <AccountsFooterInfo accounts={accounts} canCreate={canCreate} />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 rounded-[30px] border border-obsidian-700 bg-obsidian-900/60 p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/3">
        <Wallet className="h-6 w-6 text-ash-600" strokeWidth={1.5} />
      </div>
      <div>
        <h2 className="font-display text-2xl text-ash-100">No accounts yet</h2>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-ash-500">
          Open your first account to start holding balances and making
          transfers.
        </p>
      </div>
      <Link href="/accounts/new">
        <Button variant="primary" size="md" className="gap-2">
          <Plus className="h-4 w-4" />
          Open first account
        </Button>
      </Link>
    </div>
  );
}

function GhostSlot({ index }: { index: number }) {
  return (
    <Link href="/accounts/new">
      <div
        className="group flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed border-obsidian-600 bg-obsidian-900/30 p-6 text-center transition-all duration-200 hover:border-gold-600/40 hover:bg-obsidian-900/60"
        style={{ animationDelay: `${index * 80}ms` }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/6 bg-white/3 transition-colors group-hover:border-gold-500/30 group-hover:bg-gold-400/8">
          <Plus className="h-4 w-4 text-ash-600 transition-colors group-hover:text-gold-400" />
        </div>
        <p className="text-xs font-mono uppercase tracking-[0.22em] text-ash-600 transition-colors group-hover:text-ash-400">
          Open account
        </p>
      </div>
    </Link>
  );
}
