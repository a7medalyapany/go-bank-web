export default function AccountsLoading() {
  return (
    <div className="flex h-full min-h-0 animate-pulse flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-5 w-24 rounded-full bg-obsidian-700" />
          <div className="mt-3 h-8 w-44 rounded-2xl bg-obsidian-700" />
          <div className="mt-2 h-4 w-36 rounded-full bg-obsidian-800" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-obsidian-700" />
      </div>

      <div className="grid flex-1 auto-rows-max grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="min-h-[200px] rounded-[28px] border border-obsidian-700 bg-obsidian-900/80 p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="h-3 w-24 rounded-full bg-obsidian-700" />
                <div className="mt-2 h-5 w-36 rounded-xl bg-obsidian-700" />
              </div>
              <div className="h-6 w-16 rounded-full bg-obsidian-700" />
            </div>
            <div className="mt-6">
              <div className="h-3 w-28 rounded-full bg-obsidian-800" />
              <div className="mt-2 h-9 w-40 rounded-2xl bg-obsidian-700" />
            </div>
            <div className="mt-6 border-t border-white/6 pt-4 flex justify-between">
              <div className="h-8 w-16 rounded-lg bg-obsidian-800" />
              <div className="h-8 w-16 rounded-lg bg-obsidian-800" />
              <div className="h-8 w-8 rounded-lg bg-obsidian-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
