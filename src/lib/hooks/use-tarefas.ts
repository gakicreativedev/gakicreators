"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tarefa, Prioridade } from "@/lib/types";

export interface KanbanColuna {
  id: string;
  titulo: string;
  posicao: number;
  cliente_id: string | null;
  created_at: string;
}

export interface Etapa {
  id: string;
  tarefa_id: string;
  titulo: string;
  responsavel_id: string | null;
  prazo: string | null;
  concluida: boolean;
  posicao: number;
  created_at: string;
}

export interface Comentario {
  id: string;
  tarefa_id: string;
  usuario_id: string;
  conteudo: string;
  created_at: string;
  profile?: { nome: string };
}

export interface Tag {
  id: string;
  nome: string;
  cor: string;
  created_at: string;
}

export interface TarefaComRelacoes extends Tarefa {
  tags?: Tag[];
  etapas?: Etapa[];
}

export function useKanban(clienteId?: string) {
  const [colunas, setColunas] = useState<KanbanColuna[]>([]);
  const [tarefas, setTarefas] = useState<TarefaComRelacoes[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);

    // Fetch columns
    let colQuery = supabase.from("kanban_colunas").select("*").order("posicao");
    if (clienteId) {
      colQuery = colQuery.eq("cliente_id", clienteId);
    } else {
      colQuery = colQuery.is("cliente_id", null);
    }
    const { data: colData } = await colQuery;

    // If no columns exist, create defaults
    if (!colData || colData.length === 0) {
      const defaults = ["Backlog", "Em Progresso", "Revisão", "Concluído"];
      const inserts = defaults.map((titulo, i) => ({
        titulo,
        posicao: i,
        cliente_id: clienteId || null,
      }));
      const { data: created } = await supabase
        .from("kanban_colunas")
        .insert(inserts)
        .select();
      if (created) setColunas(created);
    } else {
      setColunas(colData);
    }

    // Fetch tasks
    let taskQuery = supabase.from("tarefas").select("*").order("posicao");
    if (clienteId) {
      taskQuery = taskQuery.eq("cliente_id", clienteId);
    }
    const { data: taskData } = await taskQuery;

    if (taskData) {
      // Fetch tags for all tasks
      const taskIds = taskData.map((t) => t.id);
      if (taskIds.length > 0) {
        const { data: tarefasTags } = await supabase
          .from("tarefas_tags")
          .select("tarefa_id, tags(*)")
          .in("tarefa_id", taskIds);

        const { data: etapasData } = await supabase
          .from("etapas")
          .select("*")
          .in("tarefa_id", taskIds)
          .order("posicao");

        const enriched = taskData.map((t) => ({
          ...t,
          tags: (tarefasTags || [])
            .filter((tt) => tt.tarefa_id === t.id)
            .map((tt) => tt.tags as unknown as Tag),
          etapas: (etapasData || []).filter((e) => e.tarefa_id === t.id),
        }));
        setTarefas(enriched);
      } else {
        setTarefas([]);
      }
    }

    // Fetch all tags
    const { data: allTags } = await supabase.from("tags").select("*").order("nome");
    if (allTags) setTags(allTags);

    setLoading(false);
  }, [clienteId, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // === Column operations ===
  const addColuna = async (titulo: string) => {
    const maxPos = colunas.reduce((max, c) => Math.max(max, c.posicao), -1);
    const { data } = await supabase
      .from("kanban_colunas")
      .insert({ titulo, posicao: maxPos + 1, cliente_id: clienteId || null })
      .select()
      .single();
    if (data) setColunas((prev) => [...prev, data]);
  };

  const updateColuna = async (id: string, titulo: string) => {
    await supabase.from("kanban_colunas").update({ titulo }).eq("id", id);
    setColunas((prev) => prev.map((c) => (c.id === id ? { ...c, titulo } : c)));
  };

  const deleteColuna = async (id: string) => {
    await supabase.from("kanban_colunas").delete().eq("id", id);
    setColunas((prev) => prev.filter((c) => c.id !== id));
    // Move tasks from deleted column to null
    setTarefas((prev) =>
      prev.map((t) => (t.coluna_id === id ? { ...t, coluna_id: null } : t))
    );
  };

  const reorderColunas = async (newOrder: KanbanColuna[]) => {
    setColunas(newOrder);
    const updates = newOrder.map((c, i) => ({ id: c.id, posicao: i }));
    for (const u of updates) {
      await supabase.from("kanban_colunas").update({ posicao: u.posicao }).eq("id", u.id);
    }
  };

  // === Task operations ===
  const createTarefa = async (data: {
    titulo: string;
    descricao?: string;
    responsavel_id?: string;
    prazo?: string;
    prioridade?: Prioridade;
    cliente_id?: string;
    coluna_id?: string;
    recorrente?: boolean;
    frequencia?: string;
    frequencia_dias?: number;
    tagIds?: string[];
  }) => {
    const maxPos = tarefas
      .filter((t) => t.coluna_id === data.coluna_id)
      .reduce((max, t) => Math.max(max, t.posicao), -1);

    const { data: tarefa, error } = await supabase
      .from("tarefas")
      .insert({
        titulo: data.titulo,
        descricao: data.descricao || null,
        responsavel_id: data.responsavel_id || null,
        prazo: data.prazo || null,
        prioridade: data.prioridade || "media",
        cliente_id: data.cliente_id || clienteId || null,
        coluna_id: data.coluna_id || null,
        posicao: maxPos + 1,
        recorrente: data.recorrente || false,
        frequencia: data.frequencia || null,
        frequencia_dias: data.frequencia_dias || null,
      })
      .select()
      .single();

    if (error || !tarefa) return { error };

    // Add tags
    if (data.tagIds && data.tagIds.length > 0) {
      await supabase.from("tarefas_tags").insert(
        data.tagIds.map((tagId) => ({ tarefa_id: tarefa.id, tag_id: tagId }))
      );
    }

    const enriched: TarefaComRelacoes = {
      ...tarefa,
      tags: tags.filter((t) => data.tagIds?.includes(t.id)),
      etapas: [],
    };
    setTarefas((prev) => [...prev, enriched]);
    return { data: enriched };
  };

  const updateTarefa = async (id: string, updates: Partial<Tarefa>) => {
    const { data } = await supabase
      .from("tarefas")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (data) {
      setTarefas((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...data } : t))
      );
    }
    return { data };
  };

  const deleteTarefa = async (id: string) => {
    await supabase.from("tarefas").delete().eq("id", id);
    setTarefas((prev) => prev.filter((t) => t.id !== id));
  };

  const moveTarefa = async (tarefaId: string, colunaId: string, newPos: number) => {
    await supabase
      .from("tarefas")
      .update({ coluna_id: colunaId, posicao: newPos })
      .eq("id", tarefaId);
    setTarefas((prev) =>
      prev.map((t) =>
        t.id === tarefaId ? { ...t, coluna_id: colunaId, posicao: newPos } : t
      )
    );
  };

  // === Tag operations ===
  const createTag = async (nome: string, cor: string = "#3b82f6") => {
    const { data } = await supabase
      .from("tags")
      .insert({ nome, cor })
      .select()
      .single();
    if (data) setTags((prev) => [...prev, data]);
    return data;
  };

  const toggleTagOnTarefa = async (tarefaId: string, tagId: string) => {
    const tarefa = tarefas.find((t) => t.id === tarefaId);
    if (!tarefa) return;

    const hasTag = tarefa.tags?.some((t) => t.id === tagId);
    if (hasTag) {
      await supabase
        .from("tarefas_tags")
        .delete()
        .eq("tarefa_id", tarefaId)
        .eq("tag_id", tagId);
      setTarefas((prev) =>
        prev.map((t) =>
          t.id === tarefaId
            ? { ...t, tags: (t.tags || []).filter((tag) => tag.id !== tagId) }
            : t
        )
      );
    } else {
      await supabase
        .from("tarefas_tags")
        .insert({ tarefa_id: tarefaId, tag_id: tagId });
      const tag = tags.find((t) => t.id === tagId);
      if (tag) {
        setTarefas((prev) =>
          prev.map((t) =>
            t.id === tarefaId ? { ...t, tags: [...(t.tags || []), tag] } : t
          )
        );
      }
    }
  };

  // === Etapa operations ===
  const addEtapa = async (tarefaId: string, titulo: string) => {
    const tarefa = tarefas.find((t) => t.id === tarefaId);
    const maxPos = (tarefa?.etapas || []).reduce((max, e) => Math.max(max, e.posicao), -1);

    const { data } = await supabase
      .from("etapas")
      .insert({ tarefa_id: tarefaId, titulo, posicao: maxPos + 1 })
      .select()
      .single();

    if (data) {
      setTarefas((prev) =>
        prev.map((t) =>
          t.id === tarefaId ? { ...t, etapas: [...(t.etapas || []), data] } : t
        )
      );
    }
    return data;
  };

  const updateEtapa = async (etapaId: string, updates: Partial<Etapa>) => {
    const { data } = await supabase
      .from("etapas")
      .update(updates)
      .eq("id", etapaId)
      .select()
      .single();

    if (data) {
      setTarefas((prev) =>
        prev.map((t) => ({
          ...t,
          etapas: (t.etapas || []).map((e) => (e.id === etapaId ? data : e)),
        }))
      );
    }
  };

  const deleteEtapa = async (etapaId: string) => {
    await supabase.from("etapas").delete().eq("id", etapaId);
    setTarefas((prev) =>
      prev.map((t) => ({
        ...t,
        etapas: (t.etapas || []).filter((e) => e.id !== etapaId),
      }))
    );
  };

  return {
    colunas,
    tarefas,
    tags,
    loading,
    addColuna,
    updateColuna,
    deleteColuna,
    reorderColunas,
    createTarefa,
    updateTarefa,
    deleteTarefa,
    moveTarefa,
    createTag,
    toggleTagOnTarefa,
    addEtapa,
    updateEtapa,
    deleteEtapa,
    refresh: fetchData,
  };
}

// === Comentarios hook ===
export function useComentarios(tarefaId: string) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("comentarios")
        .select("*, profile:profiles(nome)")
        .eq("tarefa_id", tarefaId)
        .order("created_at", { ascending: true });

      if (data) {
        setComentarios(
          data.map((c) => ({
            ...c,
            profile: c.profile as unknown as { nome: string },
          }))
        );
      }
      setLoading(false);
    }
    fetch();
  }, [tarefaId, supabase]);

  const addComentario = async (conteudo: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("comentarios")
      .insert({ tarefa_id: tarefaId, usuario_id: user.id, conteudo })
      .select("*, profile:profiles(nome)")
      .single();

    if (data) {
      setComentarios((prev) => [
        ...prev,
        { ...data, profile: data.profile as unknown as { nome: string } },
      ]);
    }
  };

  return { comentarios, loading, addComentario };
}
