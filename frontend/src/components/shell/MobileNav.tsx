import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { NAV_ITEMS } from "../../config/navigation";
import { BrandLogo } from "../brand/BrandLogo";
import { cn } from "../../lib/utils";

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-silver-900/50 backdrop-blur-sm dark:bg-abyss-950/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="absolute left-0 top-0 h-full w-72 border-r border-[#96C4BB]/15 bg-[#0A100E]/95 p-4 backdrop-blur-2xl shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between border-b border-[#96C4BB]/10 pb-4">
              <BrandLogo size={30} />
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="rounded-lg p-1.5 text-[#B2C9C5] hover:bg-[#111A18] hover:text-[#F8FAFA] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-1.5">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/app"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all",
                      isActive
                        ? "bg-gradient-to-r from-[#507C7C]/20 to-[#96C4BB]/10 text-white border-l-4 border-[#D4AF37] font-semibold shadow-[0_0_15px_rgba(80,124,124,0.15)]"
                        : "text-[#B2C9C5] hover:bg-[#507C7C]/10 hover:text-[#F8FAFA] border-l-4 border-transparent"
                    )
                  }
                >
                  <item.icon className="h-5 w-5 shrink-0 text-[#96C4BB]" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
