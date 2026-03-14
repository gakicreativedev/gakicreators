"use client";

import { useState } from "react";
import { themes, type ThemeId, markVisited } from "@/lib/theme";
import { useTheme } from "@/components/providers/theme-provider";
import { Check, Palette } from "lucide-react";

export function ThemeSelector() {
  const { theme, setTheme, showThemeSelector, setShowThemeSelector } = useTheme();
  const [selected, setSelected] = useState<ThemeId>(theme);

  if (!showThemeSelector) return null;

  const handleConfirm = () => {
    setTheme(selected);
    markVisited();
    setShowThemeSelector(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 rounded-2xl bg-bg-card border border-border p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-2">
          <Palette className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-semibold text-text-primary">
            Bem-vindo ao Naka OS
          </h2>
        </div>
        <p className="text-text-secondary text-sm mb-6">
          Escolha o tema visual do sistema. Você pode alterar depois nas Configurações.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`relative rounded-xl p-4 text-left transition-all border-2 ${
                selected === t.id
                  ? "border-accent shadow-lg"
                  : "border-transparent hover:border-border"
              }`}
              style={{ backgroundColor: t.preview.bg }}
            >
              {selected === t.id && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div
                className="w-full h-8 rounded-lg mb-3"
                style={{ backgroundColor: t.preview.card, border: `1px solid ${t.preview.accent}20` }}
              />
              <div className="flex gap-2 mb-3">
                <div className="w-8 h-2 rounded-full" style={{ backgroundColor: t.preview.accent }} />
                <div className="w-12 h-2 rounded-full opacity-40" style={{ backgroundColor: t.preview.text }} />
              </div>
              <p className="text-xs font-medium" style={{ color: t.preview.text }}>
                {t.name}
              </p>
              <p className="text-xs opacity-60 mt-0.5" style={{ color: t.preview.text }}>
                {t.description}
              </p>
            </button>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          className="mt-6 w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
