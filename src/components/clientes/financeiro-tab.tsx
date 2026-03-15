"use client";

import { useState } from "react";
import { Plus, Loader2, TrendingUp, TrendingDown, DollarSign, Trash2 } from "lucide-react";
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
  cancelado: { label: "Cancelado", className: "text-text-muted" },
};

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function FinanceiroTab({ clienteId }: { clienteId: string }) {
  const { movimentacoes, resumo, loading, createMovimentacao, deleteMovimentacao } = useMovimentacoes(clienteId);
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async (form: MovimentacaoForm) => {
    await createMovimentacao({ ...form, cliente_id: clienteId });
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-bg-card border border-border p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-success" />
            <span className="text-xs text-text-muted">Entradas</span>
          </div>
          <p className="text-lg font-bold text-success">{fmt(resumo.entradas)}</p>
        </div>
        <div className="rounded-xl bg-bg-card border border-border p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingDown className="w-3.5 h-3.5 text-danger" />
            <span className="text-xs text-text-muted">Saídas</span>
          </div>
          <p className="text-lg font-bold text-danger">{fmt(resumo.saidas)}</p>
        </div>
        <div className="rounded-xl bg-bg-card border border-border p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <DollarSign className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs text-text-muted">Saldo</span>
          </div>
          <p className={`text-lg font-bold ${resumo.saldo >= 0 ? "text-success" : "text-danger"}`}>{fmt(resumo.saldo)}</p>
        </div>
      </div>

      {/* List */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{movimentacoes.length} movimentaç{movimentacoes.length !== 1 ? "ões" : "ão"}</p>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nova Movimentação
        </button>
      </div>

      {movimentacoes.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-bg-card border border-border">
          <p className="text-text-muted text-sm">Nenhuma movimentação vinculada.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-bg-card border border-border divide-y divide-border">
          {movimentacoes.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-4 py-3 hover:bg-bg-hover/50 transition-colors group">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-2 h-2 rounded-full ${m.categoria === "receita" ? "bg-success" : "bg-danger"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{m.descricao || categoriaConfig[m.categoria].label}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-muted">{new Date(m.data + "T12:00:00").toLocaleDateString("pt-BR")}</span>
                    <span className={`text-xs ${statusConfig[m.status].className}`}>{statusConfig[m.status].label}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${m.categoria === "receita" ? "text-success" : "text-danger"}`}>
                  {m.categoria === "receita" ? "+" : "-"} {fmt(Number(m.valor))}
                </span>
                <button
                  onClick={() => deleteMovimentacao(m.id)}
                  className="p-1 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova Movimentação">
        <MovimentacaoFormComponent onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
