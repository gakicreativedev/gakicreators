"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { MovimentacaoForm } from "@/lib/hooks/use-movimentacoes";
import type { Movimentacao, CategoriaMovimentacao, StatusMovimentacao } from "@/lib/types";

const CATEGORIAS: { value: CategoriaMovimentacao; label: string }[] = [
  { value: "receita", label: "Receita" },
  { value: "despesa", label: "Despesa" },
  { value: "fornecedor", label: "Fornecedor" },
  { value: "pro-labore", label: "Pró-labore" },
  { value: "investimento", label: "Investimento" },
];

const STATUS_OPTIONS: { value: StatusMovimentacao; label: string }[] = [
  { value: "pendente", label: "Pendente" },
  { value: "pago", label: "Pago" },
  { value: "agendado", label: "Agendado" },
  { value: "atrasado", label: "Atrasado" },
  { value: "cancelado", label: "Cancelado" },
];

interface Props {
  movimentacao?: Movimentacao;
  onSubmit: (form: MovimentacaoForm) => Promise<void>;
  onCancel: () => void;
}

export function MovimentacaoFormComponent({ movimentacao, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<MovimentacaoForm>({
    valor: movimentacao?.valor?.toString() || "",
    categoria: movimentacao?.categoria || "receita",
    data: movimentacao?.data || new Date().toISOString().split("T")[0],
    descricao: movimentacao?.descricao || "",
    cliente_id: movimentacao?.cliente_id || "",
    status: movimentacao?.status || "pendente",
  });
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([]);

  const supabase = createClient();

  useEffect(() => {
    async function fetchClientes() {
      const { data } = await supabase
        .from("clientes")
        .select("id, nome")
        .eq("status", "ativo")
        .order("nome");
      if (data) setClientes(data);
    }
    fetchClientes();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.valor || parseFloat(form.valor) <= 0) return;
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl bg-bg-primary border border-border text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent transition-colors text-sm";
  const labelClass = "block text-sm font-medium text-text-secondary mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Valor (R$) *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
            placeholder="0,00"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Categoria *</label>
          <select
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value as CategoriaMovimentacao })}
            className={inputClass}
          >
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Data *</label>
          <input
            type="date"
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as StatusMovimentacao })}
            className={inputClass}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Cliente vinculado</label>
          <select
            value={form.cliente_id}
            onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
            className={inputClass}
          >
            <option value="">Nenhum (despesa geral)</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Descrição</label>
          <textarea
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            placeholder="Detalhamento do lançamento..."
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !form.valor}
          className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : movimentacao ? (
            "Salvar alterações"
          ) : (
            "Criar movimentação"
          )}
        </button>
      </div>
    </form>
  );
}
