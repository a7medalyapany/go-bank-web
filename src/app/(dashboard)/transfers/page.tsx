import type { Metadata } from "next";
import { ArrowLeftRight } from "lucide-react";

import { requireAuth } from "@/lib/auth";
import { getAccountsSnapshot } from "@/lib/accounts/accounts-snapshot";
import { Badge } from "@/components/ui/Badge";
import { TransferWizard } from "@/components/transfers/TransferWizard";

export const metadata: Metadata = { title: "Transfers" };

export default async function TransfersPage() {
  const session = await requireAuth("/transfers");
  const { accounts } = await getAccountsSnapshot();

  return (
    <div className="flex h-full min-h-0 flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Badge
            text="Transfers"
            variant="gold"
            icon={<ArrowLeftRight className="size-3.5 text-gold-400" />}
          />
          <h1 className="mt-3 font-display text-3xl text-ash-50">Send funds</h1>
          <p className="mt-1 text-sm text-ash-500">
            Transfer money to another user&apos;s account.
          </p>
        </div>
      </div>

      {/* Wizard or empty state */}
      {accounts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-lg">
            <div className="rounded-[28px] border border-obsidian-700 bg-obsidian-900/80 p-7 shadow-card">
              <TransferWizard
                accounts={accounts}
                currentUsername={session.user.username}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 rounded-[30px] border border-obsidian-700 bg-obsidian-900/60 p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/3">
        <ArrowLeftRight className="h-6 w-6 text-ash-600" strokeWidth={1.5} />
      </div>
      <div>
        <h2 className="font-display text-2xl text-ash-100">No accounts yet</h2>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-ash-500">
          You need at least one account to make transfers.
        </p>
      </div>
    </div>
  );
}
