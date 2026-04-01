import Link from "next/link";
import { CalendarClock, ShieldCheck, Sparkles } from "lucide-react";

import { AccountStackPreview } from "@/components/dashboard/AccountStackPreview";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { BalanceReveal } from "@/components/dashboard/BalanceReveal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { requireAuth } from "@/lib/auth";
import { getDashboardSnapshot } from "@/lib/dashboard-snapshot";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await requireAuth("/dashboard");
  const snapshot = getDashboardSnapshot(session);

  return (
    <div className="grid h-full min-h-0 gap-5 grid-rows-[minmax(0,0.9fr)_minmax(0,1.5fr)] lg:grid-rows-[minmax(0,0.8fr)_minmax(0,1.6fr)]">
      <section className="min-h-0 overflow-hidden rounded-[34px] border border-obsidian-700 bg-[radial-gradient(circle_at_top_left,rgba(235,190,69,0.16),transparent_22%),radial-gradient(circle_at_top_right,rgba(216,221,232,0.12),transparent_30%),linear-gradient(180deg,rgba(14,15,17,0.96),rgba(8,8,9,1))] p-5 shadow-card md:p-6">
        <div className="grid h-full min-h-0 items-start gap-6 grid-cols-1 lg:grid-cols-[1fr_380px]">
          <div className="max-w-3xl">
            <Badge
              text="Overview"
              variant="gold"
              icon={<Sparkles className="size-3.5 text-gold-400" />}
            />

            <h1 className="mt-4 max-w-2xl font-display text-[1.8rem] leading-tight text-ash-50 md:text-[2.25rem]">
              BanQee, {session.user.full_name}.
            </h1>

            <div className="mt-5">
              <BalanceReveal
                amount={snapshot.totalBalance}
                detail={`Available to move across your active accounts. Go BankQee`}
              />
            </div>
          </div>

          <div className="min-h-0">
            <AccountStackPreview
              featured={snapshot.featuredAccount}
              accounts={snapshot.accounts}
            />
          </div>
        </div>
      </section>

      <section className="grid min-h-0 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="min-h-0 overflow-hidden">
          <ActivityFeed items={snapshot.activity} />
        </div>

        <div className="flex min-h-0 flex-col overflow-hidden rounded-[34px] border border-silver-500/18 bg-metal-panel p-6 shadow-card md:p-7">
          <Badge
            text="Smart brief"
            variant="silver"
            icon={<CalendarClock className="size-3.5 text-silver-200" />}
          />

          <h2 className="mt-5 font-display text-3xl leading-tight text-ash-50">
            Productive signals for the rest of the day.
          </h2>

          <p className="mt-3 text-sm leading-7 text-ash-400">
            Instead of another decorative card, this space keeps the next useful
            banking checkpoints visible.
          </p>

          <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="grid gap-3">
              {snapshot.brief.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[22px] border border-white/8 bg-white/3 px-4 py-4"
                >
                  <p className="text-2xs font-mono uppercase tracking-[0.28em] text-ash-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-ash-100">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto grid gap-3 pt-5 sm:grid-cols-2">
            <Link href="/dashboard">
              <Button variant="outline" size="md" className="w-full">
                Statements
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" size="md" className="w-full gap-2">
                <ShieldCheck className="h-4 w-4" />
                Security
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
