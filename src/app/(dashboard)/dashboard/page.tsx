import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/session";

function buildLoginHref(callbackUrl: string) {
  const params = new URLSearchParams({ callbackUrl });
  return `/login?${params.toString()}`;
}

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect(buildLoginHref("/dashboard"));
  }

  return (
    <div className="min-h-screen bg-obsidian-950 px-6 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl border border-obsidian-800 bg-obsidian-900 p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-500">
          Dashboard
        </p>
        <h1 className="mt-4 font-display text-4xl text-ash-100">
          Welcome back, {session.user.full_name}
        </h1>
        <p className="mt-3 text-sm text-ash-400">
          Signed in as {session.user.username}.
        </p>
      </div>
    </div>
  );
}
