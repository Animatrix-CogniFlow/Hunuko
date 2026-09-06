import { useRef, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { cn } from "../../lib/utils";
import { useQuality } from "../../hooks/useQuality";

/**
 * Interactive card with cursor-tracking spotlight + subtle 3D tilt.
 * Performance notes:
 *  - The bounding rect is cached on enter (no layout reads per move).
 *  - Tilt uses transforms only (GPU composited).
 *  - The paint-heavy radial-gradient spotlight is disabled when the
 *    user prefers reduced motion, falling back to a CSS hover border.
 */
export function SpotlightCard({
  children,
  className,
  tilt = true,
}: {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
}) {
  const q = useQuality();
  const enabled = q.spotlight; // gated by quality tier
  const ref = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);

  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const rx = useSpring(useMotionValue(0), { stiffness: 180, damping: 22 });
  const ry = useSpring(useMotionValue(0), { stiffness: 180, damping: 22 });

  function handleEnter() {
    rectRef.current = ref.current?.getBoundingClientRect() ?? null;
  }

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    if (!enabled) return;
    const rect = rectRef.current;
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    mx.set(px * 100);
    my.set(py * 100);
    if (tilt) {
      rx.set((0.5 - py) * 6);
      ry.set((px - 0.5) * 6);
    }
  }

  function handleLeave() {
    rx.set(0);
    ry.set(0);
  }

  const spotlight = useMotionTemplate`radial-gradient(220px circle at ${mx}% ${my}%, rgba(150,196,187,0.18), transparent 70%)`;

  return (
    <motion.div
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={enabled && q.animate && tilt ? { rotateX: rx, rotateY: ry, transformPerspective: 900 } : undefined}
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-all duration-300",
        "border-[#96C4BB]/30 bg-white/95 text-[#0B1311] shadow-sm",
        "dark:border-[#96C4BB]/30 dark:bg-[#0E1715]/90 dark:text-[#F8FAFA] backdrop-blur-md",
        "hover:border-[#96C4BB]/60 dark:hover:border-[#96C4BB]/60 hover:shadow-[0_8px_30px_rgba(80,124,124,0.22)]",
        className
      )}
    >
      {enabled && (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: spotlight }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
