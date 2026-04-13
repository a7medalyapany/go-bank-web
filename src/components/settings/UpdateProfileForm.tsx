"use client";

import { useActionState } from "react";
import { useState } from "react";
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
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    INITIAL,
  );

  // Controlled state so we can detect "nothing changed" client-side
  // before even hitting the server action, giving instant feedback.
  const [fullName, setFullName] = useState(currentFullName);
  const [email, setEmail] = useState(currentEmail);

  const isDirty =
    fullName.trim() !== currentFullName.trim() ||
    email.trim() !== currentEmail.trim();

  // Field-level errors from the server action
  const fieldError = (field: string): string | undefined =>
    state.status === "error" ? state.fieldErrors?.[field]?.[0] : undefined;

  // Global error = a non-empty message with no field-level breakdown
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
        Hidden inputs carry the baseline (server-side) values into the
        action. The action diffs them against the submitted values and
        sends ONLY changed fields to PATCH /v1/users.
        This is the fix for the "invalid parameters" root cause.
      */}
      <input type="hidden" name="_currentFullName" value={currentFullName} />
      <input type="hidden" name="_currentEmail" value={currentEmail} />

      {/* Success banner */}
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

      {/* Global error banner */}
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
          // Preserve user input on error — value is controlled so it never resets
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

      {/* Dirty hint — shown when nothing has changed yet */}
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
          // Disabled when: nothing changed OR request in flight
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
