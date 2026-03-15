export type ThemeId = "azul-profundo" | "azul-claro" | "dark-grey" | "off-white";

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  preview: {
    bg: string;
    card: string;
    accent: string;
    text: string;
  };
}

export const themes: Theme[] = [
  {
    id: "azul-profundo",
    name: "Azul Profundo",
    description: "Elegante e minimalista",
    preview: { bg: "#0c0f14", card: "#181c26", accent: "#5a9cf5", text: "#e8eaed" },
  },
  {
    id: "azul-claro",
    name: "Azul Claro",
    description: "Leve e acessível",
    preview: { bg: "#f0f7ff", card: "#ffffff", accent: "#2563eb", text: "#0f172a" },
  },
  {
    id: "dark-grey",
    name: "Dark Grey",
    description: "Modo noturno sofisticado",
    preview: { bg: "#111111", card: "#222222", accent: "#3b82f6", text: "#f5f5f5" },
  },
  {
    id: "off-white",
    name: "Off-white",
    description: "Elegante e limpo",
    preview: { bg: "#fafaf9", card: "#ffffff", accent: "#1d4ed8", text: "#1c1917" },
  },
];

const THEME_KEY = "naka-os-theme";
const FIRST_VISIT_KEY = "naka-os-first-visit";

export function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "azul-profundo";
  return (localStorage.getItem(THEME_KEY) as ThemeId) || "azul-profundo";
}

export function setStoredTheme(theme: ThemeId): void {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute("data-theme", theme);
}

export function isFirstVisit(): boolean {
  if (typeof window === "undefined") return true;
  return !localStorage.getItem(FIRST_VISIT_KEY);
}

export function markVisited(): void {
  localStorage.setItem(FIRST_VISIT_KEY, "true");
}

export function applyTheme(theme: ThemeId): void {
  document.documentElement.setAttribute("data-theme", theme);
}
