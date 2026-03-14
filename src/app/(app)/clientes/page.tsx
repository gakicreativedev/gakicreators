"use client";

import { useState } from "react";
import { Plus, Search, Building2, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useClientes } from "@/lib/hooks/use-clientes";
import { Modal } from "@/components/ui/modal";
import { ClienteFormComponent } from "@/components/clientes/cliente-form";
import type { ClientStatus, ClienteForm } from "@/lib/types";

const statusConfig: Record<ClientStatus, { label: string; className: string }> = {
  ativo: { label: "Ativo", className: "bg-success/15 text-success" },
  pausado: { label: "Pausado", className: "bg-warning/15 text-warning" },
  encerrado: { label: "Encerrado", className: "bg-text-muted/15 text-text-muted" },
};

function daysUntilRenewal(date: string | null): number | null {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function ClientesPage() {
  const { clientes, loading, createCliente } = useClientes();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "todos">("todos");
  const [showForm, setShowForm] = useState(false);

  const filtered = clientes
    .filter((c) => c.nome.toLowerCase().includes(search.toLowerCase()))
    .filter((c) => statusFilter === "todos" || c.status === statusFilter);

  const counts = {
    todos: clientes.length,
    ativo: clientes.filter((c) => c.status === "ativo").length,
    pausado: clientes.filter((c) => c.status === "pausado").length,
    encerrado: clientes.filter((c) => c.status === "encerrado").length,
  };

  const handleCreate = async (form: ClienteForm) => {
    const { error } = await createCliente(form);
    if (!error) setShowForm(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Clientes</h1>
          <p className="text-text-secondary text-sm mt-1">
            {counts.ativo} ativo{counts.ativo !== 1 ? "s" : ""} · {counts.todos} total
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-card border border-border text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent transition-colors text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(["todos", "ativo", "pausado", "encerrado"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors border ${
                statusFilter === s
                  ? "bg-accent/15 text-accent border-accent/30"
                  : "bg-bg-card text-text-muted border-border hover:border-accent/20"
              }`}
            >
              {s === "todos" ? "Todos" : statusConfig[s].label} ({counts[s]})
            </button>
          ))}
        </div>
      </div>

      {/* Client List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-accent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-bg-card border border-border">
          <Building2 className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {clientes.length === 0 ? "Nenhum cliente cadastrado" : "Nenhum resultado"}
          </h3>
          <p className="text-text-muted text-sm mb-6">
            {clientes.length === 0
              ? "Comece adicionando seu primeiro cliente."
              : "Tente alterar os filtros ou a busca."}
          </p>
          {clientes.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar Cliente
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((client) => {
            const daysLeft = daysUntilRenewal(client.data_renovacao);
            const renewalWarning = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;

            return (
              <Link
                key={client.id}
                href={`/clientes/${client.id}`}
                className="flex items-center justify-between p-4 rounded-xl bg-bg-card border border-border hover:border-accent/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Building2 className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-text-primary">
                        {client.nome}
                      </h3>
                      {renewalWarning && (
                        <span className="flex items-center gap-1 text-xs text-warning">
                          <AlertTriangle className="w-3 h-3" />
                          {daysLeft === 0 ? "Vence hoje" : `${daysLeft}d para renovação`}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-muted">
                      {client.responsavel_nome || "Sem responsável"}
                      {client.servicos_contratados && client.servicos_contratados.length > 0 && (
                        <span> · {client.servicos_contratados.join(", ")}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {client.valor_contrato && (
                    <span className="text-sm font-medium text-text-secondary hidden md:block">
                      R$ {Number(client.valor_contrato).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusConfig[client.status].className
                    }`}
                  >
                    {statusConfig[client.status].label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal: Novo Cliente */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Novo Cliente" maxWidth="max-w-3xl">
        <ClienteFormComponent onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
