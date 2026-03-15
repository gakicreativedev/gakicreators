"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Search,
  Filter,
  X,
  Trash2,
  Pencil,
  Loader2,
} from "lucide-react";
import { useMovimentacoes, type MovimentacaoForm } from "@/lib/hooks/use-movimentacoes";
import { Modal } from "@/components/ui/modal";
import { MovimentacaoFormComponent } from "@/components/saude/movimentacao-form";
import type { CategoriaMovimentacao, StatusMovimentacao } from "@/lib/types";

const categoriaConfig: Record<CategoriaMovimentacao, { label: string; className: string }> = {
  receita: { label: "Receita", className: "bg-success/15 text-success" },
  despesa: { label: "Despesa", className: "bg-danger/15 text-danger" },
  fornecedor: { label: "Fornecedor", className: "bg-warning/15 text-warning" },
  "pro-labore": { label: "Pró-labore", className: "bg-accent/15 text-accent" },
  investimento: { label: "Investimento", className: "bg-text-muted/15 text-text-secondary" },
};

const statusConfig: Record<StatusMovimentacao, { label: string; className: string }> = {
  pago: { label: "Pago", className: "text-success" },
  pendente: { label: "Pendente", className: "text-warning" },
  agendado: { label: "Agendado", className: "text-accent" },
  atrasado: { label: "Atrasado", className: "text-danger" },
  cancelado: { label: "Cancelado", className: "text-text-muted line-through" },
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function SaudePage() {
  const { movimentacoes, resumo, loading, createMovimentacao, deleteMovimentacao } = useMovimentacoes();
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategoria, setFilterCategoria] = useState<CategoriaMovimentacao | "todas">("todas");
  const [filterStatus, setFilterStatus] = useState<StatusMovimentacao | "todos">("todos");

  const filtered = useMemo(() => {
    return movimentacoes.filter((m) => {
      if (search && !m.descricao?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCategoria !== "todas" && m.categoria !== filterCategoria) return false;
      if (filterStatus !== "todos" && m.status !== filterStatus) return false;
      return true;
    });
  }, [movimentacoes, search, filterCategoria, filterStatus]);

  const handleCreate = async (form: MovimentacaoForm) => {
    const { error } = await createMovimentacao(form);
    if (!error) setShowForm(false);
  };

  const activeFilters = (filterCategoria !== "todas" ? 1 : 0) + (filterStatus !== "todos" ? 1 : 0) + (search ? 1 : 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Saúde</h1>
          <p className="text-text-secondary text-sm mt-1">
            {movimentacoes.length} movimentaç{movimentacoes.length !== 1 ? "ões" : "ão"}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Movimentação
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl bg-bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-success" />
            <p className="text-sm text-text-muted">Entradas</p>
          </div>
          <p className="text-2xl font-bold text-success">{formatCurrency(resumo.entradas)}</p>
        </div>
        <div className="rounded-2xl bg-bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-danger" />
            <p className="text-sm text-text-muted">Saídas</p>
          </div>
          <p className="text-2xl font-bold text-danger">{formatCurrency(resumo.saidas)}</p>
        </div>
        <div className="rounded-2xl bg-bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-accent" />
            <p className="text-sm text-text-muted">Saldo</p>
          </div>
          <p className={`text-2xl font-bold ${resumo.saldo >= 0 ? "text-success" : "text-danger"}`}>
            {formatCurrency(resumo.saldo)}
          </p>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-text-primary placeholder:text-text-muted text-sm focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
            activeFilters > 0
              ? "bg-accent/15 text-accent border-accent/30"
              : "glass-btn text-text-secondary hover:bg-bg-hover"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {activeFilters > 0 && (
            <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-6 p-3 rounded-xl bg-bg-card border border-border">
          <div>
            <label className="block text-xs text-text-muted mb-1">Categoria</label>
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value as CategoriaMovimentacao | "todas")}
              className="px-2 py-1.5 rounded-lg glass-input text-text-primary text-xs"
            >
              <option value="todas">Todas</option>
              {Object.entries(categoriaConfig).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as StatusMovimentacao | "todos")}
              className="px-2 py-1.5 rounded-lg glass-input text-text-primary text-xs"
            >
              <option value="todos">Todos</option>
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>
          {activeFilters > 0 && (
            <button
              onClick={() => { setFilterCategoria("todas"); setFilterStatus("todos"); setSearch(""); }}
              className="self-end flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-primary"
            >
              <X className="w-3 h-3" />
              Limpar
            </button>
          )}
        </div>
      )}

      {/* Transactions List */}
      <div className="rounded-2xl bg-bg-card border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-text-primary">
            Movimentações {filtered.length !== movimentacoes.length && `(${filtered.length} de ${movimentacoes.length})`}
          </h3>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-text-muted/30 mx-auto mb-3" />
            <p className="text-text-muted text-sm">
              {movimentacoes.length === 0 ? "Nenhuma movimentação registrada" : "Nenhum resultado encontrado"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-5 py-4 hover:bg-bg-hover/50 transition-colors group">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.categoria === "receita" ? "bg-success" : "bg-danger"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {m.descricao || categoriaConfig[m.categoria].label}
                      </p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${categoriaConfig[m.categoria].className}`}>
                        {categoriaConfig[m.categoria].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-text-muted">
                        {new Date(m.data + "T12:00:00").toLocaleDateString("pt-BR")}
                      </span>
                      <span className={`text-xs font-medium ${statusConfig[m.status].className}`}>
                        {statusConfig[m.status].label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-sm font-bold ${m.categoria === "receita" ? "text-success" : "text-danger"}`}>
                    {m.categoria === "receita" ? "+" : "-"} {formatCurrency(Number(m.valor))}
                  </p>
                  <button
                    onClick={() => deleteMovimentacao(m.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova Movimentação">
        <MovimentacaoFormComponent onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
