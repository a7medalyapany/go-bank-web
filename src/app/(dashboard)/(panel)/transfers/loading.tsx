export default function TransfersLoading() {
  return (
    <div className="flex h-full min-h-0 animate-pulse flex-col gap-5">
      {/* Header */}
      <div>
        <div className="h-5 w-24 rounded-full bg-obsidian-700" />
        <div className="mt-3 h-8 w-36 rounded-2xl bg-obsidian-700" />
        <div className="mt-2 h-4 w-56 rounded-full bg-obsidian-800" />
      </div>

      {/* Wizard card skeleton */}
      <div className="mx-auto w-full max-w-lg">
        <div className="rounded-[28px] border border-obsidian-700 bg-obsidian-900/80 p-7 shadow-card">
          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-obsidian-700" />
                {i < 3 && <div className="h-px w-6 bg-obsidian-700" />}
              </div>
            ))}
          </div>

          {/* Title */}
          <div className="h-7 w-48 rounded-xl bg-obsidian-700" />
          <div className="mt-2 h-4 w-64 rounded-full bg-obsidian-800" />

          {/* Account cards */}
          <div className="mt-6 space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-2xl border border-obsidian-700 bg-obsidian-800/60"
              />
            ))}
          </div>

          {/* Button */}
          <div className="mt-5 h-12 w-full rounded-xl bg-obsidian-700" />
        </div>
      </div>
    </div>
  );
}
