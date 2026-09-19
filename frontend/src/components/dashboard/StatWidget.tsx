import type { LucideIcon } from "lucide-react";
import { SpotlightCard } from "../ui/SpotlightCard";
import { Counter } from "../ui/Counter";

export function StatWidget({
  icon: Icon,
  label,
  value,
  numeric,
  suffix = "",
  decimals = 0,
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  numeric?: number;
  suffix?: string;
  decimals?: number;
  trend?: string;
}) {
  return (
    <SpotlightCard className="p-5" tilt={false}>
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#507C7C]/20 text-[#96C4BB] border border-[#96C4BB]/30 shadow-[0_0_15px_rgba(80,124,124,0.2)]">
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-2xl font-bold tracking-tight text-[#0B1311] dark:text-[#F8FAFA]">
        {numeric !== undefined ? (
          <Counter to={numeric} suffix={suffix} decimals={decimals} />
        ) : (
          value
        )}
      </p>
      <p className="mt-1 text-xs font-medium text-[#2D3E3A] dark:text-[#A3B8B5]">{label}</p>
    </SpotlightCard>
  );
}
