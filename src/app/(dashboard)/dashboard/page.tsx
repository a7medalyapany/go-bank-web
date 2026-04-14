import { getDashboardPageData } from "@/lib/dashboard/dashboard-snapshot";

import { SmartBrief } from "@/components/dashboard/SmartBrief";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DashboardHero } from "@/components/dashboard/DashboardHero";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const dashboard = await getDashboardPageData();

  return (
    <div
      className="
  grid gap-5
  lg:h-full lg:min-h-0
  lg:grid-rows-[minmax(0,0.8fr)_minmax(0,1.6fr)]
"
    >
      <DashboardHero
        accounts={dashboard.accounts}
        userName={dashboard.userName}
      />

      <section className="grid min-h-0 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="min-h-0 overflow-hidden">
          <ActivityFeed items={dashboard.activity} />
        </div>

        <SmartBrief brief={dashboard.brief} />
      </section>
    </div>
  );
}
