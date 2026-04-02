import Link from "next/link";
import { PlusIcon } from "lucide-react";

export function AccountStackEmpty() {
  return (
    <div className="relative flex h-full min-h-52 flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/6 bg-[#0a0b0d] bg-[radial-gradient(ellipse_at_top_right,rgba(235,190,69,0.07),transparent_55%)] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_40px_rgba(0,0,0,0.42)] p-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gold-400/6 blur-2xl"
      />

      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/3">
        <PlusIcon className="h-4 w-4 text-ash-500" strokeWidth={1.5} />
      </div>

      <p className="font-mono text-2xs uppercase tracking-[0.3em] text-ash-500">
        No accounts yet
      </p>

      <p className="mt-2 max-w-[16rem] text-xs leading-relaxed text-ash-600">
        Create your first account to start tracking balances.
      </p>

      <Link
        href="/accounts/new"
        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gold-400/20 bg-gold-400/8 px-4 py-2 text-xs font-mono uppercase tracking-[0.2em] text-gold-400 transition-all duration-200 hover:border-gold-400/30 hover:bg-gold-400/[0.14]"
      >
        <PlusIcon className="h-3 w-3" strokeWidth={2} />
        Create account
      </Link>
    </div>
  );
}
