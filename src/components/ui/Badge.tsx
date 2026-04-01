import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  text: string;
  icon?: ReactNode;
  variant?: "gold" | "silver";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  text,
  icon,
  variant = "silver",
  size = "md",
  className,
}: BadgeProps) {
  const base =
    "inline-flex w-fit items-center rounded-full border font-mono uppercase";

  const variants = {
    gold: "border-gold-500/20 bg-gold-400/10 text-gold-400",
    silver: "border-silver-400/20 bg-silver-300/8 text-silver-200",
  };

  const sizes = {
    md: "gap-2 px-3 py-1 text-2xs tracking-[0.28em]",
    sm: "px-2.5 py-1 text-[10px] tracking-[0.18em]",
  };

  return (
    <div className={cn(base, variants[variant], sizes[size], className)}>
      {icon && <span className="flex items-center">{icon}</span>}
      <span>{text}</span>
    </div>
  );
}
