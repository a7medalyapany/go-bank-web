import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Verify Email",
  // Prevent search engines from indexing token-bearing verification URLs.
  // e.g. /verify-email?email_id=xxx&secret_code=yyy should never be indexed.
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

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);

  let result: { success: boolean; message: string };

  try {
    const res = await fetch(
      `${API_BASE}/v1/verify_email?email_id=${encodeURIComponent(email_id)}&secret_code=${encodeURIComponent(secret_code)}`,
      { method: "GET", cache: "no-store", signal: controller.signal },
    );

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      result = {
        success: false,
        message:
          body.message ?? "Verification failed. The link may have expired.",
      };
    } else {
      result = { success: true, message: "Your email has been verified!" };
    }
  } catch (err) {
    result = {
      success: false,
      message:
        (err as Error).name === "AbortError"
          ? "Request timed out. Please try again."
          : "Network error — could not reach the server. Please try again.",
    };
  } finally {
    clearTimeout(timer);
  }

  return <VerifyResult success={result.success} message={result.message} />;
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
