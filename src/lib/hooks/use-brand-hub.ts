"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface BrandHub {
  id: string;
  cliente_id: string;
  nicho: string | null;
  publico_alvo: string | null;
  tom_de_voz: string | null;
  slogan: string | null;
  concorrentes: string | null;
  restricoes_visuais: string | null;
  fontes: BrandFonte[];
  cores: BrandCor[];
  created_at: string;
  updated_at: string;
}

export interface BrandFonte {
  nome: string;
  link: string;
}

export interface BrandCor {
  nome: string;
  hex: string;
  rgb: string;
  cmyk: string;
}

export interface BrandLogo {
  id: string;
  brand_hub_id: string;
  categoria: string;
  url: string;
  link_externo: string | null;
  created_at: string;
}

export interface BrandHistorico {
  id: string;
  brand_hub_id: string;
  campo_alterado: string;
  valor_anterior: string | null;
  valor_novo: string | null;
  usuario_id: string | null;
  created_at: string;
}

export function useBrandHub(clienteId: string) {
  const [brandHub, setBrandHub] = useState<BrandHub | null>(null);
  const [logos, setLogos] = useState<BrandLogo[]>([]);
  const [historico, setHistorico] = useState<BrandHistorico[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetch = useCallback(async () => {
    setLoading(true);

    // Fetch or create brand hub
    let { data } = await supabase
      .from("brand_hub")
      .select("*")
      .eq("cliente_id", clienteId)
      .single();

    if (!data) {
      const { data: created } = await supabase
        .from("brand_hub")
        .insert({ cliente_id: clienteId, fontes: [], cores: [] })
        .select()
        .single();
      data = created;
    }

    if (data) {
      setBrandHub(data);

      // Fetch logos
      const { data: logosData } = await supabase
        .from("brand_logos")
        .select("*")
        .eq("brand_hub_id", data.id)
        .order("created_at", { ascending: true });
      if (logosData) setLogos(logosData);

      // Fetch historico
      const { data: histData } = await supabase
        .from("brand_hub_historico")
        .select("*")
        .eq("brand_hub_id", data.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (histData) setHistorico(histData);
    }

    setLoading(false);
  }, [clienteId, supabase]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const updateField = async (campo: string, valor: string | null) => {
    if (!brandHub) return;

    const valorAnterior = (brandHub as unknown as Record<string, unknown>)[campo] as string | null;

    const { data } = await supabase
      .from("brand_hub")
      .update({ [campo]: valor, updated_at: new Date().toISOString() })
      .eq("id", brandHub.id)
      .select()
      .single();

    if (data) {
      setBrandHub(data);

      // Log historico
      const { data: { user } } = await supabase.auth.getUser();
      const { data: hist } = await supabase
        .from("brand_hub_historico")
        .insert({
          brand_hub_id: brandHub.id,
          campo_alterado: campo,
          valor_anterior: valorAnterior || null,
          valor_novo: valor,
          usuario_id: user?.id || null,
        })
        .select()
        .single();
      if (hist) setHistorico((prev) => [hist, ...prev]);
    }
  };

  const updateFontes = async (fontes: BrandFonte[]) => {
    if (!brandHub) return;
    const { data } = await supabase
      .from("brand_hub")
      .update({ fontes, updated_at: new Date().toISOString() })
      .eq("id", brandHub.id)
      .select()
      .single();
    if (data) setBrandHub(data);
  };

  const updateCores = async (cores: BrandCor[]) => {
    if (!brandHub) return;
    const { data } = await supabase
      .from("brand_hub")
      .update({ cores, updated_at: new Date().toISOString() })
      .eq("id", brandHub.id)
      .select()
      .single();
    if (data) setBrandHub(data);
  };

  const uploadLogo = async (file: File, categoria: string) => {
    if (!brandHub) return;

    const ext = file.name.split(".").pop();
    const path = `${clienteId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, file);

    if (uploadError) return { error: uploadError };

    const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(path);

    const { data, error } = await supabase
      .from("brand_logos")
      .insert({
        brand_hub_id: brandHub.id,
        categoria,
        url: publicUrl,
      })
      .select()
      .single();

    if (data) setLogos((prev) => [...prev, data]);
    return { data, error };
  };

  const deleteLogo = async (logoId: string) => {
    const { error } = await supabase.from("brand_logos").delete().eq("id", logoId);
    if (!error) setLogos((prev) => prev.filter((l) => l.id !== logoId));
  };

  return {
    brandHub,
    logos,
    historico,
    loading,
    updateField,
    updateFontes,
    updateCores,
    uploadLogo,
    deleteLogo,
    refresh: fetch,
  };
}
