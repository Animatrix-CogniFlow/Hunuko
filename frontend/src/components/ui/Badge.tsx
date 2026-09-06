import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type Tone = "neutral" | "gold" | "teal" | "flow" | "success" | "warning";

const tones: Record<Tone, string> = {
  neutral: "bg-silver-200 text-[#0B1311] dark:bg-[#111A18] dark:text-[#B2C9C5] border border-silver-300 dark:border-[#96C4BB]/20",
  gold:    "bg-[#D4AF37]/20 text-[#694803] font-bold border border-[#D4AF37]/60 dark:bg-[#D4AF37]/25 dark:text-[#F8FAFA] dark:border-[#D4AF37]/70 shadow-[0_0_12px_rgba(212,175,55,0.25)]",
  teal:    "bg-[#507C7C]/20 text-[#1D4A46] font-semibold border border-[#507C7C]/40 dark:bg-[#507C7C]/25 dark:text-[#96C4BB] dark:border-[#96C4BB]/40 shadow-[0_0_12px_rgba(80,124,124,0.2)]",
  flow:    "bg-[#E8F0EE] text-[#1D4A46] font-semibold border border-[#96C4BB]/40 backdrop-blur-md dark:bg-[#0E1715]/95 dark:text-[#96C4BB] dark:border-[#96C4BB]/40 shadow-[0_0_15px_rgba(80,124,124,0.25)]",
  success: "bg-emerald-50 text-emerald-800 font-semibold border border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  warning: "bg-amber-50 text-amber-900 font-semibold border border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
