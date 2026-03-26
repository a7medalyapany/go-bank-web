import type { Metadata } from "next";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/forms/register-form";

// TODO: swap this with actual session check
async function getSession() {
  return null;
}

export const metadata: Metadata = {
  title: "Open an account",
  description: "Create your GoBank account in under a minute.",
};

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return <RegisterForm />;
}
