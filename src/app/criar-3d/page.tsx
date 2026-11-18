import type { Metadata } from "next";
import { Suspense } from "react";
import { Creator } from "@/components/Creator";
import { PageHero } from "@/components/Section";
import { isMeshyConfigured } from "@/lib/meshy";
import { isSupabaseConfigured } from "@/lib/supabase-server";
import { getMeshySettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Criar modelo 3D através de fotografia com IA",
  description:
    "Carregue uma fotografia e a inteligência artificial cria o modelo 3D da sua peça. Veja-o em 360° e peça a impressão 3D com entrega gratuita em Portugal continental.",
  alternates: { canonical: "/criar-3d" },
};

export const dynamic = "force-dynamic";

export default async function Criar3D() {
  const settings = await getMeshySettings();
  const available = isMeshyConfigured() && isSupabaseConfigured() && settings.enabled;
  return (
    <>
      <PageHero
        eyebrow="Inteligência artificial"
        title={<>Crie a sua peça em 3D com <span className="text-orange">inteligência artificial</span></>}
        intro="Carregue uma fotografia, acompanhe a criação do modelo 3D, observe-o em 360° e peça a fabricação. Sem conhecimentos técnicos."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Suspense>
          <Creator available={available} />
        </Suspense>
      </div>
    </>
  );
}
