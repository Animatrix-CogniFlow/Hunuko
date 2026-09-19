import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Sparkles } from "lucide-react";
import { NAV_ITEMS } from "../../config/navigation";
import { BrandLogo } from "../brand/BrandLogo";
import { cn } from "../../lib/utils";
import { useAgentStore } from "../../stores/useAgentStore";

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const orchestrating = useAgentStore((s) => s.orchestrating);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[#96C4BB]/15 bg-[#0A100E]/90 backdrop-blur-xl lg:flex isolate transition-all duration-300",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      {/* Sidebar Header with Brand Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-[#96C4BB]/10">
        {collapsed ? <BrandLogo withText={false} size={32} /> : <BrandLogo size={32} />}
        <button
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="rounded-lg p-1.5 text-[#B2C9C5] transition-all hover:bg-[#111A18] hover:text-[#F8FAFA] border border-transparent hover:border-[#96C4BB]/20"
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform duration-300", collapsed && "rotate-180")}
          />
        </button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/app"}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-[#507C7C]/20 to-[#96C4BB]/10 text-white border-l-4 border-[#D4AF37] font-semibold shadow-[0_0_15px_rgba(80,124,124,0.15)]"
                  : "text-[#B2C9C5] hover:text-[#F8FAFA] hover:bg-[#507C7C]/10 border-l-4 border-transparent"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    "relative z-10 h-[18px] w-[18px] shrink-0 transition-colors",
                    isActive ? "text-[#D4AF37]" : "text-[#96C4BB] group-hover:text-[#F8FAFA]"
                  )}
                />
                {!collapsed && (
                  <span className="relative z-10 truncate tracking-wide">
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Side Nav Mini-Companion Mascot Pill */}
      <div className="border-t border-[#96C4BB]/15 p-3">
        <div
          className={cn(
            "group relative flex items-center gap-3 rounded-2xl border border-[#96C4BB]/20 bg-gradient-to-r from-[#0E1715] to-[#131F1C] p-2.5 transition-all hover:border-[#96C4BB]/50 hover:shadow-[0_0_20px_rgba(80,124,124,0.25)]",
            collapsed && "justify-center p-2"
          )}
        >
          {/* Mascot Mini-Avatar with Glow */}
          <div className="relative flex shrink-0 items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-1 rounded-full bg-[#507C7C]/30 blur-md"
            />
            <motion.img
              src="/assets/mascot.jpg"
              alt="Hunuko Mascot"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 h-8 w-8 rounded-full object-cover border border-[#96C4BB]/40 shadow-sm"
            />
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 z-20 h-2.5 w-2.5 rounded-full border border-[#070B0A]",
                orchestrating ? "bg-[#D4AF37] animate-ping" : "bg-emerald-400 shadow-[0_0_6px_#34d399]"
              )}
            />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate text-xs font-semibold text-[#F8FAFA]">Hunuko Companion</p>
                <Sparkles className="h-3 w-3 text-[#D4AF37] shrink-0" />
              </div>
              <p className="truncate text-[11px] text-[#A3B8B5]">
                {orchestrating ? "Reasoning & active…" : "Standing by to assist"}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
