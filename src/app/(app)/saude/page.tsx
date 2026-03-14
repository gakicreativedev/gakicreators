"use client";

import { Plus, TrendingUp, TrendingDown, DollarSign, FileText } from "lucide-react";

export default function SaudePage() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Saúde</h1>
          <p className="text-text-secondary text-sm mt-1">
            Módulo financeiro — acompanhe suas movimentações
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors">
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
          <p className="text-2xl font-bold text-success">R$ 0,00</p>
        </div>

        <div className="rounded-2xl bg-bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-danger" />
            <p className="text-sm text-text-muted">Saídas</p>
          </div>
          <p className="text-2xl font-bold text-danger">R$ 0,00</p>
        </div>

        <div className="rounded-2xl bg-bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-accent" />
            <p className="text-sm text-text-muted">Saldo</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">R$ 0,00</p>
        </div>
      </div>

      {/* Chart placeholder */}
      <div className="rounded-2xl bg-bg-card border border-border p-6 mb-8">
        <h3 className="font-semibold text-text-primary mb-4">
          Evolução do saldo
        </h3>
        <div className="h-48 flex items-center justify-center">
          <p className="text-text-muted text-sm">
            Gráfico disponível após as primeiras movimentações
          </p>
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-2xl bg-bg-card border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-text-primary">
            Movimentações recentes
          </h3>
          <button className="text-sm text-accent hover:text-accent-hover transition-colors">
            Ver todas
          </button>
        </div>
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-text-muted/30 mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            Nenhuma movimentação registrada
          </p>
        </div>
      </div>
    </div>
  );
}
