"use client";

import { useState, use } from "react";
import { ArrowLeft, Building2, Palette, KanbanSquare, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCliente } from "@/lib/hooks/use-clientes";
import { BrandHubTab } from "@/components/clientes/brand-hub-tab";
import { BrandTarefasTab } from "@/components/brand-hub/brand-tarefas-tab";

type Tab = "brand" | "tarefas";

const tabs: { id: Tab; label: string; icon: typeof Palette }[] = [
  { id: "brand", label: "Identidade Visual", icon: Palette },
  { id: "tarefas", label: "Tarefas", icon: KanbanSquare },
];

export default function BrandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { cliente, loading } = useCliente(id);
  const [activeTab, setActiveTab] = useState<Tab>("brand");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="p-6 md:p-8 text-center">
        <p className="text-text-muted">Marca nao encontrada.</p>
        <Link href="/brand-hub" className="text-accent hover:underline text-sm mt-2 inline-block">
          Voltar para Brand Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Back */}
      <Link
        href="/brand-hub"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Brand Hub
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-accent-light flex items-center justify-center overflow-hidden">
          {cliente.logo_url ? (
            <img src={cliente.logo_url} alt={cliente.nome} className="w-full h-full object-cover" />
          ) : (
            <Building2 className="w-7 h-7 text-accent" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{cliente.nome}</h1>
          {cliente.responsavel_nome && (
            <p className="text-text-secondary text-sm mt-0.5">{cliente.responsavel_nome}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === "brand" && <BrandHubTab clienteId={id} />}
      {activeTab === "tarefas" && <BrandTarefasTab clienteId={id} />}
    </div>
  );
}
