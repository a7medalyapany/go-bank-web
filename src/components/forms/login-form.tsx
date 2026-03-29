"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/validation/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AmbientGlow } from "@/components/ui/AmbientGlow";

const INITIAL: ActionState = { status: "idle" };

interface Props {
  registered?: boolean;
  callbackUrl?: string;
}

export default function LoginForm({
  registered,
  callbackUrl = "/dashboard",
}: Props) {
  // Bind callbackUrl as the first argument to loginAction via .bind()
  // This is the React/Next.js canonical pattern for passing extra args to Server Actions.
  const boundAction = loginAction.bind(null, callbackUrl);
  const [state, formAction, pending] = useActionState(boundAction, INITIAL);
  const [showPassword, setShowPassword] = useState(false);

  const fieldError = (f: string) =>
    state.status === "error" ? state.fieldErrors?.[f]?.[0] : undefined;

  // Global error = error with no field-level breakdown
  const globalError =
    state.status === "error" && !Object.keys(state.fieldErrors ?? {}).length
      ? state.message
      : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian-950 px-4 py-12">
      {/* Ambient glow */}
      <AmbientGlow className="fixed" />

      <div className="relative w-full max-w-sm animate-fade-up">
        {/* Header */}
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-gradient">
              <span className="font-display font-bold text-obsidian-950">
                G
              </span>
            </div>
            <span className="font-display text-2xl tracking-wide text-ash-100">
              GoBank
            </span>
          </Link>
          <h1 className="mt-8 font-display text-3xl text-ash-100">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-ash-500">Sign in to your account</p>
        </div>

        {/* Post-registration success banner — email verification dispatched async */}
        {registered && (
          <div
            role="status"
            aria-live="polite"
            className="mb-5 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
          >
            Account created — check your inbox to verify your email, then sign
            in.
          </div>
        )}

        {/* Global error banner */}
        {globalError && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-5 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
          >
            {globalError}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <Input
            name="username"
            label="Username"
            placeholder="john_doe_123"
            autoComplete="username"
            prefix={<User className="h-4 w-4" />}
            error={fieldError("username")}
          />
          <Input
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Your password"
            autoComplete="current-password"
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
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={pending}
            className="mt-2"
          >
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ash-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-gold-400 transition-colors hover:text-gold-300"
          >
            Open one
          </Link>
        </p>
      </div>
    </div>
  );
}
