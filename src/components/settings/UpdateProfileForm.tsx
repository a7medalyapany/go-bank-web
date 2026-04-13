"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { updateProfileAction } from "@/lib/actions/settings";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ActionState } from "@/lib/validation/auth";

const INITIAL: ActionState = { status: "idle" };

interface UpdateProfileFormProps {
  currentFullName: string;
  currentEmail: string;
}

export function UpdateProfileForm({
  currentFullName,
  currentEmail,
}: UpdateProfileFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await updateProfileAction(prev, formData);
      if (result.status === "success") {
        // FIX: Trigger a soft re-render of all RSCs in the current layout.
        // The Server Action already called revalidatePath() AND patched the
        // session cookie, so router.refresh() will cause Next.js to re-fetch
        // server data (including the new full_name for the sidebar) without
        // a full page reload.
        router.refresh();
      }
      return result;
    },
    INITIAL,
  );

  const [fullName, setFullName] = useState(currentFullName);
  const [email, setEmail] = useState(currentEmail);

  const isDirty =
    fullName.trim() !== currentFullName.trim() ||
    email.trim() !== currentEmail.trim();

  const fieldError = (field: string): string | undefined =>
    state.status === "error" ? state.fieldErrors?.[field]?.[0] : undefined;

  const globalError =
    state.status === "error" && !state.fieldErrors && state.message
      ? state.message
      : state.status === "error" &&
          state.fieldErrors &&
          Object.keys(state.fieldErrors).length === 0
        ? state.message
        : undefined;

  return (
    <form action={formAction} className="space-y-4">
      {/*
        Hidden inputs carry the baseline (server-side) values into the action.
        The action diffs them against the submitted values and sends ONLY
        changed fields to PATCH /v1/users — prevents the backend's
        "invalid parameters" error when nothing changes.
      */}
      <input type="hidden" name="_currentFullName" value={currentFullName} />
      <input type="hidden" name="_currentEmail" value={currentEmail} />

      {state.status === "success" && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2.5 rounded-xl border border-success/30 bg-success/8 px-4 py-3 text-sm text-success"
        >
          <CheckCircle className="h-4 w-4 shrink-0" />
          Profile updated successfully.
        </div>
      )}

      {globalError && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-2.5 rounded-xl border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {globalError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="fullName"
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Doe"
          autoComplete="name"
          prefix={<User className="h-4 w-4" />}
          error={fieldError("fullName")}
        />
        <Input
          name="email"
          type="email"
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          autoComplete="email"
          prefix={<Mail className="h-4 w-4" />}
          error={fieldError("email")}
        />
      </div>

      {!isDirty && state.status !== "success" && (
        <p className="text-xs text-ash-600">
          Edit a field above to enable saving.
        </p>
      )}

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!isDirty || pending}
          loading={pending}
          className="min-w-[140px]"
        >
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
