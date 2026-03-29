"use client";

// Root-level error boundary — catches unhandled errors from any RSC or route.
// Must be a Client Component (Next.js requirement for error.tsx).
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: Props) {
  useEffect(() => {
    // Log to your observability stack (Sentry, Datadog, etc.) here
    console.error("[RootError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian-950 px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="flex justify-center">
          <AlertTriangle className="h-14 w-14 text-warning" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-display text-3xl text-ash-100">
            Something went wrong
          </h1>
          <p className="mt-3 text-sm text-ash-500">
            An unexpected error occurred. Our team has been notified.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs text-ash-700">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <Button variant="primary" size="lg" fullWidth onClick={reset}>
            Try again
          </Button>
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={() => (window.location.href = "/")}
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
