import Link from "next/link";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AmbientGlow } from "@/components/ui/AmbientGlow";

const FEATURES = [
  {
    icon: Shield,
    title: "PASETO Authentication",
    description:
      "Industry-grade token security with short-lived access tokens and session management.",
  },
  {
    icon: Zap,
    title: "Atomic Transfers",
    description:
      "Deadlock-safe transactions with integer cent precision — no floating-point errors.",
  },
  {
    icon: Globe,
    title: "Multi-Currency",
    description:
      "Hold USD, EUR, and EGP accounts simultaneously. One account per currency.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-obsidian-950 overflow-x-hidden">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-obsidian-800/60 bg-obsidian-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-gradient">
            <span className="font-display font-bold text-obsidian-950 text-sm">
              G
            </span>
          </div>
          <span className="font-display text-xl tracking-wide text-ash-100">
            GoBank
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">
              Open account
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">
        <AmbientGlow
          className="absolute overflow-hidden"
          glowClassName="top-1/3 h-[600px] w-[600px] bg-gold-400/4 blur-[120px]"
        />

        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#d4a017 1px, transparent 1px), linear-gradient(90deg, #d4a017 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-4xl animate-fade-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-600/30 bg-gold-400/5 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-gold-400 uppercase">
              Private Banking Infrastructure
            </span>
          </div>

          <h1 className="font-display text-6xl md:text-8xl font-light leading-[1.05] tracking-tight text-ash-50 text-balance">
            Banking built for
            <br />
            <span className="bg-gold-gradient bg-clip-text text-transparent">
              the modern era
            </span>
          </h1>

          <p className="mt-8 max-w-xl mx-auto text-lg text-ash-400 leading-relaxed">
            Multi-currency accounts, atomic transfers, and institutional-grade
            security. Built on Go, backed by PostgreSQL.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button variant="primary" size="lg" className="gap-2">
                Open your account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Sign in
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-2xs font-mono uppercase tracking-widest text-ash-700">
            Scroll
          </span>
          <div className="h-8 w-px bg-gradient-to-b from-ash-700 to-transparent" />
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-32">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-2xs font-mono uppercase tracking-[0.3em] text-gold-600 mb-4">
              Infrastructure
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-ash-100">
              Built to institutional standards
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }, i) => (
              <div
                key={title}
                className="group rounded-2xl border border-obsidian-700 bg-obsidian-900 p-8 transition-all duration-300 hover:border-gold-600/30 hover:bg-card-shine"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gold-600/20 bg-gold-400/8">
                  <Icon className="h-5 w-5 text-gold-400" />
                </div>
                <h3 className="font-display text-xl text-ash-100 mb-3">
                  {title}
                </h3>
                <p className="text-sm text-ash-500 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-32">
        <div className="mx-auto max-w-2xl text-center rounded-2xl border border-gold-600/20 bg-obsidian-900 bg-card-shine p-16">
          <h2 className="font-display text-4xl text-ash-100 mb-4">
            Ready to get started?
          </h2>
          <p className="text-ash-500 mb-8">
            Create your account in seconds. No paperwork required.
          </p>
          <Link href="/register">
            <Button variant="primary" size="lg">
              Open your account — it&apos;s free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-obsidian-800 px-6 py-8">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gold-gradient">
              <span className="font-display font-bold text-obsidian-950 text-xs">
                G
              </span>
            </div>
            <span className="font-display text-lg text-ash-400">GoBank</span>
          </div>
          <p className="text-2xs font-mono text-ash-700">
            © {new Date().getFullYear()} GoBank. MIT License.
          </p>
        </div>
      </footer>
    </div>
  );
}
