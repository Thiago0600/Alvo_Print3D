import type { Metadata } from "next";
import { PageHero } from "@/components/Section";
import { getCompany } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Política de privacidade",
  alternates: { canonical: "/privacidade" },
};
export const revalidate = 300;

// Texto-base. Recomenda-se revisão por um profissional (RGPD).
export default async function Privacidade() {
  const c = await getCompany();
  return (
    <>
      <PageHero eyebrow="Privacidade" title="Política de privacidade" />
      <article className="mx-auto max-w-3xl space-y-6 px-4 py-12 leading-relaxed text-soft sm:px-6">
        <section>
          <h2 className="font-display text-xl font-bold text-white">Responsável pelo tratamento</h2>
          <p>{c.name}, {c.region}. Contacto: WhatsApp +{c.whatsapp}{c.email ? ` · ${c.email}` : ""}.</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-white">Que dados recolhemos</h2>
          <p>Nome, telefone (se o indicar), descrição dos pedidos, fotografias e ficheiros que nos envia, e os modelos 3D gerados a partir deles. Guardamos também um identificador técnico anónimo do endereço IP (cifrado) para prevenir abusos.</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-white">Para que os usamos</h2>
          <p>Para preparar orçamentos, criar o modelo 3D da peça, produzir e entregar a encomenda, e responder-lhe pelo WhatsApp. Não vendemos nem partilhamos os seus dados para publicidade.</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-white">Serviços utilizados</h2>
          <p>As fotografias enviadas na área de criação 3D são processadas pela Meshy AI para gerar o modelo. Os ficheiros e pedidos são guardados no Supabase (alojamento de dados). As conversas decorrem no WhatsApp (Meta). Os ficheiros enviados ficam acessíveis através de endereços longos e não publicados.</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-white">Os seus direitos</h2>
          <p>Pode pedir acesso, retificação ou eliminação dos seus dados e das suas fotografias a qualquer momento através do WhatsApp. Pode também apresentar reclamação à CNPD (www.cnpd.pt).</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-white">Conservação</h2>
          <p>Conservamos os dados apenas pelo tempo necessário para tratar o pedido e cumprir obrigações legais.</p>
        </section>
      </article>
    </>
  );
}
