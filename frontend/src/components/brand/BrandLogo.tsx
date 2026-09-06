import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import logoImg from "./logo.jpeg";

export function BrandLogo({
  className,
  withText = true,
  size = 32,
  textClassName,
}: {
  className?: string;
  withText?: boolean;
  size?: number;
  textClassName?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <motion.div
        whileHover={{ rotate: 5, scale: 1.05 }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
        className="relative flex items-center justify-center rounded-xl overflow-hidden shadow-sm"
        style={{ width: size, height: size }}
      >
        <img
          src={logoImg}
          alt="Hunuko logo"
          width={size}
          height={size}
          className="h-full w-full object-contain rounded-lg"
          draggable={false}
        />
      </motion.div>
      {withText && (
        <span
          className={cn(
            "font-display text-xl font-bold tracking-tight drop-shadow-sm",
            textClassName || "text-[#0B1311] dark:text-white"
          )}
        >
          Hunu<span className="text-[#D4AF37]">ko</span>
        </span>
      )}
    </div>
  );
}

export const Logo = BrandLogo;
