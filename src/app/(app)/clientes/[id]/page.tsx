"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  FileText,
  Palette,
  KanbanSquare,
  DollarSign,
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useCliente } from "@/lib/hooks/use-clientes";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/modal";
import { ClienteFormComponent } from "@/components/clientes/cliente-form";
import type { ClienteForm, ClientStatus } from "@/lib/types";

const statusConfig: Record<ClientStatus, { label: string; className: string }> = {
  ativo: { label: "Ativo", className: "bg-success/15 text-success" },
  pausado: { label: "Pausado", className: "bg-warning/15 text-warning" },
  encerrado: { label: "Encerrado", className: "bg-text-muted/15 text-text-muted" },
};

type Tab = "dados" | "brand" | "tarefas" | "financeiro";

const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: "dados", label: "Dados Gerais", icon: FileText },
  { id: "brand", label: "Brand Hub", icon: Palette },
  { id: "tarefas", label: "Tarefas", icon: KanbanSquare },
  { id: "financeiro", label: "Financeiro", icon: DollarSign },
];

export default function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { cliente, setCliente, loading } = useCliente(id);
  const [activeTab, setActiveTab] = useState<Tab>("dados");
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdate = async (form: ClienteForm) => {
    const updates = {
      nome: form.nome,
      cnpj: form.cnpj || null,
      responsavel_nome: form.responsavel_nome || null,
      responsavel_contato: form.responsavel_contato || null,
      endereco: form.endereco || null,
      redes_sociais: form.redes_sociais,
      servicos_contratados: form.servicos_contratados.length > 0 ? form.servicos_contratados : null,
      valor_contrato: form.valor_contrato ? parseFloat(form.valor_contrato) : null,
      data_inicio: form.data_inicio || null,
      data_renovacao: form.data_renovacao || null,
      status: form.status,
      observacoes: form.observacoes || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("clientes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      setCliente(data);
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (!error) {
      router.push("/clientes");
    }
    setDeleting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="p-6 md:p-8 text-center">
        <p className="text-text-muted">Cliente não encontrado.</p>
        <Link href="/clientes" className="text-accent hover:underline text-sm mt-2 inline-block">
          Voltar para clientes
        </Link>
      </div>
    );
  }

  const daysLeft = cliente.data_renovacao
    ? Math.ceil((new Date(cliente.data_renovacao).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Back + Header */}
      <Link
        href="/clientes"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para clientes
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent-light flex items-center justify-center">
            <Building2 className="w-7 h-7 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-text-primary">{cliente.nome}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[cliente.status].className}`}>
                {statusConfig[cliente.status].label}
              </span>
            </div>
            {cliente.responsavel_nome && (
              <p className="text-text-secondary text-sm mt-0.5">{cliente.responsavel_nome}</p>
            )}
            {daysLeft !== null && daysLeft >= 0 && daysLeft <= 30 && (
              <p className="text-warning text-xs mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {daysLeft === 0 ? "Contrato vence hoje!" : `Contrato renova em ${daysLeft} dia${daysLeft > 1 ? "s" : ""}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-card border border-border hover:bg-bg-hover text-text-secondary text-sm transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-danger/10 hover:bg-danger/20 text-danger text-sm transition-colors"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "dados" && <DadosTab cliente={cliente} />}
      {activeTab === "brand" && <PlaceholderTab label="Brand Hub" description="O Brand Hub será implementado na Fase 3." />}
      {activeTab === "tarefas" && <PlaceholderTab label="Tarefas" description="As tarefas vinculadas serão implementadas na Fase 4." />}
      {activeTab === "financeiro" && <PlaceholderTab label="Financeiro" description="O financeiro do cliente será implementado na Fase 5." />}

      {/* Edit Modal */}
      <Modal open={editing} onClose={() => setEditing(false)} title="Editar Cliente" maxWidth="max-w-3xl">
        <ClienteFormComponent cliente={cliente} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
      </Modal>
    </div>
  );
}

function DadosTab({ cliente }: { cliente: NonNullable<ReturnType<typeof useCliente>["cliente"]> }) {
  const infoItem = (label: string, value: string | null | undefined) => (
    <div>
      <p className="text-xs text-text-muted mb-0.5">{label}</p>
      <p className="text-sm text-text-primary">{value || "—"}</p>
    </div>
  );

  const redes = cliente.redes_sociais || {};
  const redesAtivas = Object.entries(redes).filter(([, v]) => v);

  return (
    <div className="space-y-6">
      {/* Info grid */}
      <div className="rounded-2xl bg-bg-card border border-border p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">Informações</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {infoItem("CNPJ", cliente.cnpj)}
          {infoItem("Responsável", cliente.responsavel_nome)}
          {infoItem("Contato", cliente.responsavel_contato)}
          {infoItem("Endereço", cliente.endereco)}
          {infoItem("Status", statusConfig[cliente.status].label)}
          {infoItem("Criado em", new Date(cliente.created_at).toLocaleDateString("pt-BR"))}
        </div>
      </div>

      {/* Redes Sociais */}
      {redesAtivas.length > 0 && (
        <div className="rounded-2xl bg-bg-card border border-border p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">Redes Sociais</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {redesAtivas.map(([rede, valor]) => (
              <div key={rede} className="flex items-center gap-2">
                <span className="text-xs text-text-muted capitalize">{rede}:</span>
                <span className="text-sm text-accent flex items-center gap-1">
                  {valor}
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contrato */}
      <div className="rounded-2xl bg-bg-card border border-border p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">Contrato</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {infoItem(
            "Valor",
            cliente.valor_contrato
              ? `R$ ${Number(cliente.valor_contrato).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              : null
          )}
          {infoItem(
            "Início",
            cliente.data_inicio ? new Date(cliente.data_inicio + "T12:00:00").toLocaleDateString("pt-BR") : null
          )}
          {infoItem(
            "Renovação",
            cliente.data_renovacao ? new Date(cliente.data_renovacao + "T12:00:00").toLocaleDateString("pt-BR") : null
          )}
        </div>
        {cliente.servicos_contratados && cliente.servicos_contratados.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-text-muted mb-2">Serviços contratados</p>
            <div className="flex flex-wrap gap-2">
              {cliente.servicos_contratados.map((s) => (
                <span key={s} className="px-3 py-1 rounded-lg bg-accent/10 text-accent text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Observações */}
      {cliente.observacoes && (
        <div className="rounded-2xl bg-bg-card border border-border p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wider">Observações</h3>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{cliente.observacoes}</p>
        </div>
      )}
    </div>
  );
}

function PlaceholderTab({ label, description }: { label: string; description: string }) {
  return (
    <div className="text-center py-16 rounded-2xl bg-bg-card border border-border">
      <p className="text-lg font-semibold text-text-primary mb-2">{label}</p>
      <p className="text-text-muted text-sm">{description}</p>
    </div>
  );
}
