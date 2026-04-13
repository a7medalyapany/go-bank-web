import type { SessionData } from "@/lib/session/config";
import { Badge } from "@/components/ui/Badge";
import { NavLink } from "@/components/Sidebar/NavLink";
import { LogoutButton } from "@/components/Sidebar/LogoutButton";
import { NAV_ITEMS } from "@/constants";

interface AppSidebarProps {
  user: SessionData["user"];
}

export function AppSidebar({ user }: AppSidebarProps) {
  return (
    <aside className="h-full w-full shrink-0 lg:w-[320px]">
      <div className="flex h-full flex-col rounded-4xl border border-obsidian-700 bg-[radial-gradient(circle_at_top,rgba(235,190,69,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(216,221,232,0.12),transparent_30%),linear-gradient(180deg,rgba(14,15,17,0.98),rgba(8,8,9,1))] p-5 shadow-card">
        {/* User info */}
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

        {/* Navigation */}
        <nav className="mt-6 flex-1 space-y-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              iconKey={item.iconKey}
              exact={item.exact}
            />
          ))}
        </nav>

        {/* Footer with isolated Client Component for logout */}
        <div className="mt-6 rounded-3xl border border-silver-500/20 bg-metal-panel p-4">
          <p className="text-sm leading-7 text-ash-300">{user.email}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.15em] text-ash-500">
            {user.is_email_verified
              ? "Ready for protected actions"
              : "Verification still required"}
          </p>
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
