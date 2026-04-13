import { ShieldCheck, AlertTriangle, User, AtSign } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { SessionData } from "@/lib/session/config";

interface AccountInfoCardProps {
  user: SessionData["user"];
}

/**
 * Read-only display of immutable or session-derived user data.
 * Username is immutable in the backend (not included in PATCH /v1/users).
 * Verification status is shown with clear visual feedback.
 */
export function AccountInfoCard({ user }: AccountInfoCardProps) {
  const fields: Array<{
    icon: React.ReactNode;
    label: string;
    value: string;
  }> = [
    {
      icon: <AtSign className="h-4 w-4" />,
      label: "Username",
      value: `@${user.username}`,
    },
    {
      icon: <User className="h-4 w-4" />,
      label: "Display name",
      value: user.full_name,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Fields */}
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.label}
            className="flex items-center gap-3 rounded-2xl border border-obsidian-600 bg-obsidian-800/50 px-4 py-3.5"
          >
            <span className="shrink-0 text-ash-600">{field.icon}</span>
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash-600">
                {field.label}
              </p>
              <p className="mt-0.5 truncate font-mono text-sm text-ash-200">
                {field.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Email verification status */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-obsidian-600 bg-obsidian-800/50 px-4 py-3.5">
        <div className="flex items-center gap-3">
          {user.is_email_verified ? (
            <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
          )}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash-600">
              Email verification
            </p>
            <p className="mt-0.5 truncate text-sm text-ash-200">{user.email}</p>
          </div>
        </div>
        <Badge
          text={user.is_email_verified ? "Verified" : "Pending"}
          variant={user.is_email_verified ? "gold" : "silver"}
          size="sm"
        />
      </div>

      {!user.is_email_verified && (
        <p className="rounded-xl border border-warning/20 bg-warning/6 px-4 py-3 text-sm text-ash-400">
          <span className="text-warning">Heads up:</span> Your email is not yet
          verified. Check your inbox for the verification link we sent when you
          registered.
        </p>
      )}
    </div>
  );
}
