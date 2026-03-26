"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Form from "next/form";
import { Eye, EyeOff, Lock, User } from "lucide-react";

import { loginAction } from "@/lib/actions/auth";
import { ActionState } from "@/lib/validation/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AmbientGlow } from "@/components/ui/AmbientGlow";

const INITIAL: ActionState = { status: "idle" };

export default function LoginForm({ registered }: { registered?: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);
  const [showPassword, setShowPassword] = useState(false);

  const fieldError = (field: string): string | undefined =>
    state.status === "error" ? state.fieldErrors?.[field]?.[0] : undefined;

  const globalError = state.status === "error" ? state.message : undefined;

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

        {/* Success banner after registration */}
        {registered && (
          <div
            role="status"
            aria-live="polite"
            className="mb-5 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
          >
            Account created — please sign in.
          </div>
        )}

        {/* Error banner */}
        {globalError && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-5 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
          >
            {globalError}
          </div>
        )}

        <Form action={formAction} className="space-y-4">
          <Input
            name="username"
            label="Username"
            placeholder="john_doe_123"
            autoComplete="username"
            required
            prefix={<User className="h-4 w-4" />}
            error={fieldError("username")}
          />
          <Input
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Your password"
            autoComplete="current-password"
            required
            prefix={<Lock className="h-4 w-4" />}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-ash-500 transition-colors hover:text-ash-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
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
        </Form>

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
