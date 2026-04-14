"use client";

import { useState, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionData } from "@/lib/session/config";
import { SidebarContent } from "@/components/Sidebar/SidebarContent";

interface MobileSidebarProps {
  user: SessionData["user"];
}

/**
 * Mobile sidebar — client component, visible below lg breakpoint only.
 *
 * Why client? The open/close drawer state must live here. Everything else
 * (the actual sidebar content) is rendered by SidebarContent which is a
 * server component passed in as children — but since we need `onNavigate`
 * as a callback, we keep the composition inside this component.
 *
 * Trade-off: SidebarContent is imported directly (not passed as children)
 * because it needs `onNavigate` to close the drawer on link click. If you
 * prefer to pass children, you'd lose that behaviour or need a Context.
 */
export function MobileSidebar({ user }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      {/* ── Hamburger toggle */}
      <button
        type="button"
        aria-label="Open navigation"
        aria-expanded={open}
        aria-controls="mobile-sidebar"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-obsidian-700 bg-obsidian-900 text-ash-400 shadow-card lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* ── Backdrop */}
      <div
        aria-hidden="true"
        onClick={close}
        className={cn(
          "fixed inset-0 z-40 bg-obsidian-950/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      />

      {/* ── Drawer */}
      <aside
        id="mobile-sidebar"
        aria-label="Navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[300px] transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col rounded-r-4xl border-r border-obsidian-700 bg-[radial-gradient(circle_at_top,rgba(235,190,69,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(216,221,232,0.12),transparent_30%),linear-gradient(180deg,rgba(14,15,17,0.98),rgba(8,8,9,1))] p-5 shadow-card">
          {/* Close row */}
          <div className="mb-5 flex items-center justify-between">
            <span className="font-display text-xl tracking-wide text-ash-100">
              GoBank
            </span>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={close}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-obsidian-600 bg-obsidian-800 text-ash-400 transition-colors hover:text-ash-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Shared content — passes `close` as `onNavigate` */}
          <SidebarContent user={user} onNavigate={close} />
        </div>
      </aside>
    </>
  );
}
