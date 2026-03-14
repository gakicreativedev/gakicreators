"use client";

import { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Send,
  Loader2,
  Tag,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useComentarios, type TarefaComRelacoes, type Tag as TagType, type Etapa } from "@/lib/hooks/use-tarefas";
import type { Prioridade } from "@/lib/types";

const prioridadeConfig: Record<Prioridade, { label: string; className: string }> = {
  urgente: { label: "Urgente", className: "bg-danger/15 text-danger" },
  alta: { label: "Alta", className: "bg-warning/15 text-warning" },
  media: { label: "Média", className: "bg-accent/15 text-accent" },
  baixa: { label: "Baixa", className: "bg-text-muted/15 text-text-muted" },
};

interface TarefaModalProps {
  tarefa: TarefaComRelacoes;
  tags: TagType[];
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<TarefaComRelacoes>) => Promise<unknown>;
  onDelete: (id: string) => Promise<void>;
  onToggleTag: (tarefaId: string, tagId: string) => Promise<void>;
  onAddEtapa: (tarefaId: string, titulo: string) => Promise<unknown>;
  onUpdateEtapa: (etapaId: string, updates: Partial<Etapa>) => Promise<void>;
  onDeleteEtapa: (etapaId: string) => Promise<void>;
  onCreateTag: (nome: string, cor: string) => Promise<TagType | null | undefined>;
}

