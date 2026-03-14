"use client";

import { useState } from "react";
import { Plus, Filter, KanbanSquare } from "lucide-react";

interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export default function TarefasPage() {
  const [columns, setColumns] = useState<Column[]>([
    { id: "backlog", title: "Backlog", taskIds: [] },
    { id: "em-progresso", title: "Em Progresso", taskIds: [] },
    { id: "revisao", title: "Revisão", taskIds: [] },
    { id: "concluido", title: "Concluído", taskIds: [] },
  ]);

  const addColumn = () => {
    const title = prompt("Nome da nova coluna:");
    if (!title) return;
    setColumns([
      ...columns,
      { id: crypto.randomUUID(), title, taskIds: [] },
    ]);
  };

  return (
    <div className="p-6 md:p-8 h-[calc(100vh-0px)] md:h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tarefas</h1>
          <p className="text-text-secondary text-sm mt-1">
            Kanban e gestão de tarefas
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-card border border-border hover:bg-bg-hover text-text-secondary text-sm transition-colors">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((column) => (
            <div
              key={column.id}
              className="w-72 flex-shrink-0 flex flex-col bg-bg-secondary/50 rounded-2xl border border-border"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-text-primary text-sm">
                    {column.title}
                  </h3>
                  <span className="text-xs text-text-muted bg-bg-hover px-2 py-0.5 rounded-full">
                    {column.taskIds.length}
                  </span>
                </div>
                <button className="text-text-muted hover:text-text-primary transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Column Content */}
              <div className="flex-1 p-3 overflow-y-auto">
                {column.taskIds.length === 0 && (
                  <div className="text-center py-8">
                    <KanbanSquare className="w-8 h-8 text-text-muted/30 mx-auto mb-2" />
                    <p className="text-xs text-text-muted">
                      Nenhuma tarefa
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add Column */}
          <button
            onClick={addColumn}
            className="w-72 flex-shrink-0 flex items-center justify-center rounded-2xl border-2 border-dashed border-border hover:border-accent/40 text-text-muted hover:text-accent transition-all"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">Adicionar Coluna</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
