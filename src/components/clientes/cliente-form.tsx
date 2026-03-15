"use client";

import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import type { Cliente, ClienteForm } from "@/lib/types";

const SERVICOS_OPCOES = [
  "Gestão de redes sociais",
  "Tráfego pago",
  "Criação de conteúdo",
];

const REDES_OPCOES = ["instagram", "facebook", "tiktok", "linkedin", "youtube", "twitter", "site"];

interface ClienteFormComponentProps {
  cliente?: Cliente;
  onSubmit: (form: ClienteForm) => Promise<void>;
  onCancel: () => void;
}

const emptyForm: ClienteForm = {
  nome: "",
  cnpj: "",
  responsavel_nome: "",
  responsavel_contato: "",
  endereco: "",
  redes_sociais: {},
  servicos_contratados: [],
  valor_contrato: "",
  data_inicio: "",
  data_renovacao: "",
  status: "ativo",
  observacoes: "",
};

function formFromCliente(c: Cliente): ClienteForm {
  return {
    nome: c.nome,
    cnpj: c.cnpj || "",
    responsavel_nome: c.responsavel_nome || "",
    responsavel_contato: c.responsavel_contato || "",
    endereco: c.endereco || "",
    redes_sociais: c.redes_sociais || {},
    servicos_contratados: c.servicos_contratados || [],
    valor_contrato: c.valor_contrato?.toString() || "",
    data_inicio: c.data_inicio || "",
    data_renovacao: c.data_renovacao || "",
    status: c.status,
    observacoes: c.observacoes || "",
  };
}

export function ClienteFormComponent({ cliente, onSubmit, onCancel }: ClienteFormComponentProps) {
  const [form, setForm] = useState<ClienteForm>(cliente ? formFromCliente(cliente) : emptyForm);
  const [loading, setLoading] = useState(false);
  const [servicoCustom, setServicoCustom] = useState("");

  const isEncerrado = cliente?.status === "encerrado";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) return;
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  const toggleServico = (servico: string) => {
    setForm((f) => ({
      ...f,
      servicos_contratados: f.servicos_contratados.includes(servico)
        ? f.servicos_contratados.filter((s) => s !== servico)
        : [...f.servicos_contratados, servico],
    }));
  };

  const addServicoCustom = () => {
    if (!servicoCustom.trim()) return;
    if (!form.servicos_contratados.includes(servicoCustom.trim())) {
      setForm((f) => ({
        ...f,
        servicos_contratados: [...f.servicos_contratados, servicoCustom.trim()],
      }));
    }
    setServicoCustom("");
  };

  const setRede = (rede: string, value: string) => {
    setForm((f) => ({
      ...f,
      redes_sociais: { ...f.redes_sociais, [rede]: value },
    }));
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl glass-input text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent transition-colors text-sm disabled:opacity-50";
  const labelClass = "block text-sm font-medium text-text-secondary mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Seção: Dados Gerais */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wider">
          Dados Gerais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Nome da empresa *</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Restaurante Sabor & Arte"
              className={inputClass}
              required
              disabled={isEncerrado}
            />
          </div>
          <div>
            <label className={labelClass}>CNPJ</label>
            <input
              type="text"
              value={form.cnpj}
              onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
              placeholder="00.000.000/0000-00"
              className={inputClass}
              disabled={isEncerrado}
            />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ClienteForm["status"] })}
              className={inputClass}
            >
              <option value="ativo">Ativo</option>
              <option value="pausado">Pausado</option>
              <option value="encerrado">Encerrado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Seção: Responsável */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wider">
          Responsável
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nome do responsável</label>
            <input
              type="text"
              value={form.responsavel_nome}
              onChange={(e) => setForm({ ...form, responsavel_nome: e.target.value })}
              placeholder="Nome completo"
              className={inputClass}
              disabled={isEncerrado}
            />
          </div>
          <div>
            <label className={labelClass}>Contato</label>
            <input
              type="text"
              value={form.responsavel_contato}
              onChange={(e) => setForm({ ...form, responsavel_contato: e.target.value })}
              placeholder="Telefone ou e-mail"
              className={inputClass}
              disabled={isEncerrado}
            />
          </div>
        </div>
      </div>

      {/* Seção: Endereço */}
      <div>
        <label className={labelClass}>Endereço</label>
        <input
          type="text"
          value={form.endereco}
          onChange={(e) => setForm({ ...form, endereco: e.target.value })}
          placeholder="Endereço completo"
          className={inputClass}
          disabled={isEncerrado}
        />
      </div>

      {/* Seção: Redes Sociais */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wider">
          Redes Sociais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {REDES_OPCOES.map((rede) => (
            <div key={rede}>
              <label className="block text-xs text-text-muted mb-1 capitalize">{rede}</label>
              <input
                type="text"
                value={form.redes_sociais[rede] || ""}
                onChange={(e) => setRede(rede, e.target.value)}
                placeholder={`@${rede}`}
                className={inputClass}
                disabled={isEncerrado}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Seção: Contrato */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wider">
          Informações Contratuais
        </h3>

        {/* Serviços */}
        <label className={labelClass}>Serviços contratados</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {SERVICOS_OPCOES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleServico(s)}
              disabled={isEncerrado}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                form.servicos_contratados.includes(s)
                  ? "bg-accent/15 text-accent border-accent/30"
                  : "bg-bg-primary text-text-muted border-border hover:border-accent/30"
              }`}
            >
              {s}
            </button>
          ))}
          {form.servicos_contratados
            .filter((s) => !SERVICOS_OPCOES.includes(s))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleServico(s)}
                disabled={isEncerrado}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/15 text-accent border border-accent/30 flex items-center gap-1"
              >
                {s}
                <X className="w-3 h-3" />
              </button>
            ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={servicoCustom}
            onChange={(e) => setServicoCustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addServicoCustom())}
            placeholder="Adicionar serviço personalizado"
            className={`${inputClass} flex-1`}
            disabled={isEncerrado}
          />
          <button
            type="button"
            onClick={addServicoCustom}
            disabled={isEncerrado}
            className="px-3 py-2 rounded-xl bg-bg-hover text-text-secondary hover:text-text-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className={labelClass}>Valor do contrato (R$)</label>
            <input
              type="number"
              step="0.01"
              value={form.valor_contrato}
              onChange={(e) => setForm({ ...form, valor_contrato: e.target.value })}
              placeholder="0,00"
              className={inputClass}
              disabled={isEncerrado}
            />
          </div>
          <div>
            <label className={labelClass}>Data de início</label>
            <input
              type="date"
              value={form.data_inicio}
              onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
              className={inputClass}
              disabled={isEncerrado}
            />
          </div>
          <div>
            <label className={labelClass}>Data de renovação</label>
            <input
              type="date"
              value={form.data_renovacao}
              onChange={(e) => setForm({ ...form, data_renovacao: e.target.value })}
              className={inputClass}
              disabled={isEncerrado}
            />
          </div>
        </div>
      </div>

      {/* Observações */}
      <div>
        <label className={labelClass}>Observações internas</label>
        <textarea
          value={form.observacoes}
          onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
          placeholder="Anotações sobre o cliente..."
          rows={3}
          className={`${inputClass} resize-none`}
          disabled={isEncerrado}
        />
      </div>

      {/* Actions */}
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
          disabled={loading || !form.nome.trim()}
          className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : cliente ? (
            "Salvar alterações"
          ) : (
            "Criar cliente"
          )}
        </button>
      </div>
    </form>
  );
}
