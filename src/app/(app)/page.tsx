"use client";

import { useEffect, useState } from "react";
import {
  Users,
  KanbanSquare,
  HeartPulse,
  Plus,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const modules = [
  { href: "/clientes", label: "Clientes", icon: Users, description: "Gerencie seus clientes" },
  { href: "/tarefas", label: "Tarefas", icon: KanbanSquare, description: "Kanban e gestão de tarefas" },
  { href: "/saude", label: "Saúde", icon: HeartPulse, description: "Módulo financeiro" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function HomePage() {
  const [clientesAtivos, setClientesAtivos] = useState(0);
  const [userName, setUserName] = useState("");
  const [resumo, setResumo] = useState({ entradas: 0, saidas: 0, saldo: 0 });
  const [tarefasUrgentes, setTarefasUrgentes] = useState<{ id: string; titulo: string; prazo: string }[]>([]);
  const [contasVencer, setContasVencer] = useState<{ id: string; descricao: string; valor: number; data: string }[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { count } = await supabase
        .from("clientes")
        .select("*", { count: "exact", head: true })
        .eq("status", "ativo");
      setClientesAtivos(count || 0);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("nome")
          .eq("id", user.id)
          .single();
        if (profile) setUserName(profile.nome);
      }

      // Financial summary for current month
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

      const { data: movs } = await supabase
        .from("movimentacoes")
        .select("categoria, valor, status")
        .gte("data", firstDay)
        .lte("data", lastDay);

      if (movs) {
        const r = movs.reduce(
          (acc, m) => {
            if (m.status === "cancelado") return acc;
            const val = Number(m.valor);
            if (m.categoria === "receita") acc.entradas += val;
            else acc.saidas += val;
            acc.saldo = acc.entradas - acc.saidas;
            return acc;
          },
          { entradas: 0, saidas: 0, saldo: 0 }
        );
        setResumo(r);
      }

      // Urgent tasks (due today or overdue)
      const today = now.toISOString().split("T")[0];
      const { data: urgentes } = await supabase
        .from("tarefas")
        .select("id, titulo, prazo")
        .not("prazo", "is", null)
        .lte("prazo", today)
        .order("prazo");

      if (urgentes) setTarefasUrgentes(urgentes.slice(0, 5));

      // Upcoming bills (pending movimentações in next 7 days)
      const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const { data: contas } = await supabase
        .from("movimentacoes")
        .select("id, descricao, valor, data")
        .eq("status", "pendente")
        .neq("categoria", "receita")
        .gte("data", today)
        .lte("data", in7days)
        .order("data");

      if (contas) setContasVencer(contas.slice(0, 5));
    }
    load();
  }, [supabase]);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          {getGreeting()}{userName ? `, ${userName.split(" ")[0]}` : ""}!
        </h1>
        <p className="text-text-secondary mt-1">
          Aqui está o resumo do seu dia no Naka OS.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-8">
        <Link
          href="/tarefas?nova=true"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Tarefa
        </Link>
        <Link
          href="/saude?nova=true"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-card border border-border hover:bg-bg-hover text-text-primary text-sm font-medium transition-colors"
        >
          <DollarSign className="w-4 h-4" />
          Nova Movimentação
        </Link>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.href}
              href={mod.href}
              className="group p-5 rounded-2xl bg-bg-card border border-border hover:border-accent/30 hover:shadow-lg transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold text-text-primary">{mod.label}</h3>
              <p className="text-sm text-text-muted mt-1">{mod.description}</p>
            </Link>
          );
        })}
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-warning" />
            <h3 className="font-semibold text-text-primary text-sm">
              Tarefas com prazo hoje ou atrasadas
            </h3>
          </div>
          {tarefasUrgentes.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-text-muted text-sm">Nenhuma tarefa urgente</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tarefasUrgentes.map((t) => (
                <Link key={t.id} href="/tarefas" className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-hover transition-colors">
                  <span className="text-sm text-text-primary truncate">{t.titulo}</span>
                  <span className="text-xs text-danger flex-shrink-0 ml-2">
                    {new Date(t.prazo + "T12:00:00").toLocaleDateString("pt-BR")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-danger" />
            <h3 className="font-semibold text-text-primary text-sm">Contas a vencer</h3>
          </div>
          {contasVencer.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-text-muted text-sm">Nenhuma conta próxima do vencimento</p>
            </div>
          ) : (
            <div className="space-y-2">
              {contasVencer.map((c) => (
                <Link key={c.id} href="/saude" className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-hover transition-colors">
                  <span className="text-sm text-text-primary truncate">{c.descricao || "Sem descrição"}</span>
                  <span className="text-xs text-danger flex-shrink-0 ml-2">
                    {Number(c.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-success" />
            <h3 className="font-semibold text-text-primary text-sm">Resumo financeiro do mês</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-text-muted">Entradas</p>
              <p className="text-lg font-bold text-success">{resumo.entradas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Saídas</p>
              <p className="text-lg font-bold text-danger">{resumo.saidas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Saldo</p>
              <p className={`text-lg font-bold ${resumo.saldo >= 0 ? "text-success" : "text-danger"}`}>{resumo.saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-accent" />
            <h3 className="font-semibold text-text-primary text-sm">Clientes ativos</h3>
          </div>
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-accent">{clientesAtivos}</p>
            <p className="text-text-muted text-sm mt-1">
              cliente{clientesAtivos !== 1 ? "s" : ""} ativo{clientesAtivos !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
