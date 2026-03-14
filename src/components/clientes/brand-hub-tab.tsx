"use client";

import { useState, useRef } from "react";
import {
  Loader2,
  Upload,
  Trash2,
  Plus,
  X,
  Copy,
  Check,
  Clock,
  Image as ImageIcon,
  Type,
  Droplets,
  FileText,
  ExternalLink,
} from "lucide-react";
import { useBrandHub, type BrandFonte, type BrandCor } from "@/lib/hooks/use-brand-hub";

// ========== Color Helpers ==========
function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "";
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function hexToCmyk(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "";
  let r = parseInt(h.substring(0, 2), 16) / 255;
  let g = parseInt(h.substring(2, 4), 16) / 255;
  let b = parseInt(h.substring(4, 6), 16) / 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return "0, 0, 0, 100";
  const c = Math.round(((1 - r - k) / (1 - k)) * 100);
  const m = Math.round(((1 - g - k) / (1 - k)) * 100);
  const y = Math.round(((1 - b - k) / (1 - k)) * 100);
  return `${c}, ${m}, ${y}, ${Math.round(k * 100)}`;
}

// ========== Copy Button ==========
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="p-1 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors">
      {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// ========== Main Component ==========
export function BrandHubTab({ clienteId }: { clienteId: string }) {
  const {
    brandHub,
    logos,
    historico,
    loading,
    updateField,
    updateFontes,
    updateCores,
    uploadLogo,
    deleteLogo,
  } = useBrandHub(clienteId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  if (!brandHub) return null;

  return (
    <div className="space-y-6">
      {/* Logos */}
      <LogosSection logos={logos} onUpload={uploadLogo} onDelete={deleteLogo} />

      {/* Cores */}
      <CoresSection cores={brandHub.cores || []} onUpdate={updateCores} />

      {/* Fontes */}
      <FontesSection fontes={brandHub.fontes || []} onUpdate={updateFontes} />

      {/* Campos textuais */}
      <TextFieldsSection brandHub={brandHub} onUpdate={updateField} />

      {/* Histórico */}
      <HistoricoSection historico={historico} />
    </div>
  );
}

// ========== Logos Section ==========
const LOGO_CATEGORIAS = ["Principal", "Monocromática", "Negativa", "Ícone", "Horizontal", "Vertical", "Outra"];

function LogosSection({
  logos,
  onUpload,
  onDelete,
}: {
  logos: ReturnType<typeof useBrandHub>["logos"];
  onUpload: (file: File, categoria: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const [selectedCat, setSelectedCat] = useState("Principal");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await onUpload(file, selectedCat);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const grouped = LOGO_CATEGORIAS.reduce<Record<string, typeof logos>>((acc, cat) => {
    const items = logos.filter((l) => l.categoria === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div className="rounded-2xl bg-bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Logos</h3>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-2 py-1.5 rounded-lg bg-bg-primary border border-border text-text-primary text-xs"
          >
            {LOGO_CATEGORIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium cursor-pointer transition-colors">
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            Upload
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-text-muted text-sm text-center py-6">Nenhuma logo adicionada.</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <p className="text-xs text-text-muted mb-2">{cat}</p>
              <div className="flex flex-wrap gap-3">
                {items.map((logo) => (
                  <div
                    key={logo.id}
                    className="relative group w-24 h-24 rounded-xl border border-border bg-bg-primary flex items-center justify-center overflow-hidden"
                  >
                    <img src={logo.url} alt={cat} className="max-w-full max-h-full object-contain p-2" />
                    <button
                      onClick={() => onDelete(logo.id)}
                      className="absolute top-1 right-1 p-1 rounded-lg bg-danger/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ========== Cores Section ==========
function CoresSection({
  cores,
  onUpdate,
}: {
  cores: BrandCor[];
  onUpdate: (cores: BrandCor[]) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [newCor, setNewCor] = useState({ nome: "", hex: "#000000" });

  const addCor = async () => {
    if (!newCor.nome.trim()) return;
    const cor: BrandCor = {
      nome: newCor.nome,
      hex: newCor.hex,
      rgb: hexToRgb(newCor.hex),
      cmyk: hexToCmyk(newCor.hex),
    };
    await onUpdate([...cores, cor]);
    setNewCor({ nome: "", hex: "#000000" });
    setAdding(false);
  };

  const removeCor = async (index: number) => {
    await onUpdate(cores.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-2xl bg-bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Paleta de Cores</h3>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bg-hover text-text-secondary hover:text-text-primary text-xs font-medium transition-colors"
        >
          <Plus className="w-3 h-3" />
          Adicionar
        </button>
      </div>

      {cores.length === 0 && !adding ? (
        <p className="text-text-muted text-sm text-center py-6">Nenhuma cor definida.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cores.map((cor, i) => (
            <div key={i} className="rounded-xl border border-border overflow-hidden group">
              <div className="h-16 relative" style={{ backgroundColor: cor.hex }}>
                <button
                  onClick={() => removeCor(i)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="p-3 bg-bg-primary space-y-1">
                <p className="text-sm font-medium text-text-primary">{cor.nome}</p>
                <div className="flex items-center gap-1 text-xs text-text-muted">
                  <span>HEX: {cor.hex}</span>
                  <CopyButton text={cor.hex} />
                </div>
                <div className="flex items-center gap-1 text-xs text-text-muted">
                  <span>RGB: {cor.rgb}</span>
                  <CopyButton text={cor.rgb} />
                </div>
                <div className="flex items-center gap-1 text-xs text-text-muted">
                  <span>CMYK: {cor.cmyk}</span>
                  <CopyButton text={cor.cmyk} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="mt-4 flex items-end gap-3 p-4 rounded-xl bg-bg-primary border border-border">
          <div className="flex-1">
            <label className="block text-xs text-text-muted mb-1">Nome da cor</label>
            <input
              type="text"
              value={newCor.nome}
              onChange={(e) => setNewCor({ ...newCor, nome: e.target.value })}
              placeholder="Ex: Azul Principal"
              className="w-full px-3 py-2 rounded-lg bg-bg-card border border-border text-text-primary text-sm"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Cor</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newCor.hex}
                onChange={(e) => setNewCor({ ...newCor, hex: e.target.value })}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer"
              />
              <input
                type="text"
                value={newCor.hex}
                onChange={(e) => setNewCor({ ...newCor, hex: e.target.value })}
                className="w-24 px-2 py-2 rounded-lg bg-bg-card border border-border text-text-primary text-sm"
              />
            </div>
          </div>
          <button onClick={addCor} className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium">
            Adicionar
          </button>
          <button onClick={() => setAdding(false)} className="px-3 py-2 rounded-lg text-text-muted hover:text-text-primary text-sm">
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

// ========== Fontes Section ==========
function FontesSection({
  fontes,
  onUpdate,
}: {
  fontes: BrandFonte[];
  onUpdate: (fontes: BrandFonte[]) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [newFonte, setNewFonte] = useState({ nome: "", link: "" });

  const addFonte = async () => {
    if (!newFonte.nome.trim()) return;
    await onUpdate([...fontes, newFonte]);
    setNewFonte({ nome: "", link: "" });
    setAdding(false);
  };

  const removeFonte = async (index: number) => {
    await onUpdate(fontes.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-2xl bg-bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Fontes</h3>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bg-hover text-text-secondary hover:text-text-primary text-xs font-medium transition-colors"
        >
          <Plus className="w-3 h-3" />
          Adicionar
        </button>
      </div>

      {fontes.length === 0 && !adding ? (
        <p className="text-text-muted text-sm text-center py-6">Nenhuma fonte definida.</p>
      ) : (
        <div className="space-y-3">
          {fontes.map((fonte, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-bg-primary border border-border group">
              <div>
                <p className="text-sm font-medium text-text-primary">{fonte.nome}</p>
                <p className="text-2xl mt-1" style={{ fontFamily: fonte.nome }}>
                  Aa Bb Cc 123
                </p>
              </div>
              <div className="flex items-center gap-2">
                {fonte.link && (
                  <a
                    href={fonte.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-text-muted hover:text-accent transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => removeFonte(i)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="mt-4 flex items-end gap-3 p-4 rounded-xl bg-bg-primary border border-border">
          <div className="flex-1">
            <label className="block text-xs text-text-muted mb-1">Nome da fonte</label>
            <input
              type="text"
              value={newFonte.nome}
              onChange={(e) => setNewFonte({ ...newFonte, nome: e.target.value })}
              placeholder="Ex: Inter, Montserrat"
              className="w-full px-3 py-2 rounded-lg bg-bg-card border border-border text-text-primary text-sm"
              autoFocus
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-text-muted mb-1">Link para download</label>
            <input
              type="text"
              value={newFonte.link}
              onChange={(e) => setNewFonte({ ...newFonte, link: e.target.value })}
              placeholder="https://fonts.google.com/..."
              className="w-full px-3 py-2 rounded-lg bg-bg-card border border-border text-text-primary text-sm"
            />
          </div>
          <button onClick={addFonte} className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium">
            Adicionar
          </button>
          <button onClick={() => setAdding(false)} className="px-3 py-2 rounded-lg text-text-muted hover:text-text-primary text-sm">
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

// ========== Text Fields Section ==========
const TEXT_FIELDS = [
  { key: "nicho", label: "Nicho", placeholder: "Segmento de mercado da marca" },
  { key: "publico_alvo", label: "Público-alvo", placeholder: "Perfil demográfico e comportamental" },
  { key: "tom_de_voz", label: "Tom de voz", placeholder: "Como a marca se comunica" },
  { key: "slogan", label: "Slogan", placeholder: "Frase de posicionamento da marca" },
  { key: "concorrentes", label: "Concorrentes", placeholder: "Principais concorrentes identificados" },
  { key: "restricoes_visuais", label: "Restrições visuais", placeholder: "O que não deve ser usado visualmente" },
];

function TextFieldsSection({
  brandHub,
  onUpdate,
}: {
  brandHub: NonNullable<ReturnType<typeof useBrandHub>["brandHub"]>;
  onUpdate: (campo: string, valor: string | null) => Promise<void>;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = (key: string) => {
    setEditing(key);
    setTempValue((brandHub as unknown as Record<string, unknown>)[key] as string || "");
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    await onUpdate(editing, tempValue || null);
    setSaving(false);
    setEditing(null);
  };

  const cancel = () => {
    setEditing(null);
    setTempValue("");
  };

  return (
    <div className="rounded-2xl bg-bg-card border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Identidade da Marca</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEXT_FIELDS.map((field) => {
          const value = (brandHub as unknown as Record<string, unknown>)[field.key] as string | null;
          const isEditing = editing === field.key;

          return (
            <div key={field.key} className="rounded-xl bg-bg-primary border border-border p-4">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                {field.label}
              </p>
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-bg-card border border-border text-text-primary text-sm resize-none focus:border-accent focus:ring-1 focus:ring-accent"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={save}
                      disabled={saving}
                      className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium flex items-center gap-1"
                    >
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Salvar
                    </button>
                    <button onClick={cancel} className="px-3 py-1.5 rounded-lg text-text-muted text-xs">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => startEdit(field.key)}
                  className="w-full text-left"
                >
                  {value ? (
                    <p className="text-sm text-text-primary whitespace-pre-wrap">{value}</p>
                  ) : (
                    <p className="text-sm text-text-muted italic">{field.placeholder}</p>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ========== Historico Section ==========
function HistoricoSection({ historico }: { historico: ReturnType<typeof useBrandHub>["historico"] }) {
  if (historico.length === 0) return null;

  const fieldLabels: Record<string, string> = {
    nicho: "Nicho",
    publico_alvo: "Público-alvo",
    tom_de_voz: "Tom de voz",
    slogan: "Slogan",
    concorrentes: "Concorrentes",
    restricoes_visuais: "Restrições visuais",
    fontes: "Fontes",
    cores: "Cores",
  };

  return (
    <div className="rounded-2xl bg-bg-card border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
          Histórico de Alterações
        </h3>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {historico.map((h) => (
          <div key={h.id} className="flex items-start gap-3 p-2 text-xs">
            <span className="text-text-muted whitespace-nowrap">
              {new Date(h.created_at).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="text-text-secondary">
              <strong className="text-text-primary">{fieldLabels[h.campo_alterado] || h.campo_alterado}</strong> atualizado
              {h.valor_anterior && (
                <span className="text-text-muted"> de "{h.valor_anterior.substring(0, 30)}..."</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
