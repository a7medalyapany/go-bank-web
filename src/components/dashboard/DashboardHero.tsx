import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { AccountStackPreview } from "@/components/dashboard/AccountStackPreview";
import { DashboardHeroBalance } from "@/components/dashboard/DashboardHeroBalance";
import { DashboardHeroStateProvider } from "@/components/dashboard/DashboardHeroState";

import type { DashboardAccountCard } from "@/lib/dashboard/view-models";

interface DashboardHeroProps {
  accounts: DashboardAccountCard[];
  userName: string;
}

export function DashboardHero({ accounts, userName }: DashboardHeroProps) {
  return (
    <DashboardHeroStateProvider initialSelectedId={accounts[0]?.id ?? null}>
      <section className="min-h-0 overflow-hidden rounded-[34px] border border-obsidian-700 bg-[radial-gradient(circle_at_top_left,rgba(235,190,69,0.16),transparent_22%),radial-gradient(circle_at_top_right,rgba(216,221,232,0.12),transparent_30%),linear-gradient(180deg,rgba(14,15,17,0.96),rgba(8,8,9,1))] p-5 shadow-card md:p-6">
        <div className="grid h-full min-h-0 items-start gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="max-w-3xl">
            <Badge
              text="Overview"
              variant="gold"
              icon={<Sparkles className="size-3.5 text-gold-400" />}
            />

            <h1 className="mt-4 max-w-2xl font-display text-[1.8rem] leading-tight text-ash-50 md:text-[2.25rem]">
              BanQee, {userName}.
            </h1>

            <DashboardHeroBalance accounts={accounts} />
          </div>

          <div className="min-h-0 self-stretch">
            <AccountStackPreview
              featured={accounts[0] ?? null}
              accounts={accounts.slice(1)}
            />
          </div>
        </div>
      </section>
    </DashboardHeroStateProvider>
  );
}
