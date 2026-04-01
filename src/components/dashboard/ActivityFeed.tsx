import { ArrowDownLeft, ArrowUpRight, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export interface ActivityItem {
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
    <div className="flex h-full min-h-0 flex-col rounded-[30px] border border-obsidian-700 bg-obsidian-900/80 p-6 shadow-card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-2xs font-mono uppercase tracking-[0.35em] text-gold-500">
            Activity
          </p>
          <h3 className="mt-3 font-display text-2xl text-ash-50">
            Live account movement
          </h3>
        </div>
        <Badge
          text="Monitored"
          variant="silver"
          icon={<ShieldCheck className="size-3.5 text-silver-200" />}
        />
      </div>

      <div className="mt-8 min-h-0 flex-1 overflow-y-auto pr-1">
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
          <div className="space-y-4">
            {items.map((item) => {
              const Icon =
                item.direction === "credit" ? ArrowDownLeft : ArrowUpRight;
              return (
                <div
                  key={`${item.title}-${item.time}`}
                  className="flex items-start gap-4 rounded-2xl border border-white/6 bg-white/2 px-4 py-4"
                >
                  <div
                    className={cn(
                      "mt-1 rounded-2xl p-2.5",
                      item.direction === "credit"
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-base text-ash-100">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-ash-500">
                          {item.detail}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <p
                          className={cn(
                            "font-mono text-sm uppercase tracking-[0.18em]",
                            item.direction === "credit"
                              ? "text-success"
                              : "text-danger",
                          )}
                        >
                          {item.amount}
                        </p>
                        <p className="mt-1 text-2xs uppercase tracking-[0.25em] text-ash-600">
                          {item.time}
                        </p>
                      </div>
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
