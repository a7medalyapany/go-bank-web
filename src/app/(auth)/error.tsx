"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[AuthError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian-950 px-4">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-400/3 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm space-y-6 text-center">
        <div className="flex justify-center">
          <AlertTriangle className="h-14 w-14 text-warning" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-display text-3xl text-ash-100">
            Something went wrong
          </h1>
          <p className="mt-3 text-sm text-ash-500">
            We couldn&apos;t complete that request. Please try again.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button variant="primary" size="lg" fullWidth onClick={reset}>
            Try again
          </Button>
          <Link href="/login">
            <Button variant="ghost" size="lg" fullWidth>
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
