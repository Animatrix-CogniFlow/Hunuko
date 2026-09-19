import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

/** Small inline spinner — used inside buttons, inputs, etc. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-5 w-5 rounded-full border-2",
        "border-silver-300 border-t-gold-500",
        "dark:border-[#96C4BB]/20 dark:border-t-[#96C4BB]",
        "cf-spin-slow [animation-duration:0.7s]",
        className
      )}
    />
  );
}

/** Shimmer placeholder for loading content blocks. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-silver-200 dark:bg-gradient-to-r dark:from-[#111A18] dark:via-[#1A2825] dark:to-[#111A18] border border-transparent dark:border-[#96C4BB]/10",
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent dark:from-transparent dark:via-[#96C4BB]/10 dark:to-transparent [animation:cf-shimmer_1.8s_infinite]" />
    </div>
  );
}

/** Full-page loading state shown during route transitions. */
export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center">
        <div className="h-12 w-12 rounded-full bg-[#507C7C]/20 blur-lg animate-pulse" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="h-9 w-9 rounded-full border-2 border-silver-300 border-t-gold-500 dark:border-[#96C4BB]/20 dark:border-t-[#D4AF37] dark:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
        />
      </div>
      <p className="text-sm font-medium tracking-wide text-silver-600 dark:text-[#A3B8B5]">
        Loading intelligence…
      </p>
    </div>
  );
}
