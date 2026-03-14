"use client";

import { useState } from "react";
import {
  Plus,
  Loader2,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useKanban } from "@/lib/hooks/use-tarefas";
import { TarefaModal } from "@/components/tarefas/tarefa-modal";
import type { TarefaComRelacoes } from "@/lib/hooks/use-tarefas";
import type { Prioridade } from "@/lib/types";

const prioridadeConfig: Record<Prioridade, { label: string; className: string }> = {
  urgente: { label: "Urgente", className: "bg-danger/15 text-danger" },
  alta: { label: "Alta", className: "bg-warning/15 text-warning" },
  media: { label: "Média", className: "bg-accent/15 text-accent" },
  baixa: { label: "Baixa", className: "bg-text-muted/15 text-text-muted" },
};

export function TarefasTab({ clienteId }: { clienteId: string }) {
  const {
    tarefas,
    tags,
    loading,
    createTarefa,
    updateTarefa,
    deleteTarefa,
    createTag,
    toggleTagOnTarefa,
    addEtapa,
    updateEtapa,
    deleteEtapa,
  } = useKanban(clienteId);

  const [selectedTarefa, setSelectedTarefa] = useState<TarefaComRelacoes | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await createTarefa({ titulo: newTitle.trim(), cliente_id: clienteId });
    setNewTitle("");
    setAdding(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {tarefas.length} tarefa{tarefas.length !== 1 ? "s" : ""} vinculada{tarefas.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nova Tarefa
        </button>
      </div>

      {adding && (
        <div className="p-4 rounded-xl bg-bg-card border border-accent/30">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="Título da tarefa..."
            className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border text-text-primary text-sm mb-2"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium">
              Criar
            </button>
            <button onClick={() => setAdding(false)} className="px-3 py-1.5 rounded-lg text-text-muted text-xs">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {tarefas.length === 0 && !adding ? (
        <div className="text-center py-12 rounded-2xl bg-bg-card border border-border">
          <p className="text-text-muted text-sm">Nenhuma tarefa vinculada a este cliente.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tarefas.map((tarefa) => {
            const etapasDone = (tarefa.etapas || []).filter((e) => e.concluida).length;
            const etapasTotal = (tarefa.etapas || []).length;

            return (
              <button
                key={tarefa.id}
                onClick={() => setSelectedTarefa(tarefa)}
                className="w-full text-left p-4 rounded-xl bg-bg-card border border-border hover:border-accent/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${prioridadeConfig[tarefa.prioridade].className}`}>
                        {prioridadeConfig[tarefa.prioridade].label}
                      </span>
                      <h4 className="text-sm font-medium text-text-primary">{tarefa.titulo}</h4>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      {tarefa.prazo && (
                        <span className={`flex items-center gap-1 text-xs ${new Date(tarefa.prazo) < new Date() ? "text-danger" : "text-text-muted"}`}>
                          {new Date(tarefa.prazo) < new Date() ? <AlertTriangle className="w-3 h-3" /> : <CalendarDays className="w-3 h-3" />}
                          {new Date(tarefa.prazo + "T12:00:00").toLocaleDateString("pt-BR")}
                        </span>
                      )}
                      {etapasTotal > 0 && (
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          {etapasDone === etapasTotal ? <CheckCircle2 className="w-3 h-3 text-success" /> : <Circle className="w-3 h-3" />}
                          {etapasDone}/{etapasTotal}
                        </span>
                      )}
                    </div>
                  </div>
                  {tarefa.tags && tarefa.tags.length > 0 && (
                    <div className="flex gap-1 ml-3">
                      {tarefa.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-0.5 rounded text-[10px] font-medium"
                          style={{ backgroundColor: `${tag.cor}15`, color: tag.cor }}
                        >
                          {tag.nome}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedTarefa && (
        <TarefaModal
          tarefa={selectedTarefa}
          tags={tags}
          open={!!selectedTarefa}
          onClose={() => setSelectedTarefa(null)}
          onUpdate={updateTarefa}
          onDelete={deleteTarefa}
          onToggleTag={toggleTagOnTarefa}
          onAddEtapa={addEtapa}
          onUpdateEtapa={updateEtapa}
          onDeleteEtapa={deleteEtapa}
          onCreateTag={createTag}
        />
      )}
    </div>
  );
}
