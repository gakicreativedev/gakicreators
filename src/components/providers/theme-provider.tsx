"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type ThemeId, getStoredTheme, setStoredTheme, applyTheme, isFirstVisit } from "@/lib/theme";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  showThemeSelector: boolean;
  setShowThemeSelector: (show: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("azul-profundo");
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getStoredTheme();
    setThemeState(stored);
    applyTheme(stored);

    if (isFirstVisit()) {
      setShowThemeSelector(true);
    }

    setMounted(true);
  }, []);

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    setStoredTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, showThemeSelector, setShowThemeSelector }}>
      {mounted ? children : (
        <div style={{ visibility: "hidden" }}>
          {children}
        </div>
      )}
    </ThemeContext.Provider>
  );
}
