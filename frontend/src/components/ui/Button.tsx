import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "size">,
    Pick<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[#D4AF37] text-[#070B0A] hover:bg-[#e0be4d] font-bold shadow-lg shadow-[#D4AF37]/25 transition-all",
  secondary:
    "bg-silver-200 text-[#0B1311] hover:bg-silver-300 border border-silver-300 dark:bg-[#111A18] dark:text-[#F8FAFA] dark:border-[#96C4BB]/30 dark:hover:bg-[#152220] dark:hover:border-[#96C4BB]/50 transition-all",
  ghost:
    "text-[#2D3E3A] hover:text-[#0B1311] hover:bg-silver-200 dark:text-[#B2C9C5] dark:hover:text-[#F8FAFA] dark:hover:bg-[#507C7C]/20 transition-colors",
  outline:
    "border border-[#96C4BB]/40 text-[#2D3E3A] hover:text-[#0B1311] hover:bg-[#507C7C]/10 dark:border-[#96C4BB]/40 dark:text-[#B2C9C5] dark:hover:text-[#F8FAFA] dark:hover:bg-[#507C7C]/20 dark:hover:border-[#96C4BB]/70 backdrop-blur-sm transition-all",
  danger: "bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-600/25",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2.5 py-3.5",
  icon: "h-10 w-10",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1.5, scale: 1.01 }}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium tracking-tight transition-all duration-200 cursor-pointer",
        "focus-visible:outline-[#D4AF37] dark:focus-visible:outline-[#96C4BB] disabled:opacity-50 disabled:pointer-events-none select-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="mr-2 h-4 w-4 rounded-full border-2 border-current border-t-transparent cf-spin-slow [animation-duration:0.7s]" />
      )}
      {children as React.ReactNode}
    </motion.button>
  )
);
Button.displayName = "Button";
