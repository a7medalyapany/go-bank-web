import type { ReactNode } from "react";
import { User, ShieldCheck } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { SettingsNavLink } from "@/components/settings/SettingsNavLink";

const SETTINGS_NAV = [
  {
    href: "/settings",
    label: "Profile",
    description: "Name, email, account info",
    icon: <User className="h-4 w-4" />,
  },
  {
    href: "/settings/security",
    label: "Security",
    description: "Password and credentials",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
];

export default async function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Auth guard — all settings pages require a valid session
  await requireAuth("/settings");

  return (
    <>
      <PanelHeader
        badgeText="Settings"
        badgeIcon={<User className="size-3.5 text-gold-400" />}
        title="Account settings."
        description="Manage your profile, security, and preferences."
      />

      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[260px_1fr]">
        {/* Settings navigation sidebar */}
        <nav className="space-y-2 lg:self-start">
          {SETTINGS_NAV.map((item) => (
            <SettingsNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              description={item.description}
              icon={item.icon}
            />
          ))}
        </nav>

        {/* Page content */}
        <div className="min-h-0 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}
