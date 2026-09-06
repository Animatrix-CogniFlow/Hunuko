import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MotionLevel, QualityTier, ThemeMode } from "../lib/types";

interface PreferencesState {
  theme: ThemeMode;
  motion: MotionLevel;
  quality: QualityTier;
  highContrast: boolean;
  notifications: { product: boolean; learning: boolean; agents: boolean };
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
  setMotion: (m: MotionLevel) => void;
  setQuality: (q: QualityTier) => void;
  setHighContrast: (v: boolean) => void;
  setNotification: (k: keyof PreferencesState["notifications"], v: boolean) => void;
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    const oldSaved = localStorage.getItem("hunuko-preferences") || localStorage.getItem("cogniflow-preferences");
    if (oldSaved) {
      const parsed = JSON.parse(oldSaved);
      if (parsed?.state?.theme === "light" || parsed?.state?.theme === "dark") {
        return parsed.state.theme;
      }
    }
  } catch {}
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyThemeToDOM(theme: ThemeMode) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  try {
    localStorage.setItem("theme", theme);
  } catch {}
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: getInitialTheme(),
      motion: "full",
      quality: "auto",
      highContrast: false,
      notifications: { product: true, learning: true, agents: false },
      setTheme: (theme) => {
        applyThemeToDOM(theme);
        set({ theme });
      },
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === "dark" ? "light" : "dark";
          applyThemeToDOM(next);
          return { theme: next };
        }),
      setMotion: (motion) => set({ motion }),
      setQuality: (quality) => set({ quality }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setNotification: (k, v) =>
        set((s) => ({ notifications: { ...s.notifications, [k]: v } })),
    }),
    { name: "hunuko-preferences" }
  )
);
