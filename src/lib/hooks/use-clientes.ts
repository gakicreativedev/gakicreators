"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Cliente, ClienteForm } from "@/lib/types";

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setClientes(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const createCliente = async (form: ClienteForm) => {
    const { data, error } = await supabase
      .from("clientes")
      .insert({
        nome: form.nome,
        cnpj: form.cnpj || null,
        responsavel_nome: form.responsavel_nome || null,
        responsavel_contato: form.responsavel_contato || null,
        endereco: form.endereco || null,
        redes_sociais: form.redes_sociais,
        servicos_contratados: form.servicos_contratados.length > 0 ? form.servicos_contratados : null,
        valor_contrato: form.valor_contrato ? parseFloat(form.valor_contrato) : null,
        data_inicio: form.data_inicio || null,
        data_renovacao: form.data_renovacao || null,
        status: form.status,
        observacoes: form.observacoes || null,
      })
      .select()
      .single();

    if (!error && data) {
      setClientes((prev) => [data, ...prev]);
    }
    return { data, error };
  };

  const updateCliente = async (id: string, form: Partial<ClienteForm>) => {
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (form.nome !== undefined) updates.nome = form.nome;
    if (form.cnpj !== undefined) updates.cnpj = form.cnpj || null;
    if (form.responsavel_nome !== undefined) updates.responsavel_nome = form.responsavel_nome || null;
    if (form.responsavel_contato !== undefined) updates.responsavel_contato = form.responsavel_contato || null;
    if (form.endereco !== undefined) updates.endereco = form.endereco || null;
    if (form.redes_sociais !== undefined) updates.redes_sociais = form.redes_sociais;
    if (form.servicos_contratados !== undefined) updates.servicos_contratados = form.servicos_contratados.length > 0 ? form.servicos_contratados : null;
    if (form.valor_contrato !== undefined) updates.valor_contrato = form.valor_contrato ? parseFloat(form.valor_contrato) : null;
    if (form.data_inicio !== undefined) updates.data_inicio = form.data_inicio || null;
    if (form.data_renovacao !== undefined) updates.data_renovacao = form.data_renovacao || null;
    if (form.status !== undefined) updates.status = form.status;
    if (form.observacoes !== undefined) updates.observacoes = form.observacoes || null;

    const { data, error } = await supabase
      .from("clientes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      setClientes((prev) => prev.map((c) => (c.id === id ? data : c)));
    }
    return { data, error };
  };

  const deleteCliente = async (id: string) => {
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (!error) {
      setClientes((prev) => prev.filter((c) => c.id !== id));
    }
    return { error };
  };

  return { clientes, loading, fetchClientes, createCliente, updateCliente, deleteCliente };
}

export function useCliente(id: string) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) setCliente(data);
      setLoading(false);
    }
    fetch();
  }, [id, supabase]);

  return { cliente, setCliente, loading };
}
