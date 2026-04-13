import type { Metadata } from "next";
import { User } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { UpdateProfileForm } from "@/components/settings/UpdateProfileForm";
import { AccountInfoCard } from "@/components/settings/AccountInfoCard";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Settings — Profile" };

export default async function SettingsPage() {
  const session = await requireAuth("/settings");
  const { user } = session;

  return (
    <div className="space-y-5 pb-4">
      {/* Profile section — editable fields backed by PATCH /v1/users */}
      <SettingsSection
        title="Profile"
        description="Update your display name and email address."
        aside={
          <Badge
            text="Editable"
            variant="gold"
            size="sm"
            icon={<User className="size-3 text-gold-400" />}
          />
        }
      >
        <UpdateProfileForm
          currentFullName={user.full_name}
          currentEmail={user.email}
        />
      </SettingsSection>

      {/* Account info — read-only fields (username is immutable) */}
      <SettingsSection
        title="Account info"
        description="Your account identifiers and verification status."
      >
        <AccountInfoCard user={user} />
      </SettingsSection>
    </div>
  );
}
