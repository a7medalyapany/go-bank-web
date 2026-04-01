import { cn } from "@/lib/utils";
import type { DashboardAccountCard } from "@/lib/dashboard/view-models";

interface AccountCardProps {
  account: DashboardAccountCard;
  index: number;
  onClick?: () => void;
}

const THEMES: Record<DashboardAccountCard["theme"], string> = {
  gold: "border-gold-500/30 bg-[#0f0d09] bg-[radial-gradient(circle_at_top_right,rgba(235,190,69,0.18),transparent_40%)] shadow-[0_0_0_1px_rgba(212,160,23,0.18),0_18px_40px_rgba(0,0,0,0.42)]",
  silver:
    "border-silver-400/24 bg-[#111317] bg-[radial-gradient(circle_at_top_right,rgba(216,221,232,0.16),transparent_40%)] shadow-[0_0_0_1px_rgba(151,163,184,0.12),0_18px_40px_rgba(0,0,0,0.42)]",
  obsidian:
    "border-obsidian-600 bg-[#0a0b0d] bg-[radial-gradient(circle_at_top_right,rgba(120,132,157,0.12),transparent_40%)] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_40px_rgba(0,0,0,0.42)]",
};

const CARD_OFFSETS = [
  { top: 0, zIndex: 30, opacity: 1, height: "181px" },
  { top: 20, zIndex: 20, opacity: 0.8, height: "173px" },
  { top: 40, zIndex: 10, opacity: 0.55, height: "165px" },
] as const;

export function AccountCard({ account, index, onClick }: AccountCardProps) {
  const offset = CARD_OFFSETS[index];
  const isBackground = index > 0;

  return (
    <article
      className={cn(
        "absolute inset-x-0 rounded-3xl border p-5 transition-all duration-300",
        THEMES[account.theme],
        isBackground && onClick && "cursor-pointer hover:opacity-90",
      )}
      style={{
        top: offset.top,
        zIndex: offset.zIndex,
        opacity: offset.opacity,
        height: offset.height,
        transform: `translateX(${index * 6}px) scale(${1 - index * 0.025})`,
        transformOrigin: "top center",
      }}
    >
      {isBackground && onClick ? (
        <button
          type="button"
          onClick={onClick}
          aria-label={`Switch to ${account.title}`}
          className="absolute inset-0 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-600/50"
        />
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-2xs uppercase tracking-[0.3em] text-ash-500">
            {account.currencyCode} account
          </p>
          <h3 className="mt-4 font-display text-[1.65rem] leading-none text-ash-50">
            {account.title}
          </h3>
        </div>

        <p className="font-mono text-2xs uppercase tracking-[0.26em] text-ash-500">
          ACCT {account.ibanSuffix}
        </p>
      </div>

      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ash-400">
        {account.subtitle}
      </p>
    </article>
  );
}
