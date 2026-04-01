"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface BalanceRevealProps {
  amount: string;
  detail: string;
}

export function BalanceReveal({ amount, detail }: BalanceRevealProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <p className="text-2xs font-mono uppercase tracking-[0.34em] text-gold-500">
        Total balance
      </p>

      <div
        onClick={() => setVisible((v) => !v)}
        className="group mt-2 flex w-fit cursor-pointer items-center gap-2"
      >
        <p
          className={cn(
            "font-display text-[2.2rem] leading-none text-ash-50 transition-all duration-300 md:text-[2.8rem]",
            !visible && "select-none blur-sm",
          )}
        >
          {amount}
        </p>

        <span className="opacity-100 transition-opacity duration-200 group-hover:opacity-0">
          {visible ? (
            <EyeOff className="h-4 w-4 text-ash-400" />
          ) : (
            <Eye className="h-4 w-4 text-ash-400" />
          )}
        </span>
      </div>

      <p className="mt-2 max-w-xl text-sm leading-7 text-ash-400">{detail}</p>
    </>
  );
}
