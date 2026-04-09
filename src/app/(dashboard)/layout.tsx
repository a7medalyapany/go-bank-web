import { requireAuth } from "@/lib/auth";
import { AmbientGlow } from "@/components/ui/AmbientGlow";
import { AppSidebar } from "@/components/Sidebar/AppSidebar";

// layout receives the @modal parallel slot alongside children
export default async function DashboardLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <div className="relative h-screen overflow-hidden bg-obsidian-950">
      <AmbientGlow
        className="absolute inset-0"
        glowClassName="top-20 h-[520px] w-[520px] bg-gold-400/5 blur-[140px]"
      />
      <AmbientGlow
        className="absolute inset-0"
        glowClassName="left-[75%] top-[35%] h-[440px] w-[440px] bg-silver-200/6 blur-[130px]"
      />

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

      <div className="relative mx-auto flex h-full max-w-400 items-stretch flex-col gap-5 p-4 md:p-4 lg:flex-row">
        <AppSidebar user={session.user} />

        <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Modal slot — renders the intercepted /accounts/new as an overlay */}
      {modal}
    </div>
  );
}
