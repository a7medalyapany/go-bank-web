// Reusable header section used inside the (panel) layout shell.
// Renders the badge, title, description, and an optional right-side slot.

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

interface PanelHeaderProps {
  badgeText: string;
  badgeVariant?: "gold" | "silver";
  badgeIcon?: ReactNode;
  title: string;
  description?: string;
  /** Optional content pinned to the right — e.g. a "New account" button */
  action?: ReactNode;
  /** Optional small pill/badge pinned to the right — e.g. "Deadlock-safe" */
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
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <Badge text={badgeText} variant={badgeVariant} icon={badgeIcon} />
          <h1 className="mt-4 font-display text-3xl text-ash-50 md:text-[2.2rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-sm text-sm leading-7 text-ash-500">
              {description}
            </p>
          )}
        </div>

        {(action || meta) && (
          <div className="shrink-0 flex items-center gap-3">
            {meta}
            {action}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mb-7 h-px bg-gradient-to-r from-transparent via-obsidian-600/60 to-transparent" />
    </>
  );
}
