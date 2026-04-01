import { ArrowDownLeft, ArrowUpRight, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
interface ActivityItem {
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

      <div className="mt-8 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {items.map((item) => {
          const Icon =
            item.amount === "Trusted"
              ? ShieldCheck
              : item.direction === "credit"
                ? ArrowDownLeft
                : ArrowUpRight;

          return (
            <div
              key={`${item.title}-${item.time}`}
              className="flex items-start gap-4 rounded-2xl border border-white/6 bg-white/2 px-4 py-4"
            >
              <div
                className={cn(
                  "mt-1 rounded-2xl p-2.5",
                  item.amount === "Trusted"
                    ? "bg-silver-300/10 text-silver-200"
                    : item.direction === "credit"
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
                        item.amount === "Trusted"
                          ? "text-silver-200"
                          : item.direction === "credit"
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
    </div>
  );
}
