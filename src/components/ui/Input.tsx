import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

// `prefix` conflicts with the native HTML attribute (type: string | undefined).
// We omit it and add our own typed version as `inputPrefix` / `inputSuffix`.
interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "prefix"
> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, suffix, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium uppercase tracking-widest text-ash-400"
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            "relative flex items-center rounded-lg border bg-obsidian-800 transition-all duration-200",
            error
              ? "border-danger/60 focus-within:border-danger"
              : "border-obsidian-600 focus-within:border-gold-600/60 focus-within:shadow-gold-sm",
          )}
        >
          {prefix && (
            <span className="flex items-center pl-3 text-ash-500">
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full bg-transparent px-4 py-3 text-sm text-ash-100 placeholder:text-ash-600",
              "focus:outline-none",
              "font-mono",
              prefix && "pl-2",
              suffix && "pr-2",
              className,
            )}
            {...props}
          />

          {suffix && (
            <span className="flex items-center pr-3 text-ash-500">
              {suffix}
            </span>
          )}
        </div>

        {error && (
          <p className="text-xs text-danger" role="alert" aria-live="polite">
            {error}
          </p>
        )}
        {hint && !error && <p className="text-xs text-ash-600">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
