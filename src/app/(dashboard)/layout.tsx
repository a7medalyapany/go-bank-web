import { requireAuth } from "@/lib/auth";
import { AmbientGlow } from "@/components/ui/AmbientGlow";
import { AppSidebar } from "@/components/Sidebar/AppSidebar";
import { MobileSidebar } from "@/components/Sidebar/MobileSidebar";

export default async function DashboardLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <div className="relative min-h-screen bg-obsidian-950 lg:h-screen lg:overflow-hidden">
      {/* ── Ambient background */}
      <AmbientGlow
        className="absolute inset-0"
        glowClassName="top-20 h-[520px] w-[520px] bg-gold-400/5 blur-[140px]"
      />
      <AmbientGlow
        className="absolute inset-0"
        glowClassName="left-[75%] top-[35%] h-[440px] w-[440px] bg-silver-200/6 blur-[130px]"
      />

      {/* ── Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(216,221,232,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(216,221,232,0.35) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(circle at center, black 42%, transparent 90%)",
        }}
      />

      {/* ── Page shell */}
      <div className="relative mx-auto flex h-full max-w-[1600px] flex-col gap-4 p-3 pt-16 lg:flex-row lg:items-stretch lg:p-4 lg:pt-4">
        {/* Desktop sidebar — server rendered, hidden on mobile */}
        <AppSidebar user={session.user} />

        {/* Mobile sidebar — client, hidden on desktop */}
        <MobileSidebar user={session.user} />

        {/* Main content */}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto pb-6 lg:overflow-hidden lg:pb-0">
          {children}
        </main>
      </div>

      {/* Parallel route modal slot */}
      {modal}
    </div>
  );
}
