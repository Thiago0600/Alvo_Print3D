import type { Metadata } from "next";
import { PageHero } from "@/components/Section";
import { QuoteForm } from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Impressão 3D industrial e produção em grandes quantidades",
  description:
    "Soluções de impressão 3D para empresas: produção em escala, prototipagem, desenvolvimento de peças e peças para manutenção industrial. Orçamentos para grandes quantidades.",
  alternates: { canonical: "/empresas" },
};

const ITEMS = [
  { t: "Produção em escala", d: "Séries de peças com repetibilidade, para linhas de produto, revenda ou montagem." },
  { t: "Fabricação personalizada", d: "Peças desenhadas para a sua aplicação, com o material adequado ao uso." },
  { t: "Prototipagem", d: "Valide formas, encaixes e ergonomia antes de investir em moldes." },
  { t: "Desenvolvimento de peças", d: "Partimos de uma fotografia, desenho, amostra ou ficheiro 3D." },
  { t: "Manutenção industrial", d: "Reprodução de peças de substituição descontinuadas ou difíceis de obter." },
  { t: "Parcerias comerciais", d: "Acordos de fornecimento recorrente para empresas e revendedores." },
];

export default function Empresas() {
  return (
    <>
      <PageHero
        eyebrow="Empresas"
        title={<>Impressão 3D para <span className="text-orange">empresas</span></>}
        intro="Fornecemos soluções de produção em escala para empresas em todo o país, com atendimento direto e entrega gratuita em Portugal continental."
      >
        <a href="#orcamento-empresarial" className="btn btn-primary mt-8 text-base">Solicitar orçamento empresarial</a>
      </PageHero>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((it, i) => (
            <div key={it.t} className="card p-6">
              <span className="font-mono text-xs text-orange">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="mt-2 font-display text-lg font-bold text-white">{it.t}</h2>
              <p className="mt-2 text-sm text-mute">{it.d}</p>
            </div>
          ))}
        </div>
      </div>
      <div id="orcamento-empresarial" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-10 sm:px-6">
        <h2 className="mb-2 font-display text-3xl font-extrabold text-white">Orçamentos para grandes quantidades</h2>
        <p className="mb-6 text-mute">Indique o que precisa; respondemos pelo WhatsApp com uma proposta.</p>
        <QuoteForm kind="empresa" />
      </div>
    </>
  );
}
