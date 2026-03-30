// Route-level loading UI for /verify-email.
// Shown by Next.js automatically (Suspense boundary) while the RSC is
// awaiting the Go backend GET /v1/verify_email call (up to 8 s timeout).
// Without this, users see a blank screen during that wait.
import { Loader2 } from "lucide-react";

export default function VerifyEmailLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian-950 px-4">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/2 size-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-400/3 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm space-y-6 text-center">
        <div className="flex justify-center">
          <Loader2
            className="h-14 w-14 animate-spin text-gold-500"
            strokeWidth={1.5}
          />
        </div>
        <div>
          <h1 className="font-display text-3xl text-ash-100">
            Verifying your email
          </h1>
          <p className="mt-3 text-sm text-ash-500">
            Just a moment while we confirm your address…
          </p>
        </div>
      </div>
    </div>
  );
}
