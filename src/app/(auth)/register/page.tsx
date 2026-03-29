import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/session";
import RegisterForm from "@/components/forms/register-form";

export const metadata: Metadata = {
  title: "Open an Account",
  description: "Create your GoBank account in under a minute.",
};

export default async function RegisterPage() {
  const session = await getAuthSession();
  if (session) redirect("/dashboard");

  return <RegisterForm />;
}
