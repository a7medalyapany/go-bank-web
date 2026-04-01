"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardAccount } from "@/lib/dashboard-snapshot";
import { AccountCard } from "./AccountCard";

interface AccountStackCarouselProps {
  stack: DashboardAccount[];
}

export function AccountStackCarousel({ stack }: AccountStackCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () =>
    setActiveIndex((i) => (i === 0 ? stack.length - 1 : i - 1));
  const next = () =>
    setActiveIndex((i) => (i === stack.length - 1 ? 0 : i + 1));

  const active = stack[activeIndex];
  const ordered = [active, ...stack.filter((_, i) => i !== activeIndex)];

  return (
    <div className="group/carousel flex h-full flex-col justify-between gap-4">
      <div className="relative" style={{ height: "208px" }}>
        {ordered.slice(0, 3).map((account, index) => (
          <AccountCard key={account.name} account={account} index={index} />
        ))}
      </div>

      {stack.length > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={prev}
            aria-label="Previous account"
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full border border-white/8 bg-white/3 text-ash-500 cursor-pointer",
              "opacity-0 translate-x-1 transition-all duration-200",
              "group-hover/carousel:opacity-100 group-hover/carousel:translate-x-0",
              "hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-ash-300",
            )}
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" strokeWidth={2} />
          </button>

          <div className="flex items-center gap-2">
            {stack.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to account ${index + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === activeIndex
                    ? "w-5 bg-gold-400"
                    : "w-1.5 bg-white/20 hover:bg-white/40",
                )}
              />
            ))}
          </div>

          <button
            onClick={next}
            aria-label="Next account"
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full border border-white/8 bg-white/3 text-ash-500 cursor-pointer",
              "opacity-0 -translate-x-1 transition-all duration-200",
              "group-hover/carousel:opacity-100 group-hover/carousel:translate-x-0",
              "hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-ash-300",
            )}
          >
            <ChevronRightIcon className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
