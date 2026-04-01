export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-[36px] border border-obsidian-700 bg-obsidian-900/90 p-8 shadow-card">
        <div className="h-7 w-40 rounded-full bg-obsidian-700" />
        <div className="mt-6 h-14 max-w-2xl rounded-[20px] bg-obsidian-700" />
        <div className="mt-4 h-5 max-w-xl rounded-xl bg-obsidian-800" />
        <div className="mt-8 flex gap-4">
          <div className="h-11 w-36 rounded-2xl bg-obsidian-700" />
          <div className="h-11 w-52 rounded-2xl bg-obsidian-800" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[28px] border border-obsidian-700 bg-obsidian-900/80 p-5 shadow-card"
          >
            <div className="h-3 w-24 rounded-full bg-obsidian-700" />
            <div className="mt-5 h-10 w-32 rounded-2xl bg-obsidian-700" />
            <div className="mt-5 h-7 w-40 rounded-full bg-obsidian-800" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <div className="grid gap-5 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-70 rounded-[30px] border border-obsidian-700 bg-obsidian-900/80"
              />
            ))}
          </div>
          <div className="h-105 rounded-[30px] border border-obsidian-700 bg-obsidian-900/80" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-40 rounded-[28px] border border-obsidian-700 bg-obsidian-900/80"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
