import { requireAuth } from "@/lib/auth";

export default async function DashboardPage() {
  // requireAuth() centralises session verification + redirect logic.
  // It calls getAuthSession() which decrypts the cookie, handles token renewal,
  // and redirects to /login if the session is missing or dead.
  const session = await requireAuth("/dashboard");

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
