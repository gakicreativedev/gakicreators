"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Tarefa, Prioridade } from "@/lib/types";

const prioridadeConfig: Record<Prioridade, { label: string; className: string }> = {
  urgente: { label: "Urgente", className: "bg-danger/15 text-danger" },
  alta: { label: "Alta", className: "bg-warning/15 text-warning" },
  media: { label: "Media", className: "bg-accent/15 text-accent" },
  baixa: { label: "Baixa", className: "bg-text-muted/15 text-text-muted" },
};

type Filter = "todas" | "ativas" | "concluidas";

export function BrandTarefasTab({ clienteId }: { clienteId: string }) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [colunas, setColunas] = useState<{ id: string; titulo: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("todas");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const [{ data: tarefasData }, { data: colunasData }] = await Promise.all([
        supabase
          .from("tarefas")
          .select("*")
          .eq("cliente_id", clienteId)
          .order("created_at", { ascending: false }),
        supabase
          .from("kanban_colunas")
          .select("id, titulo")
          .order("posicao"),
      ]);

      if (tarefasData) setTarefas(tarefasData);
      if (colunasData) setColunas(colunasData);
      setLoading(false);
    }
    load();
  }, [clienteId, supabase]);

  const concluidas = useMemo(() => {
    const concluidaCols = colunas
      .filter((c) => c.titulo.toLowerCase().includes("conclu"))
      .map((c) => c.id);
    return new Set(concluidaCols);
  }, [colunas]);

  const filtered = useMemo(() => {
    if (filter === "todas") return tarefas;
    if (filter === "concluidas") return tarefas.filter((t) => t.coluna_id && concluidas.has(t.coluna_id));
    return tarefas.filter((t) => !t.coluna_id || !concluidas.has(t.coluna_id));
  }, [tarefas, filter, concluidas]);

  const ativasCount = tarefas.filter((t) => !t.coluna_id || !concluidas.has(t.coluna_id)).length;
  const concluidasCount = tarefas.filter((t) => t.coluna_id && concluidas.has(t.coluna_id)).length;

  const getColunaNome = (colunaId: string | null) => {
    if (!colunaId) return "Sem coluna";
    return colunas.find((c) => c.id === colunaId)?.titulo || "—";
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
          <p className="text-xs text-text-muted mb-1">Total</p>
          <p className="text-2xl font-bold text-text-primary">{tarefas.length}</p>
        </div>
        <div className="rounded-xl bg-bg-card border border-border p-4">
          <p className="text-xs text-text-muted mb-1">Ativas</p>
          <p className="text-2xl font-bold text-accent">{ativasCount}</p>
        </div>
        <div className="rounded-xl bg-bg-card border border-border p-4">
          <p className="text-xs text-text-muted mb-1">Concluidas</p>
          <p className="text-2xl font-bold text-success">{concluidasCount}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {([
          { id: "todas", label: "Todas" },
          { id: "ativas", label: "Ativas" },
          { id: "concluidas", label: "Concluidas" },
        ] as { id: Filter; label: string }[]).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f.id
                ? "bg-accent text-white"
                : "bg-bg-card border border-border text-text-secondary hover:bg-bg-hover"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-bg-card border border-border">
          <p className="text-text-muted text-sm">Nenhuma tarefa encontrada.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-bg-card border border-border divide-y divide-border">
          {filtered.map((tarefa) => {
            const isConcluida = tarefa.coluna_id ? concluidas.has(tarefa.coluna_id) : false;
            const isOverdue = tarefa.prazo && !isConcluida && new Date(tarefa.prazo) < new Date();

            return (
              <div
                key={tarefa.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-bg-hover/50 transition-colors"
              >
                {isConcluida ? (
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-text-muted flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      isConcluida ? "line-through text-text-muted" : "text-text-primary"
                    }`}
                  >
                    {tarefa.titulo}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-text-muted">{getColunaNome(tarefa.coluna_id)}</span>
                    {tarefa.prazo && (
                      <span
                        className={`flex items-center gap-1 text-xs ${
                          isOverdue ? "text-danger" : "text-text-muted"
                        }`}
                      >
                        {isOverdue ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <CalendarDays className="w-3 h-3" />
                        )}
                        {new Date(tarefa.prazo + "T12:00:00").toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                    prioridadeConfig[tarefa.prioridade].className
                  }`}
                >
                  {prioridadeConfig[tarefa.prioridade].label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
