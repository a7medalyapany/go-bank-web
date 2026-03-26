import { cn } from "@/lib/utils";

interface AmbientGlowProps {
  className?: string;
  glowClassName?: string;
}

export function AmbientGlow({ className, glowClassName }: AmbientGlowProps) {
  return (
    <div className={cn("pointer-events-none inset-0", className)}>
      <div
        className={cn(
          "absolute left-1/2 top-1/2 size-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-400/3 blur-[100px]",
          glowClassName,
        )}
      />
    </div>
  );
}
