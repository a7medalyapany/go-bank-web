import Link from "next/link";

import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/constants";
import { logoutAction } from "@/lib/actions/auth";
import type { SessionData } from "@/lib/session/config";
import { Badge } from "@/components/ui/Badge";

interface AppSidebarProps {
  user: SessionData["user"];
}

export function AppSidebar({ user }: AppSidebarProps) {
  return (
    <aside className="h-full w-full shrink-0 lg:w-[320px]">
      <div className="flex h-full flex-col rounded-4xl border border-obsidian-700 bg-[radial-gradient(circle_at_top,rgba(235,190,69,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(216,221,232,0.12),transparent_30%),linear-gradient(180deg,rgba(14,15,17,0.98),rgba(8,8,9,1))] p-5 shadow-card">
        <div className="rounded-[28px] border border-white/8 bg-white/3 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-gradient text-lg font-display text-obsidian-950">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-xl text-ash-50">
                {user.full_name}
              </p>
              <p className="truncate text-sm text-ash-500">@{user.username}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge text="Premier" variant="gold" size="sm" />
            <Badge
              text={user.is_email_verified ? "Verified" : "Pending"}
              variant="silver"
              size="sm"
            />
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon, active }) => (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
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
              {active ? (
                <span className="h-2 w-2 rounded-full bg-gold-400" />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="mt-6 rounded-3xl border border-silver-500/20 bg-metal-panel p-4">
          <p className="text-sm leading-7 text-ash-300">{user.email}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.15em] text-ash-500">
            {user.is_email_verified
              ? "Ready for protected actions"
              : "Verification still required"}
          </p>
          <form action={logoutAction} className="mt-4">
            <button
              type="submit"
              className="w-full cursor-pointer rounded-lg border border-gold-500/20 bg-gold-400/8 px-3 py-2 text-xs uppercase tracking-[0.18em] text-gold-400 transition-colors hover:bg-gold-400/12"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
