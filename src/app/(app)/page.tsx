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
          <div className="text-center py-6">
            <p className="text-text-muted text-sm">Nenhuma tarefa urgente</p>
          </div>
        </div>

        <div className="rounded-2xl bg-bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-danger" />
            <h3 className="font-semibold text-text-primary text-sm">Contas a vencer</h3>
          </div>
          <div className="text-center py-6">
            <p className="text-text-muted text-sm">Nenhuma conta próxima do vencimento</p>
          </div>
        </div>

        <div className="rounded-2xl bg-bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-success" />
            <h3 className="font-semibold text-text-primary text-sm">Resumo financeiro do mês</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-text-muted">Entradas</p>
              <p className="text-lg font-bold text-success">R$ 0</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Saídas</p>
              <p className="text-lg font-bold text-danger">R$ 0</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Saldo</p>
              <p className="text-lg font-bold text-text-primary">R$ 0</p>
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
