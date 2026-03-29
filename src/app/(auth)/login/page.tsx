import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/session";
import LoginForm from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your GoBank account.",
};

interface Props {
  searchParams: Promise<{
    registered?: string;
    callbackUrl?: string;
  }>;
}

export default async function LoginPage({ searchParams }: Props) {
  // Real session check — not just cookie presence
  const session = await getAuthSession();
  if (session) redirect("/dashboard");

  const params = await searchParams;

  return (
    <LoginForm
      registered={params.registered === "1"}
      callbackUrl={params.callbackUrl ?? "/dashboard"}
    />
  );
}
