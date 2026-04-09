import { ShieldCheck, ArrowRightLeft, Info } from "lucide-react";
import type { GoAccount } from "@/lib/api/types";
import {
  DASHBOARD_CURRENCY_CONFIG,
  formatDashboardBalance,
} from "@/lib/dashboard/view-models";

interface AccountsFooterInfoProps {
  accounts: GoAccount[];
  canCreate: boolean;
}

export function AccountsFooterInfo({
  accounts,
  canCreate,
}: AccountsFooterInfoProps) {
  // Total value across all accounts (display-only, not converted — mixed currencies)
  const currenciesCovered = accounts.map((a) => a.currency).join(", ");
  const highestBalance = accounts.reduce(
    (top, a) => (a.balance > top.balance ? a : top),
    accounts[0],
  );

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-obsidian-700 bg-obsidian-900/50 px-5 py-3.5">
      <div className="flex flex-1 items-center gap-6 overflow-hidden">
        {/* Currencies held */}
        <div className="flex items-center gap-2 shrink-0">
          <ShieldCheck className="h-3.5 w-3.5 text-ash-600" strokeWidth={1.5} />
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ash-600">
            Currencies
          </span>
          <span className="font-mono text-[11px] text-ash-400">
            {currenciesCovered}
          </span>
        </div>

        <div className="h-3.5 w-px bg-obsidian-600 shrink-0" />

        {/* Highest balance */}
        <div className="flex items-center gap-2 shrink-0">
          <ArrowRightLeft
            className="h-3.5 w-3.5 text-ash-600"
            strokeWidth={1.5}
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ash-600">
            Top balance
          </span>
          <span className="font-mono text-[11px] text-ash-400">
            {formatDashboardBalance(
              highestBalance.balance,
              highestBalance.currency,
            )}{" "}
            ·{" "}
            {DASHBOARD_CURRENCY_CONFIG[highestBalance.currency]?.label ??
              highestBalance.currency}
          </span>
        </div>

        {canCreate && (
          <>
            <div className="h-3.5 w-px bg-obsidian-600 shrink-0" />
            <div className="flex items-center gap-2 shrink-0">
              <Info className="h-3.5 w-3.5 text-ash-600" strokeWidth={1.5} />
              <span className="font-mono text-[11px] text-ash-600">
                {3 - accounts.length} slot
                {3 - accounts.length !== 1 ? "s" : ""} remaining
              </span>
            </div>
          </>
        )}
      </div>

      {/* Transfers hint */}
      <p className="hidden shrink-0 text-[11px] text-ash-700 lg:block">
        Transfers ain&apos;t available between your accounts
      </p>
    </div>
  );
}
