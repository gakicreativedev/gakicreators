"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { themes, type ThemeId } from "@/lib/theme";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Check, LogOut, Palette, Shield, Bell } from "lucide-react";

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-1">
        Configurações
      </h1>
      <p className="text-text-secondary text-sm mb-8">
        Personalize o Naka OS
      </p>

      {/* Tema */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-text-primary">Tema</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id as ThemeId)}
              className={`relative rounded-xl p-4 text-left transition-all border-2 ${
                theme === t.id
                  ? "border-accent"
                  : "border-transparent hover:border-border"
              }`}
              style={{ backgroundColor: t.preview.bg }}
            >
              {theme === t.id && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div
                className="w-full h-6 rounded-lg mb-2"
                style={{ backgroundColor: t.preview.card }}
              />
              <div className="w-6 h-1.5 rounded-full" style={{ backgroundColor: t.preview.accent }} />
              <p className="text-xs font-medium mt-2" style={{ color: t.preview.text }}>
                {t.name}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Notificações */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-text-primary">
            Notificações
          </h2>
        </div>
        <div className="rounded-xl bg-bg-card border border-border p-4">
          <p className="text-sm text-text-muted">
            Configurações de notificações estarão disponíveis em breve.
          </p>
        </div>
      </section>

      {/* Permissões */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-text-primary">
            Permissões
          </h2>
        </div>
        <div className="rounded-xl bg-bg-card border border-border p-4">
          <p className="text-sm text-text-muted">
            Gerenciamento de usuários e níveis de acesso — em breve.
          </p>
        </div>
      </section>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-danger/10 hover:bg-danger/20 text-danger text-sm font-medium transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sair do sistema
      </button>
    </div>
  );
}
