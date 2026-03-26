"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Form from "next/form";
import { Contact, Eye, EyeOff, Lock, Mail, User } from "lucide-react";

import { registerAction } from "@/lib/actions/auth";
import { ActionState } from "@/lib/validation/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AmbientGlow } from "@/components/ui/AmbientGlow";

const INITIAL: ActionState = { status: "idle" };

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, INITIAL);
  const [showPassword, setShowPassword] = useState(false);

  const fieldError = (field: string): string | undefined =>
    state.status === "error" ? state.fieldErrors?.[field]?.[0] : undefined;

  const globalError =
    state.status === "error" && !state.fieldErrors
      ? state.message
      : state.status === "error" &&
          Object.keys(state.fieldErrors ?? {}).length === 0
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
            Open an account
          </h1>
          <p className="mt-2 text-sm text-ash-500">Takes less than a minute</p>
        </div>

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

        {/*
          next/form gives us:
            1. Prefetching of the action route on mount
            2. Client-side (soft) navigation on redirect — no full reload
          useActionState gives us:
            1. Pending state while the Server Action is in-flight
            2. Error/success state piped back into the UI
          Both are needed. next/form alone (like v0's snippet) has no
          error feedback — it silently swallows failures.
        */}
        <Form action={formAction} className="space-y-4">
          <Input
            name="username"
            label="Username"
            placeholder="john_doe_123"
            autoComplete="username"
            required
            minLength={3}
            maxLength={50}
            pattern="[a-z0-9_]+"
            prefix={<User className="h-4 w-4" />}
            hint="Lowercase letters, digits, underscores"
            error={fieldError("username")}
            aria-describedby={
              fieldError("username") ? "username-error" : undefined
            }
          />
          <Input
            name="full_name"
            label="Full name"
            placeholder="John Doe"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            prefix={<Contact className="h-4 w-4" />}
            error={fieldError("full_name")}
          />
          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="john@example.com"
            autoComplete="email"
            required
            prefix={<Mail className="h-4 w-4" />}
            error={fieldError("email")}
          />
          <Input
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Min 8 characters"
            autoComplete="new-password"
            required
            minLength={8}
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
            {pending ? "Creating account…" : "Create account"}
          </Button>
        </Form>

        <p className="mt-6 text-center text-sm text-ash-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-gold-400 transition-colors hover:text-gold-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
