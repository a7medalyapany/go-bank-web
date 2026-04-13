"use client";

import { useActionState, useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { changePasswordAction } from "@/lib/actions/settings";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ActionState } from "@/lib/validation/auth";

const INITIAL: ActionState = { status: "idle" };

// ─── Inner form
// Owns all local state (inputs, visibility toggles, server action state).
// When the parent increments `key`, React fully remounts this component,
// discarding all state — the idiomatic way to reset a form in React 2026
// without useEffect or manual setState calls on success.
function PasswordFormInner({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction, pending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await changePasswordAction(prev, formData);
      if (result.status === "success") {
        // Schedule the remount for after this render cycle completes,
        // giving the success banner one frame to be visible.
        setTimeout(onSuccess, 1500);
      }
      return result;
    },
    INITIAL,
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fieldError = (field: string): string | undefined =>
    state.status === "error" ? state.fieldErrors?.[field]?.[0] : undefined;

  const globalError =
    state.status === "error" && !state.fieldErrors
      ? state.message
      : state.status === "error" &&
          state.fieldErrors &&
          Object.keys(state.fieldErrors).length === 0
        ? state.message
        : undefined;

  const canSubmit = password.length >= 1 && confirmPassword.length >= 1;

  const confirmMismatch =
    confirmPassword.length > 0 &&
    password !== confirmPassword &&
    !fieldError("confirmPassword");

  return (
    <form action={formAction} className="space-y-4">
      {state.status === "success" && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2.5 rounded-xl border border-success/30 bg-success/8 px-4 py-3 text-sm text-success"
        >
          <CheckCircle className="h-4 w-4 shrink-0" />
          Password changed successfully. Use your new password next time you
          sign in.
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
          name="password"
          label="New password"
          type={showPassword ? "text" : "password"}
          placeholder="Min 8 characters"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          prefix={<Lock className="h-4 w-4" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="text-ash-500 transition-colors hover:text-ash-300"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
          error={fieldError("password")}
          hint="At least 8 characters."
        />
        <Input
          name="confirmPassword"
          label="Confirm new password"
          type={showConfirm ? "text" : "password"}
          placeholder="Repeat password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          prefix={<Lock className="h-4 w-4" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Hide password" : "Show password"}
              className="text-ash-500 transition-colors hover:text-ash-300"
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
          error={
            fieldError("confirmPassword") ??
            (confirmMismatch ? "Passwords do not match." : undefined)
          }
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!canSubmit || pending}
          loading={pending}
          className="min-w-40"
        >
          {pending ? "Updating…" : "Update password"}
        </Button>
      </div>
    </form>
  );
}

// ─── Public export
// Owns the reset counter. Incrementing `resetKey` causes React to fully
// remount `PasswordFormInner`, clearing all its state without any
// useEffect or setState-in-effect anti-patterns.
export function ChangePasswordForm() {
  const [resetKey, setResetKey] = useState(0);

  return (
    <PasswordFormInner
      key={resetKey}
      onSuccess={() => setResetKey((k) => k + 1)}
    />
  );
}
