"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { themes, type ThemeId } from "@/lib/theme";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Check,
  LogOut,
  Palette,
  Shield,
  Bell,
  User,
  Camera,
  Loader2,
  Users,
  Mail,
} from "lucide-react";
import type { Profile } from "@/lib/types";

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editNome, setEditNome] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Notification preferences (stored in localStorage for now)
  const [notifTarefas, setNotifTarefas] = useState(true);
  const [notifFinanceiro, setNotifFinanceiro] = useState(true);
  const [notifContratos, setNotifContratos] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setEditNome(profileData.nome);
    }

    // Load team members
    const { data: members } = await supabase
      .from("profiles")
      .select("*")
      .order("nome");

    if (members) setTeamMembers(members);

    // Load notification prefs from localStorage
    const prefs = localStorage.getItem("naka-notif-prefs");
    if (prefs) {
      const p = JSON.parse(prefs);
      setNotifTarefas(p.tarefas ?? true);
      setNotifFinanceiro(p.financeiro ?? true);
      setNotifContratos(p.contratos ?? true);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveProfile = async () => {
    if (!profile || !editNome.trim()) return;
    setSaving(true);

    const { data } = await supabase
      .from("profiles")
      .update({ nome: editNome.trim(), updated_at: new Date().toISOString() })
      .eq("id", profile.id)
      .select()
      .single();

    if (data) setProfile(data);
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setAvatarUploading(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${profile.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, file, { upsert: true });

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("logos").getPublicUrl(path);

      const { data } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", profile.id)
        .select()
        .single();

      if (data) setProfile(data);
    }
    setAvatarUploading(false);
  };

  const saveNotifPrefs = (key: string, value: boolean) => {
    const current = {
      tarefas: notifTarefas,
      financeiro: notifFinanceiro,
      contratos: notifContratos,
      [key]: value,
    };
    localStorage.setItem("naka-notif-prefs", JSON.stringify(current));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    socio: "Socio",
    admin: "Admin",
    colaborador: "Colaborador",
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-1">Configuracoes</h1>
      <p className="text-text-secondary text-sm mb-8">Personalize o Naka OS</p>

      {/* Perfil */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-text-primary">Perfil</h2>
        </div>
        <div className="rounded-2xl bg-bg-card border border-border p-5">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-16 h-16 rounded-2xl bg-accent-light flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-accent text-xl font-bold">
                    {(profile?.nome || "U")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                {avatarUploading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-xs text-text-muted mb-1">Nome</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl glass-input text-text-primary text-sm focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving || editNome === profile?.nome}
                    className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Salvar"
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Email</label>
                <p className="text-sm text-text-secondary">{profile?.email}</p>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Cargo</label>
                <span className="px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-medium">
                  {roleLabels[profile?.role || "colaborador"] || profile?.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              <div
                className="w-6 h-1.5 rounded-full"
                style={{ backgroundColor: t.preview.accent }}
              />
              <p
                className="text-xs font-medium mt-2"
                style={{ color: t.preview.text }}
              >
                {t.name}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Notificacoes */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-text-primary">Notificacoes</h2>
        </div>
        <div className="rounded-2xl bg-bg-card border border-border divide-y divide-border">
          <ToggleRow
            label="Tarefas vencendo ou atrasadas"
            description="Receba alertas sobre prazos de tarefas"
            checked={notifTarefas}
            onChange={(v) => {
              setNotifTarefas(v);
              saveNotifPrefs("tarefas", v);
            }}
          />
          <ToggleRow
            label="Movimentacoes financeiras"
            description="Alertas sobre contas a pagar e vencer"
            checked={notifFinanceiro}
            onChange={(v) => {
              setNotifFinanceiro(v);
              saveNotifPrefs("financeiro", v);
            }}
          />
          <ToggleRow
            label="Renovacao de contratos"
            description="Aviso quando contratos estiverem proximos da renovacao"
            checked={notifContratos}
            onChange={(v) => {
              setNotifContratos(v);
              saveNotifPrefs("contratos", v);
            }}
          />
        </div>
      </section>

      {/* Equipe */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-text-primary">Equipe</h2>
        </div>
        <div className="rounded-2xl bg-bg-card border border-border divide-y divide-border">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center overflow-hidden flex-shrink-0">
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-accent text-sm font-bold">
                    {member.nome[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {member.nome}
                  {member.id === profile?.id && (
                    <span className="text-text-muted text-xs ml-1">(voce)</span>
                  )}
                </p>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-text-muted" />
                  <span className="text-xs text-text-muted truncate">
                    {member.email}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                {roleLabels[member.role] || member.role}
              </span>
            </div>
          ))}
          {teamMembers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-text-muted text-sm">Nenhum membro encontrado.</p>
            </div>
          )}
        </div>
      </section>

      {/* Permissoes */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-text-primary">Permissoes</h2>
        </div>
        <div className="rounded-2xl bg-bg-card border border-border p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">Nivel de acesso atual</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {profile?.role === "socio"
                    ? "Acesso total a todos os modulos e configuracoes"
                    : profile?.role === "admin"
                      ? "Acesso a todos os modulos, sem gestao de permissoes"
                      : "Acesso limitado conforme definido pelo administrador"}
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-success/15 text-success">
                {roleLabels[profile?.role || "colaborador"] || profile?.role}
              </span>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-4 pt-3 border-t border-border">
            Controle granular de permissoes por usuario estara disponivel em uma atualizacao futura.
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

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-muted mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          checked ? "bg-accent" : "bg-bg-hover border border-border"
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
