import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-silver-700 dark:text-[#B2C9C5]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-silver-400 dark:text-[#96C4BB]/70">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-silver-900 outline-none transition-all duration-200",
              "border-silver-300 placeholder:text-silver-400 focus:border-gold-500 focus:ring-2 focus:ring-gold-400/20",
              "dark:bg-[#111A18]/80 dark:border-[#96C4BB]/25 dark:text-[#F8FAFA] dark:placeholder-[#A3B8B5]/50 dark:focus:border-[#96C4BB]/70 dark:focus:ring-2 dark:focus:ring-[#96C4BB]/20",
              icon && "pl-10",
              error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
