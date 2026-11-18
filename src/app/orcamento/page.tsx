import type { Metadata } from "next";
import { PageHero } from "@/components/Section";
import { QuoteForm } from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Solicitar orçamento de impressão 3D",
  description:
    "Peça um orçamento de impressão 3D para peças personalizadas, protótipos ou produção em grandes quantidades. Resposta pelo WhatsApp e entrega gratuita em Portugal continental.",
  alternates: { canonical: "/orcamento" },
};

export default function Orcamento() {
  return (
    <>
      <PageHero
        eyebrow="Orçamento"
        title="Solicitar orçamento"
        intro="Conte-nos o que precisa. Trabalhamos com particulares e empresas — de uma peça única a produção em escala."
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <QuoteForm />
      </div>
    </>
  );
}
