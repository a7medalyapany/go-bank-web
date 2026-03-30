import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { goPublicApi } from "@/lib/api/client";

export const metadata: Metadata = {
  title: "Verify Email",
  // Prevent search engines from indexing token-bearing verification URLs.
  // e.g. /verify-email?email_id=xxx&secret_code=yyy must never be indexed.
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{
    email_id?: string;
    secret_code?: string;
  }>;
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const params = await searchParams;
  const { email_id, secret_code } = params;

  if (!email_id || !secret_code) {
    return (
      <VerifyResult success={false} message="Invalid verification link." />
    );
  }

  const result = await goPublicApi.verifyEmail(email_id, secret_code);

  if (!result.ok) {
    const message =
      result.status === 408
        ? "Request timed out. Please try again."
        : result.status === 0
          ? "Network error — could not reach the server. Please try again."
          : (result.message ??
            "Verification failed. The link may have expired.");

    return <VerifyResult success={false} message={message} />;
  }

  return (
    <VerifyResult success={true} message="Your email has been verified!" />
  );
}

function VerifyResult({
  success,
  message,
}: {
  success: boolean;
  message: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian-950 px-4">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/2 size-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-400/3 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-up space-y-6 text-center">
        <div className="flex justify-center">
          {success ? (
            <CheckCircle className="h-16 w-16 text-success" strokeWidth={1.5} />
          ) : (
            <XCircle className="h-16 w-16 text-danger" strokeWidth={1.5} />
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl text-ash-100">
            {success ? "Email verified" : "Verification failed"}
          </h1>
          <p className="mt-3 text-sm text-ash-500">{message}</p>
        </div>

        <Link href="/login">
          <Button variant="primary" size="lg" fullWidth>
            {success ? "Sign in to GoBank" : "Back to sign in"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
