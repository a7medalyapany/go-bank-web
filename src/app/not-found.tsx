import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian-950 px-4">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-400/3 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm space-y-6 text-center">
        <div className="flex justify-center">
          <Compass className="h-14 w-14 text-ash-600" strokeWidth={1.5} />
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold-600">
            404
          </p>
          <h1 className="mt-3 font-display text-3xl text-ash-100">
            Page not found
          </h1>
          <p className="mt-3 text-sm text-ash-500">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>

        <Link href="/">
          <Button variant="primary" size="lg" fullWidth>
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
}
