"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Movimentacao, CategoriaMovimentacao, StatusMovimentacao } from "@/lib/types";

export interface MovimentacaoForm {
  valor: string;
  categoria: CategoriaMovimentacao;
  data: string;
  descricao: string;
  cliente_id: string;
  status: StatusMovimentacao;
}

export interface ResumoFinanceiro {
  entradas: number;
  saidas: number;
  saldo: number;
}

export function useMovimentacoes(clienteId?: string) {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("movimentacoes").select("*").order("data", { ascending: false });
    if (clienteId) query = query.eq("cliente_id", clienteId);
    const { data } = await query;
    if (data) setMovimentacoes(data);
    setLoading(false);
  }, [clienteId, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resumo: ResumoFinanceiro = movimentacoes.reduce(
    (acc, m) => {
      if (m.status === "cancelado") return acc;
      const val = Number(m.valor);
      if (m.categoria === "receita") {
        acc.entradas += val;
      } else {
        acc.saidas += val;
      }
      acc.saldo = acc.entradas - acc.saidas;
      return acc;
    },
    { entradas: 0, saidas: 0, saldo: 0 }
  );

  const createMovimentacao = async (form: MovimentacaoForm) => {
    const { data, error } = await supabase
      .from("movimentacoes")
      .insert({
        valor: parseFloat(form.valor),
        categoria: form.categoria,
        data: form.data || new Date().toISOString().split("T")[0],
        descricao: form.descricao || null,
        cliente_id: form.cliente_id || clienteId || null,
        status: form.status,
      })
      .select()
      .single();

    if (data) setMovimentacoes((prev) => [data, ...prev]);
    return { data, error };
  };

  const updateMovimentacao = async (id: string, updates: Partial<Movimentacao>) => {
    const { data } = await supabase
      .from("movimentacoes")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (data) setMovimentacoes((prev) => prev.map((m) => (m.id === id ? data : m)));
    return { data };
  };

  const deleteMovimentacao = async (id: string) => {
    await supabase.from("movimentacoes").delete().eq("id", id);
    setMovimentacoes((prev) => prev.filter((m) => m.id !== id));
  };

  return {
    movimentacoes,
    resumo,
    loading,
    createMovimentacao,
    updateMovimentacao,
    deleteMovimentacao,
    refresh: fetchData,
  };
}
