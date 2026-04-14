"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  Settings,
} as const;

export type NavIconKey = keyof typeof ICON_MAP;

interface NavLinkProps {
  href: string;
  label: string;
  iconKey: NavIconKey;
  exact?: boolean;
  /**
   * Optional callback fired after the link is clicked.
   * Used by MobileSidebar to close the drawer on navigation.
   * Desktop sidebar omits this — no-op by default.
   */
  onNavigate?: () => void;
}

export function NavLink({
  href,
  label,
  iconKey,
  exact = false,
  onNavigate,
}: NavLinkProps) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  const Icon = ICON_MAP[iconKey];

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "flex items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-300",
        active
          ? "border-gold-500/25 bg-card-shine"
          : "border-obsidian-700 bg-obsidian-900/70 hover:border-silver-500/20 hover:bg-metal-panel",
      )}
    >
      <span className="flex items-center gap-3">
        <span
          className={cn(
            "rounded-xl p-2",
            active
              ? "bg-gold-400/10 text-gold-400"
              : "bg-silver-300/8 text-silver-200",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm uppercase tracking-[0.2em] text-ash-200">
          {label}
        </span>
      </span>
      {active && <span className="h-2 w-2 rounded-full bg-gold-400" />}
    </Link>
  );
}
