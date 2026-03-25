import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-sans font-medium tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/50 disabled:pointer-events-none disabled:opacity-40 select-none";

    const variants = {
      primary:
        "bg-gold-gradient text-obsidian-950 shadow-gold-sm hover:shadow-gold-md hover:brightness-110 active:scale-[0.98]",
      secondary:
        "bg-obsidian-700 text-ash-100 border border-obsidian-500 hover:bg-obsidian-600 hover:border-obsidian-400 active:scale-[0.98]",
      ghost:
        "text-ash-300 hover:text-gold-400 hover:bg-obsidian-800 active:scale-[0.98]",
      danger:
        "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 active:scale-[0.98]",
      outline:
        "border border-gold-600/40 text-gold-400 hover:bg-gold-400/10 hover:border-gold-400 active:scale-[0.98]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-md",
      md: "h-10 px-5 text-sm rounded-lg",
      lg: "h-12 px-7 text-base rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
