import { ArrowDownLeft, ArrowUpRight, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export interface ActivityItem {
  id: number;
  title: string;
  detail: string;
  amount: string;
  direction: "credit" | "debit";
  time: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-[24px] border border-obsidian-700 bg-obsidian-900/80 p-4 shadow-card sm:rounded-[30px] sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-2xs font-mono uppercase tracking-[0.35em] text-gold-500">
            Activity
          </p>
          <h3 className="mt-2 font-display text-xl text-ash-50 sm:text-2xl">
            Live account movement
          </h3>
        </div>
        <Badge
          text="Monitored"
          variant="silver"
          icon={<ShieldCheck className="size-3.5 text-silver-200" />}
        />
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-0.5 sm:mt-8">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/3">
              <Clock className="h-4 w-4 text-ash-600" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-ash-500">No recent transactions</p>
            <p className="max-w-[18rem] text-xs leading-relaxed text-ash-700">
              Transaction history will appear here once you start making
              transfers.
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {items.map((item) => {
              const Icon =
                item.direction === "credit" ? ArrowDownLeft : ArrowUpRight;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/2 px-3 py-3 sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-4"
                >
                  <div
                    className={cn(
                      "mt-0.5 shrink-0 rounded-xl p-2 sm:mt-1 sm:rounded-2xl sm:p-2.5",
                      item.direction === "credit"
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {/* On mobile: stack title+amount, then detail+time below */}
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-ash-100 sm:text-base">
                        {item.title}
                      </p>
                      <p
                        className={cn(
                          "shrink-0 font-mono text-xs uppercase tracking-[0.18em]",
                          item.direction === "credit"
                            ? "text-success"
                            : "text-danger",
                        )}
                      >
                        {item.amount}
                      </p>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-1">
                      <p className="text-xs leading-5 text-ash-500 sm:text-sm sm:leading-6">
                        {item.detail}
                      </p>
                      <p className="text-2xs uppercase tracking-[0.25em] text-ash-600">
                        {item.time}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
