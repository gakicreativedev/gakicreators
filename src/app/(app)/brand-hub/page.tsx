"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Loader2, Building2, Palette } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Cliente } from "@/lib/types";

export default function BrandHubPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("clientes")
        .select("*")
        .eq("status", "ativo")
        .order("nome");

      if (data) setClientes(data);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const filtered = useMemo(() => {
    if (!search.trim()) return clientes;
    const q = search.toLowerCase();
    return clientes.filter((c) => c.nome.toLowerCase().includes(q));
  }, [clientes, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Palette className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-bold text-text-primary">Brand Hub</h1>
        </div>
        <p className="text-text-secondary text-sm">
          Acesse a identidade visual e materiais de cada marca
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar marca..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-text-primary text-sm placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-bg-card border border-border">
          <Palette className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            {search ? "Nenhuma marca encontrada." : "Nenhum cliente ativo cadastrado."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cliente) => (
            <Link
              key={cliente.id}
              href={`/brand-hub/${cliente.id}`}
              className="group rounded-2xl bg-bg-card border border-border hover:border-accent/30 p-5 transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center group-hover:bg-accent/20 transition-colors overflow-hidden">
                  {cliente.logo_url ? (
                    <img
                      src={cliente.logo_url}
                      alt={cliente.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-accent" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary truncate">
                    {cliente.nome}
                  </h3>
                  {cliente.responsavel_nome && (
                    <p className="text-xs text-text-muted truncate">
                      {cliente.responsavel_nome}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-accent/10 text-accent text-xs font-medium">
                  Ver Brand Hub
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
