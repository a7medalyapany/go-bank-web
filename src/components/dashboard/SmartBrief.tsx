import Link from "next/link";
import { CalendarClock, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { DashboardBriefItem } from "@/lib/dashboard/view-models";

export function SmartBrief({ brief }: { brief: DashboardBriefItem[] }) {
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-[34px] border border-silver-500/18 bg-metal-panel p-6 shadow-card md:p-7">
      <Badge
        text="Smart brief"
        variant="silver"
        icon={<CalendarClock className="size-3.5 text-silver-200" />}
      />

      <h2 className="mt-5 font-display text-3xl leading-tight text-ash-50">
        Your accounts at a glance.
      </h2>

      <p className="mt-3 text-sm leading-7 text-ash-400">
        Live figures pulled from your GoBank accounts.
      </p>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="grid gap-3">
          {brief.map((item) => (
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
        <Link href="/accounts">
          <Button variant="outline" size="md" className="w-full cursor-pointer">
            Accounts
          </Button>
        </Link>
        <Link href="/settings/security">
          <Button
            variant="secondary"
            size="md"
            className="w-full gap-2 cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4" />
            Security
          </Button>
        </Link>
      </div>
    </div>
  );
}
