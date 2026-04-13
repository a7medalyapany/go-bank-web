import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Optional right-side decoration (badge, status pill, etc.) */
  aside?: ReactNode;
}

/**
 * Reusable section card used across all settings pages.
 * Follows the same rounded-panel pattern as the rest of the dashboard.
 */
export function SettingsSection({
  title,
  description,
  children,
  className,
  aside,
}: SettingsSectionProps) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-obsidian-700 bg-obsidian-900/70 shadow-card",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-obsidian-700/60 px-6 py-5 md:px-7">
        <div>
          <h2 className="font-display text-xl text-ash-50">{title}</h2>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-ash-500">
              {description}
            </p>
          )}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>

      {/* Body */}
      <div className="px-6 py-6 md:px-7">{children}</div>
    </section>
  );
}
