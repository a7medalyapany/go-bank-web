"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SettingsNavLinkProps {
  href: string;
  label: string;
  description: string;
  icon: ReactNode;
}

export function SettingsNavLink({
  href,
  label,
  description,
  icon,
}: SettingsNavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition-all duration-200",
        active
          ? "border-gold-500/25 bg-card-shine"
          : "border-obsidian-700 bg-obsidian-900/50 hover:border-obsidian-500 hover:bg-obsidian-800/60",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
          active
            ? "border-gold-500/30 bg-gold-400/10 text-gold-400"
            : "border-obsidian-600 bg-obsidian-800 text-ash-500",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className={cn("text-sm", active ? "text-ash-100" : "text-ash-300")}>
          {label}
        </p>
        <p className="mt-0.5 text-xs text-ash-600">{description}</p>
      </div>
      {active && (
        <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-gold-400" />
      )}
    </Link>
  );
}
