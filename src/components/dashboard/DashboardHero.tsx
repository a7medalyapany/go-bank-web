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

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export function DashboardHero({ accounts, userName }: DashboardHeroProps) {
  const firstName = getFirstName(userName);

  return (
    <DashboardHeroStateProvider initialSelectedId={accounts[0]?.id ?? null}>
      <section className="h-fit lg:min-h-0 overflow-hidden rounded-[24px] border border-obsidian-700 bg-[radial-gradient(circle_at_top_left,rgba(235,190,69,0.16),transparent_22%),radial-gradient(circle_at_top_right,rgba(216,221,232,0.12),transparent_30%),linear-gradient(180deg,rgba(14,15,17,0.96),rgba(8,8,9,1))] p-4 shadow-card sm:rounded-[34px] sm:p-5 md:p-6">
        {/* Stack on mobile, side-by-side on lg+ */}
        <div className="grid min-h-0 items-start gap-5 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* Left: greeting + balance */}
          <div className="min-w-0">
            <Badge
              text="Overview"
              variant="gold"
              icon={<Sparkles className="size-3.5 text-gold-400" />}
            />

            <h1 className="mt-3 font-display text-[1.5rem] leading-tight text-ash-50 sm:text-[1.8rem] md:mt-4 md:text-[2.25rem]">
              BanQee, {firstName}
            </h1>

            <DashboardHeroBalance accounts={accounts} />
          </div>

          {/* Right: account cards — hidden on mobile when no space */}
          <div className="hidden min-h-0 self-stretch lg:block">
            <AccountStackPreview
              featured={accounts[0] ?? null}
              accounts={accounts.slice(1)}
            />
          </div>
        </div>

        {/* Mobile-only card preview below balance */}
        <div className="mt-4 lg:hidden">
          <AccountStackPreview
            featured={accounts[0] ?? null}
            accounts={accounts.slice(1)}
          />
        </div>
      </section>
    </DashboardHeroStateProvider>
  );
}
