"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { AccountCard } from "@/components/dashboard/AccountCard";
import { useDashboardHeroState } from "@/components/dashboard/DashboardHeroState";

import { cn } from "@/lib/utils";
import type { DashboardAccountCard } from "@/lib/dashboard/view-models";

interface AccountStackCarouselProps {
  stack: DashboardAccountCard[];
  selectedId?: number;
  onSelect?: (id: number) => void;
}

export function AccountStackCarousel({
  stack,
  selectedId,
  onSelect,
}: AccountStackCarouselProps) {
  const heroState = useDashboardHeroState();
  const getIndexById = (id: number) =>
    Math.max(
      0,
      stack.findIndex((account) => account.id === id),
    );

  const [uncontrolledIndex, setUncontrolledIndex] = useState(0);
  const controlledSelectedId = selectedId ?? heroState?.selectedId;
  const activeIndex =
    controlledSelectedId !== undefined && controlledSelectedId !== null
      ? getIndexById(controlledSelectedId)
      : uncontrolledIndex;

  function pick(index: number) {
    if (selectedId === undefined && heroState?.selectedId === undefined) {
      setUncontrolledIndex(index);
    }

    heroState?.setSelectedId(stack[index].id);
    onSelect?.(stack[index].id);
  }

  const previous = activeIndex === 0 ? stack.length - 1 : activeIndex - 1;
  const next = activeIndex === stack.length - 1 ? 0 : activeIndex + 1;
  const ordered = [
    stack[activeIndex],
    ...stack.filter((_, index) => index !== activeIndex),
  ];

  return (
    <div className="group/carousel flex h-full min-h-61 flex-col justify-between gap-4">
      <div className="relative h-52">
        {ordered.slice(0, 3).map((account, index) => (
          <AccountCard
            key={account.id}
            account={account}
            index={index}
            onClick={
              index === 0
                ? undefined
                : () => pick(stack.findIndex((item) => item.id === account.id))
            }
          />
        ))}
      </div>

      {stack.length > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => pick(previous)}
            aria-label="Previous account"
            className={cn(
              "flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/8 bg-white/3 text-ash-500",
              "translate-x-1 opacity-0 transition-all duration-200",
              "group-hover/carousel:translate-x-0 group-hover/carousel:opacity-100",
              "hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-ash-300",
            )}
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" strokeWidth={2} />
          </button>

          <div className="flex items-center gap-2">
            {stack.map((account, index) => (
              <button
                key={account.id}
                type="button"
                onClick={() => pick(index)}
                aria-label={`Switch to ${account.title}`}
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
            type="button"
            onClick={() => pick(next)}
            aria-label="Next account"
            className={cn(
              "flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/8 bg-white/3 text-ash-500",
              "-translate-x-1 opacity-0 transition-all duration-200",
              "group-hover/carousel:translate-x-0 group-hover/carousel:opacity-100",
              "hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-ash-300",
            )}
          >
            <ChevronRightIcon className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
