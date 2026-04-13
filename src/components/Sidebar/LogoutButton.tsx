"use client";

import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => {
      logoutAction();
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={cn(
        "mt-4 w-full cursor-pointer rounded-lg border border-gold-500/20 bg-gold-400/8",
        "px-3 py-2 text-xs uppercase tracking-[0.18em] text-gold-400",
        "transition-colors hover:bg-gold-400/12",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "flex items-center justify-center gap-2",
      )}
    >
      {isPending ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Signing out…
        </>
      ) : (
        <>
          <LogOut className="h-3 w-3" />
          Logout
        </>
      )}
    </button>
  );
}
