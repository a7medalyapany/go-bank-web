export default function NewAccountLoading() {
  return (
    <div className="flex h-full min-h-0 animate-pulse flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="h-9 w-9 rounded-xl bg-obsidian-700" />
        <div>
          <div className="h-5 w-24 rounded-full bg-obsidian-700" />
          <div className="mt-1.5 h-8 w-44 rounded-2xl bg-obsidian-700" />
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center pt-4">
        <div className="w-full max-w-md rounded-[28px] border border-obsidian-700 bg-obsidian-900/80 p-7">
          <div className="mb-6">
            <div className="h-7 w-44 rounded-xl bg-obsidian-700" />
            <div className="mt-2 h-4 w-64 rounded-full bg-obsidian-800" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="mb-3 flex items-center gap-4 rounded-2xl border border-obsidian-700 p-4"
            >
              <div className="h-10 w-10 shrink-0 rounded-xl bg-obsidian-700" />
              <div className="flex-1">
                <div className="h-4 w-24 rounded-full bg-obsidian-700" />
                <div className="mt-1 h-3 w-36 rounded-full bg-obsidian-800" />
              </div>
            </div>
          ))}
          <div className="mt-2 h-12 w-full rounded-xl bg-obsidian-700" />
        </div>
      </div>
    </div>
  );
}
