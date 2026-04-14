import type { SessionData } from "@/lib/session/config";
import { SidebarContent } from "@/components/Sidebar/SidebarContent";

interface AppSidebarProps {
  user: SessionData["user"];
}

/**
 * Desktop sidebar — server component, hidden below lg breakpoint.
 * No interactivity needed; renders SidebarContent directly.
 */
export function AppSidebar({ user }: AppSidebarProps) {
  return (
    <aside className="hidden h-full w-[320px] shrink-0 lg:block">
      <div className="flex h-full flex-col rounded-4xl border border-obsidian-700 bg-[radial-gradient(circle_at_top,rgba(235,190,69,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(216,221,232,0.12),transparent_30%),linear-gradient(180deg,rgba(14,15,17,0.98),rgba(8,8,9,1))] p-5 shadow-card">
        <SidebarContent user={user} />
      </div>
    </aside>
  );
}
