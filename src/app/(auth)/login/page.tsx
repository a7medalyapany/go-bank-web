import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/forms/login-form";

// TODO: swap this with actual session check
async function getSession() {
  return null;
}

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your GoBank account.",
};

interface LoginPageProps {
  searchParams: Promise<{ registered?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const params = await searchParams;
  const justRegistered = params.registered === "1";

  return <LoginForm registered={justRegistered} />;
}
