import type { Metadata } from "next";
import { ShieldCheck, KeyRound, Info } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Settings — Security" };

export default async function SecuritySettingsPage() {
  const session = await requireAuth("/settings/security");
  const { user } = session;

  return (
    <div className="space-y-5 pb-4">
      {/* Password change section */}
      <SettingsSection
        title="Change password"
        description="Update your account password. Passwords are stored as a bcrypt hash — never in plain text."
        aside={
          <Badge
            text="Secured"
            variant="gold"
            size="sm"
            icon={<ShieldCheck className="size-3 text-gold-400" />}
          />
        }
      >
        <ChangePasswordForm />
      </SettingsSection>

      {/* Security overview — read-only status display */}
      <SettingsSection
        title="Security overview"
        description="Current security state of your GoBank account."
      >
        <div className="space-y-3">
          {/* Authentication method */}
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-obsidian-600 bg-obsidian-800/50 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <KeyRound className="h-4 w-4 shrink-0 text-ash-500" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash-600">
                  Authentication
                </p>
                <p className="mt-0.5 text-sm text-ash-200">
                  Username &amp; password
                </p>
              </div>
            </div>
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-ash-500">
              Active
            </span>
          </div>

          {/* Token type */}
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-obsidian-600 bg-obsidian-800/50 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 shrink-0 text-gold-500" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash-600">
                  Session tokens
                </p>
                <p className="mt-0.5 text-sm text-ash-200">
                  PASETO v2 — short-lived access + refresh
                </p>
              </div>
            </div>
            <Badge text="PASETO" variant="gold" size="sm" />
          </div>

          {/* Email verification */}
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-obsidian-600 bg-obsidian-800/50 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Info className="h-4 w-4 shrink-0 text-ash-500" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash-600">
                  Email verified
                </p>
                <p className="mt-0.5 text-sm text-ash-200">{user.email}</p>
              </div>
            </div>
            <Badge
              text={user.is_email_verified ? "Verified" : "Pending"}
              variant={user.is_email_verified ? "gold" : "silver"}
              size="sm"
            />
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
