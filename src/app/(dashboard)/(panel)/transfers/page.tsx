import type { Metadata } from "next";
import { ArrowLeftRight, ShieldCheck } from "lucide-react";

import { requireAuth } from "@/lib/auth";
import { getAccountsSnapshot } from "@/lib/accounts/accounts-snapshot";
import { TransferWizard } from "@/components/transfers/TransferWizard";
import { PanelHeader } from "@/components/ui/PanelHeader";

export const metadata: Metadata = { title: "Transfers" };

export default async function TransfersPage() {
  const session = await requireAuth("/transfers");
  const { accounts } = await getAccountsSnapshot();

  return (
    <>
      <PanelHeader
        badgeText="Transfers"
        badgeIcon={<ArrowLeftRight className="size-3.5 text-gold-400" />}
        title="Send money instantly."
        description="Peer-to-peer transfers. Same-currency only. Atomic settlement."
        meta={
          <div className="hidden items-center gap-2 rounded-2xl border border-obsidian-600 bg-obsidian-800/50 px-4 py-2.5 md:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-gold-500" />
            <span className="text-2xs font-mono uppercase tracking-[0.22em] text-ash-400">
              Deadlock-safe
            </span>
          </div>
        }
      />

      <div className="min-h-0 flex-1">
        {accounts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mx-auto max-w-lg">
            <div className="rounded-[28px] border border-obsidian-700 bg-obsidian-900/80 p-7 shadow-card">
              <TransferWizard
                accounts={accounts}
                currentUsername={session.user.username}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 rounded-[30px] border border-obsidian-700 bg-obsidian-900/30 p-10 text-center">
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
