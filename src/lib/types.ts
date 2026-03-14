export type ClientStatus = "ativo" | "pausado" | "encerrado";

export interface Cliente {
  id: string;
  nome: string;
  logo_url: string | null;
  cnpj: string | null;
  responsavel_nome: string | null;
  responsavel_contato: string | null;
  endereco: string | null;
  redes_sociais: Record<string, string>;
  servicos_contratados: string[] | null;
  valor_contrato: number | null;
  data_inicio: string | null;
  data_renovacao: string | null;
  status: ClientStatus;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClienteForm {
  nome: string;
  cnpj: string;
  responsavel_nome: string;
  responsavel_contato: string;
  endereco: string;
  redes_sociais: Record<string, string>;
  servicos_contratados: string[];
  valor_contrato: string;
  data_inicio: string;
  data_renovacao: string;
  status: ClientStatus;
  observacoes: string;
}

export interface ContratoHistorico {
  id: string;
  cliente_id: string;
  campo_alterado: string;
  valor_anterior: string | null;
  valor_novo: string | null;
  usuario_id: string | null;
  created_at: string;
}

export type Prioridade = "urgente" | "alta" | "media" | "baixa";

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string | null;
  responsavel_id: string | null;
  prazo: string | null;
  prioridade: Prioridade;
  cliente_id: string | null;
  coluna_id: string | null;
  posicao: number;
  recorrente: boolean;
  frequencia: string | null;
  frequencia_dias: number | null;
  created_at: string;
  updated_at: string;
}

export type CategoriaMovimentacao = "receita" | "despesa" | "fornecedor" | "pro-labore" | "investimento";
export type StatusMovimentacao = "agendado" | "pago" | "pendente" | "atrasado" | "cancelado";

export interface Movimentacao {
  id: string;
  valor: number;
  categoria: CategoriaMovimentacao;
  data: string;
  descricao: string | null;
  cliente_id: string | null;
  comprovante_url: string | null;
  status: StatusMovimentacao;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  nome: string;
  email: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}
