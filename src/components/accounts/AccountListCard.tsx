import { cn } from "@/lib/utils";
import {
  DASHBOARD_CURRENCY_CONFIG,
  formatDashboardBalance,
  type DashboardAccountTheme,
} from "@/lib/dashboard/view-models";
import { DeleteAccountButton } from "@/components/accounts/DeleteAccountButton";
import type { GoAccount } from "@/lib/api/types";

interface AccountListCardProps {
  account: GoAccount;
}

const THEMES: Record<DashboardAccountTheme, string> = {
  gold: "border-gold-500/25 bg-[radial-gradient(circle_at_top_right,rgba(235,190,69,0.12),transparent_50%)] bg-[#0f0d09]",
  silver:
    "border-silver-400/20 bg-[radial-gradient(circle_at_top_right,rgba(216,221,232,0.10),transparent_50%)] bg-[#111317]",
  obsidian:
    "border-obsidian-600 bg-[radial-gradient(circle_at_top_right,rgba(120,132,157,0.08),transparent_50%)] bg-[#0a0b0d]",
};

const DOT_COLORS: Record<DashboardAccountTheme, string> = {
  gold: "bg-gold-400",
  silver: "bg-silver-300",
  obsidian: "bg-ash-500",
};

const LABEL_COLORS: Record<DashboardAccountTheme, string> = {
  gold: "text-gold-500",
  silver: "text-silver-400",
  obsidian: "text-ash-500",
};

export function AccountListCard({ account }: AccountListCardProps) {
  const config = DASHBOARD_CURRENCY_CONFIG[account.currency] ?? {
    theme: "obsidian" as DashboardAccountTheme,
    symbol: account.currency + " ",
    label: account.currency + " Account",
  };
  const theme = config.theme as DashboardAccountTheme;
  const balance = formatDashboardBalance(account.balance, account.currency);
  const opened = new Date(account.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article
      className={cn(
        "flex flex-col justify-between rounded-[22px] border p-4 shadow-card transition-all duration-200 hover:scale-[1.01] sm:rounded-[28px] sm:p-6",
        THEMES[theme],
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.3em]",
              LABEL_COLORS[theme],
            )}
          >
            {account.currency} account
          </p>
          <h3 className="mt-1.5 truncate font-display text-lg text-ash-50 sm:text-xl">
            {config.label}
          </h3>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Active badge */}
          <div className="hidden items-center gap-1.5 rounded-full border border-white/8 bg-white/3 px-2.5 py-1 sm:flex">
            <span
              className={cn("h-1.5 w-1.5 rounded-full", DOT_COLORS[theme])}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash-400">
              Active
            </span>
          </div>

          <DeleteAccountButton
            accountId={account.id}
            accountLabel={config.label}
          />
        </div>
      </div>

      {/* Balance */}
      <div className="mt-4 sm:mt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ash-600">
          Available balance
        </p>
        <p className="mt-1 font-display text-[1.5rem] leading-none text-ash-50 sm:text-[1.9rem]">
          {balance}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-white/6 pt-3 sm:mt-6 sm:pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash-600">
            Acct ID
          </p>
          <p className="mt-0.5 font-mono text-xs text-ash-400">
            {String(account.id).padStart(4, "0")}
          </p>
        </div>

        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash-600">
            Opened
          </p>
          <p className="mt-0.5 font-mono text-xs text-ash-400">{opened}</p>
        </div>
      </div>
    </article>
  );
}
