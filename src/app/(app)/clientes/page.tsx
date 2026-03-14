"use client";

import { useState } from "react";
import { Plus, Search, Building2 } from "lucide-react";

type ClientStatus = "ativo" | "pausado" | "encerrado";

interface Client {
  id: string;
  nome: string;
  responsavel: string;
  status: ClientStatus;
  servicos: string[];
  dataInicio: string;
}

const statusConfig: Record<ClientStatus, { label: string; className: string }> = {
  ativo: { label: "Ativo", className: "bg-success/15 text-success" },
  pausado: { label: "Pausado", className: "bg-warning/15 text-warning" },
  encerrado: { label: "Encerrado", className: "bg-text-muted/15 text-text-muted" },
};

export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const [clientes] = useState<Client[]>([]);

  const filtered = clientes.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Clientes</h1>
          <p className="text-text-secondary text-sm mt-1">
            Gerencie seus clientes e contratos
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-card border border-border text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
        />
      </div>

      {/* Client List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-bg-card border border-border">
          <Building2 className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Nenhum cliente cadastrado
          </h3>
          <p className="text-text-muted text-sm mb-6">
            Comece adicionando seu primeiro cliente.
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Adicionar Cliente
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between p-4 rounded-xl bg-bg-card border border-border hover:border-accent/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">
                    {client.nome}
                  </h3>
                  <p className="text-sm text-text-muted">
                    {client.responsavel}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  statusConfig[client.status].className
                }`}
              >
                {statusConfig[client.status].label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
