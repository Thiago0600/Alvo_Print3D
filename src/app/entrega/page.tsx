import type { Metadata } from "next";
import { PageHero } from "@/components/Section";
import { WhatsAppCta } from "@/components/WhatsAppCta";
import { getCompany } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Entrega gratuita em Portugal continental — Impressão 3D em Évora",
  description: "A Alvo Print 3D está em Évora e entrega gratuitamente em todo o Portugal continental. Condições para Açores e Madeira sob consulta.",
  alternates: { canonical: "/entrega" },
};
export const revalidate = 300;

export default async function Entrega() {
  const c = await getCompany();
  return (
    <>
      <PageHero
        eyebrow="Entrega e localização"
        title={<>Estamos em {c.city} e entregamos <span className="text-orange">gratuitamente</span> em Portugal continental.</>}
      />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-3">
        <div className="card p-6">
          <p className="tag">Portugal continental</p>
          <h2 className="mt-2 font-display text-xl font-bold text-white">Entrega gratuita</h2>
          <p className="mt-2 text-mute">Todas as encomendas são enviadas sem custos de transporte para qualquer morada no continente.</p>
        </div>
        <div className="card p-6">
          <p className="tag">Açores e Madeira</p>
          <h2 className="mt-2 font-display text-xl font-bold text-white">Condições específicas</h2>
          <p className="mt-2 text-mute">{c.islandsNote}</p>
        </div>
        <div className="card p-6">
          <p className="tag">Prazos</p>
          <h2 className="mt-2 font-display text-xl font-bold text-white">Confirmados por pedido</h2>
          <p className="mt-2 text-mute">
            O prazo depende da peça, da quantidade e do material. Confirmamos sempre o prazo pelo WhatsApp antes de avançar.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="card overflow-hidden">
          <iframe
            title={`Mapa — ${c.region}`}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=-8.05%2C38.54%2C-7.85%2C38.6&layer=mapnik&marker=38.5714%2C-7.9135`}
            className="h-72 w-full grayscale invert-[.9] hue-rotate-180"
            loading="lazy"
          />
        </div>
        <div className="mt-8"><WhatsAppCta text="Olá! Tenho uma questão sobre a entrega." /></div>
      </div>
    </>
  );
}
