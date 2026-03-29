// Route-level loading UI — shown automatically by Next.js while the dashboard
// RSC is being fetched/rendered (Suspense boundary inserted by the framework).
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-obsidian-950 px-6 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl border border-obsidian-800 bg-obsidian-900 p-8 animate-pulse">
        <div className="h-3 w-24 rounded-full bg-obsidian-700" />
        <div className="mt-5 h-9 w-72 rounded-xl bg-obsidian-700" />
        <div className="mt-4 h-4 w-48 rounded-lg bg-obsidian-700" />
      </div>
    </div>
  );
}
