import { useEffect } from "react";
import { usePreferencesStore } from "../stores/usePreferencesStore";

/** Syncs theme + accessibility preferences to the document root and localStorage. */
export function useTheme() {
  const theme = usePreferencesStore((s) => s.theme);
  const highContrast = usePreferencesStore((s) => s.highContrast);
  const toggleTheme = usePreferencesStore((s) => s.toggleTheme);
  const setTheme = usePreferencesStore((s) => s.setTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.dataset.contrast = highContrast ? "high" : "normal";
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme, highContrast]);

  return { theme, toggleTheme, setTheme };
}
