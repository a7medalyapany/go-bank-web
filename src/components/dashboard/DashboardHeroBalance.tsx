"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DashboardAccountCard } from "@/lib/dashboard/view-models";

import { useDashboardHeroState } from "@/components/dashboard/DashboardHeroState";

interface DashboardHeroBalanceProps {
  accounts: DashboardAccountCard[];
}

export function DashboardHeroBalance({ accounts }: DashboardHeroBalanceProps) {
  // FIX: heroState can be null if used outside DashboardHeroStateProvider.
  // Previously this was used without null-checking which would cause a runtime
  // error if the component tree was rendered in an unexpected context.
  const heroState = useDashboardHeroState();
  const [balanceVisible, setBalanceVisible] = useState(false);

  // FIX: Prefer the context-provided selectedId, fall back to first account.
  // This prevents a flash of wrong account on initial render.
  const selected =
    accounts.find((account) => account.id === heroState?.selectedId) ??
    accounts[0] ??
    null;

  if (accounts.length === 0) {
    return (
      <div className="mt-5">
        <p className="text-2xs font-mono uppercase tracking-[0.34em] text-gold-500">
          Balance
        </p>
        <p className="mt-2 font-display text-[2.2rem] leading-none text-ash-700 md:text-[2.8rem]">
          —
        </p>
        <p className="mt-2 text-sm text-ash-500">
          Open your first account to start tracking balances.
        </p>
      </div>
    );
  }

  if (!selected) return null;

  return (
    <div className="mt-5">
      <p className="text-2xs font-mono uppercase tracking-[0.34em] text-gold-500">
        {selected.title} balance
      </p>

      <button
        type="button"
        onClick={() => setBalanceVisible((visible) => !visible)}
        className="group mt-2 flex w-fit cursor-pointer items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-600/50"
        aria-label={balanceVisible ? "Hide balance" : "Reveal balance"}
        aria-pressed={balanceVisible}
      >
        <div
          className={cn(
            "transition-all duration-300",
            !balanceVisible && "blur-md select-none",
          )}
          aria-hidden={!balanceVisible}
        >
          <p className="font-display text-[2.2rem] leading-none text-ash-50 md:text-[2.8rem]">
            {selected.balanceLabel}
          </p>
        </div>

        <span className="shrink-0 text-ash-500 transition-colors duration-200 group-hover:text-ash-300">
          {balanceVisible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </span>
      </button>

      <p className="mt-2 max-w-xl text-sm leading-7 text-ash-400">
        {accounts.length > 1
          ? `Showing ${selected.title}. Select another card to switch.`
          : "Your active account balance."}
      </p>
    </div>
  );
}
