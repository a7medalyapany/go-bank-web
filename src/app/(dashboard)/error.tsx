"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian-950 px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="flex justify-center">
          <AlertTriangle className="h-14 w-14 text-warning" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-display text-3xl text-ash-100">
            Dashboard error
          </h1>
          <p className="mt-3 text-sm text-ash-500">
            Something went wrong loading this page.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs text-ash-700">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <Button variant="primary" size="lg" fullWidth onClick={reset}>
            Retry
          </Button>
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={() => (window.location.href = "/dashboard")}
          >
            Go to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
