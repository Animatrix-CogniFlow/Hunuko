import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { interactive?: boolean }>(
  ({ className, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border bg-white/90 backdrop-blur-xl text-[#0B1311]",
        "border-[#96C4BB]/30 shadow-sm",
        "dark:bg-[#0E1715]/85 dark:border-[#96C4BB]/20 dark:text-[#F8FAFA] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]",
        interactive &&
          "transition-all duration-300 hover:border-[#96C4BB]/60 hover:shadow-[0_0_20px_rgba(80,124,124,0.25)] hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 sm:p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-display text-lg font-semibold tracking-tight text-[#0B1311] dark:text-[#F8FAFA]", className)}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5 sm:px-6 sm:pb-6", className)} {...props} />;
}
