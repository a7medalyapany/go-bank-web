export default function SettingsLoading() {
  return (
    <div className="animate-pulse space-y-5 pb-4">
      {/* Section 1 skeleton */}
      <div className="rounded-[28px] border border-obsidian-700 bg-obsidian-900/70">
        <div className="border-b border-obsidian-700/60 px-7 py-5">
          <div className="h-6 w-28 rounded-xl bg-obsidian-700" />
          <div className="mt-2 h-4 w-64 rounded-full bg-obsidian-800" />
        </div>
        <div className="px-7 py-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <div className="h-3 w-20 rounded-full bg-obsidian-700" />
              <div className="h-11 rounded-lg bg-obsidian-800" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-24 rounded-full bg-obsidian-700" />
              <div className="h-11 rounded-lg bg-obsidian-800" />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="h-10 w-32 rounded-lg bg-obsidian-700" />
          </div>
        </div>
      </div>

      {/* Section 2 skeleton */}
      <div className="rounded-[28px] border border-obsidian-700 bg-obsidian-900/70">
        <div className="border-b border-obsidian-700/60 px-7 py-5">
          <div className="h-6 w-36 rounded-xl bg-obsidian-700" />
          <div className="mt-2 h-4 w-48 rounded-full bg-obsidian-800" />
        </div>
        <div className="px-7 py-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-2xl border border-obsidian-700 bg-obsidian-800/50"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