export function TarefaModal({
  tarefa,
  tags,
  open,
  onClose,
  onUpdate,
  onDelete,
  onToggleTag,
  onAddEtapa,
  onUpdateEtapa,
  onDeleteEtapa,
  onCreateTag,
}: TarefaModalProps) {
  const [titulo, setTitulo] = useState(tarefa.titulo);
  const [descricao, setDescricao] = useState(tarefa.descricao || "");
  const [prazo, setPrazo] = useState(tarefa.prazo || "");
  const [prioridade, setPrioridade] = useState<Prioridade>(tarefa.prioridade);
  const [novaEtapa, setNovaEtapa] = useState("");
  const [novaTag, setNovaTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(tarefa.id, { titulo, descricao: descricao || null, prazo: prazo || null, prioridade });
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;
    setDeleting(true);
    await onDelete(tarefa.id);
    setDeleting(false);
    onClose();
  };

  const handleAddEtapa = async () => {
    if (!novaEtapa.trim()) return;
    await onAddEtapa(tarefa.id, novaEtapa.trim());
    setNovaEtapa("");
  };

  const handleCreateTag = async () => {
    if (!novaTag.trim()) return;
    const tag = await onCreateTag(novaTag.trim(), "#3b82f6");
    if (tag) await onToggleTag(tarefa.id, tag.id);
    setNovaTag("");
    setShowTagInput(false);
  };

  const etapas = tarefa.etapas || [];
  const etapasConcluidas = etapas.filter((e) => e.concluida).length;

  return (
    <Modal open={open} onClose={onClose} title="" maxWidth="max-w-3xl">
      <div className="space-y-5">
        {/* Título */}
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full text-xl font-bold text-text-primary bg-transparent border-none focus:outline-none focus:ring-0 p-0"
          placeholder="Título da tarefa"
        />

        {/* Meta row */}
        <div className="flex flex-wrap gap-3">
          <select
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value as Prioridade)}
            className="px-3 py-1.5 rounded-lg bg-bg-primary border border-border text-text-primary text-xs"
          >
            {Object.entries(prioridadeConfig).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>

          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-text-muted" />
            <input
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-bg-primary border border-border text-text-primary text-xs"
            />
          </div>

          {prazo && new Date(prazo) < new Date() && (
            <span className="flex items-center gap-1 text-xs text-danger">
              <AlertTriangle className="w-3 h-3" />
              Atrasada
            </span>
          )}
        </div>

        {/* Tags */}
        <div>
          <p className="text-xs text-text-muted mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {(tarefa.tags || []).map((tag) => (
              <button
                key={tag.id}
                onClick={() => onToggleTag(tarefa.id, tag.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border"
                style={{
                  backgroundColor: `${tag.cor}15`,
                  color: tag.cor,
                  borderColor: `${tag.cor}30`,
                }}
              >
                {tag.nome}
                <X className="w-3 h-3" />
              </button>
            ))}
            {tags
              .filter((t) => !(tarefa.tags || []).some((tt) => tt.id === t.id))
              .map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => onToggleTag(tarefa.id, tag.id)}
                  className="px-2.5 py-1 rounded-lg text-xs text-text-muted border border-border hover:border-accent/30 transition-colors"
                >
                  + {tag.nome}
                </button>
              ))}
            {showTagInput ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={novaTag}
                  onChange={(e) => setNovaTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
                  placeholder="Nome da tag"
                  className="px-2 py-1 rounded-lg bg-bg-primary border border-border text-text-primary text-xs w-28"
                  autoFocus
                />
                <button onClick={handleCreateTag} className="text-accent">
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setShowTagInput(false)} className="text-text-muted">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowTagInput(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-text-muted border border-dashed border-border hover:border-accent/30 transition-colors"
              >
                <Tag className="w-3 h-3" />
                Nova tag
              </button>
            )}
          </div>
        </div>

        {/* Descrição */}
        <div>
          <p className="text-xs text-text-muted mb-2">Descrição</p>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Adicione uma descrição..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl bg-bg-primary border border-border text-text-primary text-sm placeholder:text-text-muted resize-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Etapas */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-text-muted">
              Etapas {etapas.length > 0 && `(${etapasConcluidas}/${etapas.length})`}
            </p>
          </div>
          {etapas.length > 0 && (
            <div className="w-full bg-bg-primary rounded-full h-1.5 mb-3">
              <div
                className="bg-accent h-1.5 rounded-full transition-all"
                style={{ width: `${etapas.length > 0 ? (etapasConcluidas / etapas.length) * 100 : 0}%` }}
              />
            </div>
          )}
          <div className="space-y-2">
            {etapas.map((etapa) => (
              <div key={etapa.id} className="flex items-center gap-3 group">
                <button
                  onClick={() => onUpdateEtapa(etapa.id, { concluida: !etapa.concluida })}
                  className="flex-shrink-0"
                >
                  {etapa.concluida ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <Circle className="w-5 h-5 text-text-muted hover:text-accent transition-colors" />
                  )}
                </button>
                <span
                  className={`flex-1 text-sm ${
                    etapa.concluida ? "line-through text-text-muted" : "text-text-primary"
                  }`}
                >
                  {etapa.titulo}
                </span>
                {etapa.prazo && (
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(etapa.prazo + "T12:00:00").toLocaleDateString("pt-BR")}
                  </span>
                )}
                <button
                  onClick={() => onDeleteEtapa(etapa.id)}
                  className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={novaEtapa}
              onChange={(e) => setNovaEtapa(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddEtapa()}
              placeholder="Adicionar etapa..."
              className="flex-1 px-3 py-2 rounded-lg bg-bg-primary border border-border text-text-primary text-sm placeholder:text-text-muted"
            />
            <button
              onClick={handleAddEtapa}
              disabled={!novaEtapa.trim()}
              className="px-3 py-2 rounded-lg bg-bg-hover text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comentários */}
        <ComentariosSection tarefaId={tarefa.id} />

        {/* Actions */}
        <div className="flex justify-between pt-2 border-t border-border">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-danger hover:bg-danger/10 text-sm transition-colors"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Excluir
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !titulo.trim()}
              className="px-6 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Salvar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ========== Comentários ==========
function ComentariosSection({ tarefaId }: { tarefaId: string }) {
  const { comentarios, loading, addComentario } = useComentarios(tarefaId);
  const [texto, setTexto] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!texto.trim()) return;
    setSending(true);
    await addComentario(texto.trim());
    setTexto("");
    setSending(false);
  };

  return (
    <div>
      <p className="text-xs text-text-muted mb-3">Comentários</p>
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-4 h-4 text-accent animate-spin" />
        </div>
      ) : (
        <div className="space-y-3 max-h-48 overflow-y-auto mb-3">
          {comentarios.length === 0 && (
            <p className="text-text-muted text-xs text-center py-3">Nenhum comentário.</p>
          )}
          {comentarios.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-accent text-xs font-bold">
                  {(c.profile?.nome || "U")[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-text-primary">
                    {c.profile?.nome || "Usuário"}
                  </span>
                  <span className="text-xs text-text-muted">
                    {new Date(c.created_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mt-0.5">{c.conteudo}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Escreva um comentário..."
          className="flex-1 px-3 py-2 rounded-lg bg-bg-primary border border-border text-text-primary text-sm placeholder:text-text-muted"
        />
        <button
          onClick={handleSend}
          disabled={sending || !texto.trim()}
          className="px-3 py-2 rounded-lg bg-accent text-white disabled:opacity-30 transition-colors"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
