"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Filter,
  KanbanSquare,
  GripVertical,
  Pencil,
  Trash2,
  Loader2,
  X,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useKanban, type TarefaComRelacoes } from "@/lib/hooks/use-tarefas";
import { TarefaModal } from "@/components/tarefas/tarefa-modal";
import type { Prioridade } from "@/lib/types";

const prioridadeColors: Record<Prioridade, string> = {
  urgente: "#ef4444",
  alta: "#f59e0b",
  media: "#3b82f6",
  baixa: "#94a3b8",
};

export default function TarefasPage() {
  const {
    colunas,
    tarefas,
    tags,
    loading,
    addColuna,
    updateColuna,
    deleteColuna,
    createTarefa,
    updateTarefa,
    deleteTarefa,
    moveTarefa,
    createTag,
    toggleTagOnTarefa,
    addEtapa,
    updateEtapa,
    deleteEtapa,
  } = useKanban();

  const [selectedTarefa, setSelectedTarefa] = useState<TarefaComRelacoes | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterPrioridade, setFilterPrioridade] = useState<Prioridade | "todas">("todas");
  const [filterTag, setFilterTag] = useState<string | "todas">("todas");
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editColumnTitle, setEditColumnTitle] = useState("");

  // Filter tasks
  const filteredTarefas = useMemo(() => {
    return tarefas.filter((t) => {
      if (filterPrioridade !== "todas" && t.prioridade !== filterPrioridade) return false;
      if (filterTag !== "todas" && !(t.tags || []).some((tag) => tag.id === filterTag)) return false;
      return true;
    });
  }, [tarefas, filterPrioridade, filterTag]);

  const getColumnTasks = (colunaId: string) =>
    filteredTarefas
      .filter((t) => t.coluna_id === colunaId)
      .sort((a, b) => a.posicao - b.posicao);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newColunaId = destination.droppableId;
    const newIndex = destination.index;

    await moveTarefa(draggableId, newColunaId, newIndex);
  };

  const handleAddTask = async (colunaId: string) => {
    if (!newTaskTitle.trim()) return;
    await createTarefa({ titulo: newTaskTitle.trim(), coluna_id: colunaId });
    setNewTaskTitle("");
    setAddingToColumn(null);
  };

  const handleAddColumn = async () => {
    const titulo = prompt("Nome da nova coluna:");
    if (!titulo?.trim()) return;
    await addColuna(titulo.trim());
  };

  const handleSaveColumnTitle = async (id: string) => {
    if (editColumnTitle.trim()) {
      await updateColuna(id, editColumnTitle.trim());
    }
    setEditingColumn(null);
  };

  const activeFilters = (filterPrioridade !== "todas" ? 1 : 0) + (filterTag !== "todas" ? 1 : 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 h-[calc(100vh-0px)] md:h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tarefas</h1>
          <p className="text-text-secondary text-sm mt-1">
            {tarefas.length} tarefa{tarefas.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors ${
              activeFilters > 0
                ? "bg-accent/15 text-accent border-accent/30"
                : "bg-bg-card text-text-secondary border-border hover:bg-bg-hover"
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
      </div>

      {/* Filters bar */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-4 p-3 rounded-xl bg-bg-card border border-border flex-shrink-0">
          <div>
            <label className="block text-xs text-text-muted mb-1">Prioridade</label>
            <select
              value={filterPrioridade}
              onChange={(e) => setFilterPrioridade(e.target.value as Prioridade | "todas")}
              className="px-2 py-1.5 rounded-lg bg-bg-primary border border-border text-text-primary text-xs"
            >
              <option value="todas">Todas</option>
              <option value="urgente">Urgente</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Tag</label>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-bg-primary border border-border text-text-primary text-xs"
            >
              <option value="todas">Todas</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>
          {activeFilters > 0 && (
            <button
              onClick={() => { setFilterPrioridade("todas"); setFilterTag("todas"); }}
              className="self-end flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-3 h-3" />
              Limpar
            </button>
          )}
        </div>
      )}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 h-full min-w-max pb-4">
            {colunas.map((coluna) => {
              const colTasks = getColumnTasks(coluna.id);

              return (
                <div
                  key={coluna.id}
                  className="w-72 flex-shrink-0 flex flex-col bg-bg-secondary/50 rounded-2xl border border-border"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    {editingColumn === coluna.id ? (
                      <input
                        type="text"
                        value={editColumnTitle}
                        onChange={(e) => setEditColumnTitle(e.target.value)}
                        onBlur={() => handleSaveColumnTitle(coluna.id)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveColumnTitle(coluna.id)}
                        className="flex-1 px-2 py-1 rounded-lg bg-bg-primary border border-accent text-text-primary text-sm"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2 flex-1">
                        <h3 className="font-semibold text-text-primary text-sm">{coluna.titulo}</h3>
                        <span className="text-xs text-text-muted bg-bg-hover px-2 py-0.5 rounded-full">
                          {colTasks.length}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingColumn(coluna.id);
                          setEditColumnTitle(coluna.titulo);
                        }}
                        className="p-1 text-text-muted hover:text-text-primary transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setAddingToColumn(coluna.id)}
                        className="p-1 text-text-muted hover:text-accent transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteColuna(coluna.id)}
                        className="p-1 text-text-muted hover:text-danger transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Column Content */}
                  <Droppable droppableId={coluna.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-3 overflow-y-auto min-h-[100px] transition-colors ${
                          snapshot.isDraggingOver ? "bg-accent/5" : ""
                        }`}
                      >
                        {/* Add task inline */}
                        {addingToColumn === coluna.id && (
                          <div className="mb-3 p-3 rounded-xl bg-bg-card border border-accent/30">
                            <input
                              type="text"
                              value={newTaskTitle}
                              onChange={(e) => setNewTaskTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddTask(coluna.id);
                                if (e.key === "Escape") setAddingToColumn(null);
                              }}
                              placeholder="Título da tarefa..."
                              className="w-full px-2 py-1.5 rounded-lg bg-bg-primary border border-border text-text-primary text-sm mb-2"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAddTask(coluna.id)}
                                className="px-3 py-1 rounded-lg bg-accent text-white text-xs font-medium"
                              >
                                Criar
                              </button>
                              <button
                                onClick={() => setAddingToColumn(null)}
                                className="px-3 py-1 rounded-lg text-text-muted text-xs"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}

                        {colTasks.map((tarefa, index) => (
                          <Draggable key={tarefa.id} draggableId={tarefa.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                onClick={() => setSelectedTarefa(tarefa)}
                                className={`mb-2 p-3 rounded-xl bg-bg-card border border-border hover:border-accent/30 cursor-pointer transition-all ${
                                  snapshot.isDragging ? "shadow-lg border-accent/50" : ""
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mt-0.5 text-text-muted/40 hover:text-text-muted"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    {/* Priority dot + title */}
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: prioridadeColors[tarefa.prioridade] }}
                                      />
                                      <p className="text-sm font-medium text-text-primary truncate">
                                        {tarefa.titulo}
                                      </p>
                                    </div>

                                    {/* Tags */}
                                    {tarefa.tags && tarefa.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {tarefa.tags.map((tag) => (
                                          <span
                                            key={tag.id}
                                            className="px-2 py-0.5 rounded text-[10px] font-medium"
                                            style={{
                                              backgroundColor: `${tag.cor}15`,
                                              color: tag.cor,
                                            }}
                                          >
                                            {tag.nome}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    {/* Footer: deadline + etapas */}
                                    <div className="flex items-center gap-3 mt-2">
                                      {tarefa.prazo && (
                                        <span
                                          className={`flex items-center gap-1 text-[11px] ${
                                            new Date(tarefa.prazo) < new Date()
                                              ? "text-danger"
                                              : "text-text-muted"
                                          }`}
                                        >
                                          {new Date(tarefa.prazo) < new Date() ? (
                                            <AlertTriangle className="w-3 h-3" />
                                          ) : (
                                            <CalendarDays className="w-3 h-3" />
                                          )}
                                          {new Date(tarefa.prazo + "T12:00:00").toLocaleDateString("pt-BR")}
                                        </span>
                                      )}
                                      {tarefa.etapas && tarefa.etapas.length > 0 && (
                                        <span className="text-[11px] text-text-muted">
                                          {tarefa.etapas.filter((e) => e.concluida).length}/{tarefa.etapas.length} etapas
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}

                        {colTasks.length === 0 && addingToColumn !== coluna.id && (
                          <div className="text-center py-8">
                            <KanbanSquare className="w-8 h-8 text-text-muted/20 mx-auto mb-2" />
                            <p className="text-xs text-text-muted">Nenhuma tarefa</p>
                          </div>
                        )}

                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}

            {/* Add Column */}
            <button
              onClick={handleAddColumn}
              className="w-72 flex-shrink-0 flex items-center justify-center rounded-2xl border-2 border-dashed border-border hover:border-accent/40 text-text-muted hover:text-accent transition-all min-h-[200px]"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span className="text-sm font-medium">Adicionar Coluna</span>
              </div>
            </button>
          </div>
        </div>
      </DragDropContext>

      {/* Task Modal */}
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
