import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

interface PanelHeaderProps {
  badgeText: string;
  badgeVariant?: "gold" | "silver";
  badgeIcon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  meta?: ReactNode;
}

export function PanelHeader({
  badgeText,
  badgeVariant = "gold",
  badgeIcon,
  title,
  description,
  action,
  meta,
}: PanelHeaderProps) {
  return (
    <>
      {/* Stack on mobile, row on sm+ */}
      <div className="mb-5 flex flex-col gap-3 sm:mb-7 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <Badge text={badgeText} variant={badgeVariant} icon={badgeIcon} />
          <h1 className="mt-3 font-display text-2xl text-ash-50 sm:mt-4 sm:text-3xl md:text-[2.2rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-sm text-sm leading-7 text-ash-500">
              {description}
            </p>
          )}
        </div>

        {(action || meta) && (
          <div className="flex shrink-0 items-center gap-3">
            {meta}
            {action}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mb-5 h-px bg-gradient-to-r from-transparent via-obsidian-600/60 to-transparent sm:mb-7" />
    </>
  );
}
