import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  speech = "Ready when you are! Upload lecture notes to get started.",
  action,
  withMascot = true,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  speech?: string;
  action?: ReactNode;
  withMascot?: boolean;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#96C4BB]/30 bg-white/70 px-6 py-12 text-center backdrop-blur-xl dark:border-[#96C4BB]/25 dark:bg-[#0E1715]/75 shadow-xl">
      {withMascot ? (
        <div className="mb-6 flex flex-col items-center">
          {/* Speech Bubble */}
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative mb-3 max-w-xs rounded-2xl border border-[#96C4BB]/35 bg-[#131F1C]/95 px-4 py-2.5 text-xs font-medium text-[#F8FAFA] shadow-[0_0_15px_rgba(80,124,124,0.2)]"
          >
            <div className="flex items-center gap-1.5 justify-center">
              <Sparkles className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
              <span>{speech}</span>
            </div>
            {/* Bubble arrow pointing down */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-0 w-0 border-x-4 border-x-transparent border-t-8 border-t-[#131F1C]" />
          </motion.div>

          {/* Floating Mascot Image with Radial Aura */}
          <div className="relative flex items-center justify-center">
            <div className="absolute h-28 w-28 rounded-full bg-[#507C7C]/20 blur-xl animate-pulse" />
            <div className="absolute h-20 w-20 rounded-full bg-[#D4AF37]/15 blur-lg" />
            <motion.img
              src="/assets/mascot.jpg"
              alt="Hunuko Mascot"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 h-28 w-28 rounded-2xl object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] border border-[#96C4BB]/20"
            />
          </div>
        </div>
      ) : (
        Icon && (
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#507C7C]/20 text-[#96C4BB] border border-[#96C4BB]/30 shadow-[0_0_15px_rgba(80,124,124,0.2)]">
            <Icon className="h-6 w-6" />
          </div>
        )
      )}

      <h3 className="font-display text-xl font-semibold tracking-tight text-[#0B1311] dark:text-[#F8FAFA]">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-silver-600 dark:text-[#A3B8B5] leading-relaxed">
        {description}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
