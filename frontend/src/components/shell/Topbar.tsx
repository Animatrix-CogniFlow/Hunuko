import { useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, Search, LogOut, Menu, Gauge } from "lucide-react";
import { Button } from "../ui/Button";
import { useTheme } from "../../hooks/useTheme";
import { useAuthStore } from "../../stores/useAuthStore";
import { usePreferencesStore } from "../../stores/usePreferencesStore";
import { useQuality } from "../../hooks/useQuality";
import { NAV_ITEMS } from "../../config/navigation";
import type { QualityTier } from "../../lib/types";

const QUALITY_CYCLE: QualityTier[] = ["auto", "cinematic", "balanced", "performance"];

export function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const quality = usePreferencesStore((s) => s.quality);
  const setQuality = usePreferencesStore((s) => s.setQuality);
  const profile = useQuality();

  function cycleQuality() {
    const i = QUALITY_CYCLE.indexOf(quality);
    setQuality(QUALITY_CYCLE[(i + 1) % QUALITY_CYCLE.length]);
  }

  const current =
    [...NAV_ITEMS].sort((a, b) => b.to.length - a.to.length).find((i) =>
      pathname.startsWith(i.to)
    ) ?? NAV_ITEMS[0];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#96C4BB]/15 bg-[#0A100E]/85 px-4 backdrop-blur-xl sm:px-6">
      <button
        onClick={onOpenMobile}
        aria-label="Open menu"
        className="rounded-lg p-2 text-[#A3B8B5] hover:bg-[#111A18] hover:text-[#F8FAFA] border border-transparent hover:border-[#96C4BB]/20 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0">
        <h1 className="font-display text-base font-semibold leading-tight tracking-tight text-[#F8FAFA] sm:text-lg">
          {current.label}
        </h1>
        <p className="hidden truncate text-xs text-[#A3B8B5] sm:block">
          {current.description}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#96C4BB]/60" />
          <input
            placeholder="Search intelligence…"
            className="h-10 w-56 rounded-xl border border-[#96C4BB]/20 bg-[#111A18]/80 pl-9 pr-3 text-sm text-[#F8FAFA] placeholder-[#A3B8B5]/50 outline-none transition-all focus:border-[#96C4BB]/70 focus:ring-2 focus:ring-[#96C4BB]/20"
          />
        </div>

        <button
          onClick={cycleQuality}
          title={`Visual quality: ${quality} (${profile.tier})`}
          aria-label={`Visual quality: ${quality}, rendering ${profile.tier}. Click to change.`}
          className="hidden items-center gap-1.5 rounded-xl border border-[#96C4BB]/20 bg-[#111A18]/80 px-2.5 py-2 text-xs font-medium capitalize text-[#B2C9C5] transition-all hover:border-[#D4AF37]/50 hover:text-[#D4AF37] sm:flex cursor-pointer"
        >
          <Gauge className="h-4 w-4 text-[#D4AF37]" />
          {quality === "auto" ? `Auto · ${profile.tier}` : quality}
        </button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="rounded-xl border border-[#96C4BB]/20 bg-[#111A18]/60 hover:bg-[#152220] hover:border-[#96C4BB]/40 text-[#D4AF37]"
        >
          {theme === "dark" ? <Sun className="h-5 w-5 text-[#D4AF37]" /> : <Moon className="h-5 w-5 text-[#96C4BB]" />}
        </Button>

        <div className="flex items-center gap-2 rounded-xl border border-[#96C4BB]/20 bg-[#111A18]/80 p-1 pr-2.5 shadow-sm">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-[#070B0A] shadow-sm"
            style={{ backgroundColor: user?.avatarColor ?? "#D4AF37" }}
          >
            {(user?.name ?? "U").slice(0, 1).toUpperCase()}
          </span>
          <span className="hidden max-w-[110px] truncate text-sm font-medium text-[#F8FAFA] sm:block">
            {user?.name ?? "Guest"}
          </span>
          <button
            aria-label="Sign out"
            onClick={async () => {
              await signOut();
              navigate("/signin");
            }}
            className="ml-1 rounded-md p-1 text-[#A3B8B5] hover:text-rose-400 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
