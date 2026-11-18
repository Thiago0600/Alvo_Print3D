import Link from "next/link";
import { HeroVisual } from "@/components/HeroVisual";
import { ProcessSteps } from "@/components/ProcessSteps";
import { ProductCard } from "@/components/ProductCard";
import { Section } from "@/components/Section";
import { WhatsAppCta } from "@/components/WhatsAppCta";
import { getCategories, getProducts } from "@/lib/catalog";
import { getCompany } from "@/lib/settings";

export const revalidate = 120;

const ADVANTAGES = [
  { t: "Produção personalizada", d: "Cada peça é pensada para a sua função: dimensões, material, cor e acabamento à medida." },
  { t: "Grandes quantidades", d: "Da unidade única a séries de produção para empresas, com qualidade consistente." },
  { t: "Entrega gratuita", d: "Enviamos sem custos para todo o Portugal continental." },
  { t: "Fale com quem produz", d: "Atendimento direto pelo WhatsApp, do pedido à entrega." },
];

const SERVICES = [
  "Peças de qualquer tipo",
  "Peças personalizadas",
  "Reprodução a partir de fotografias",
  "Protótipos",
  "Peças industriais",
  "Peças para automóveis",
  "Peças decorativas",
  "Peças funcionais e utilitárias",
];

export default async function Home() {
  const [company, featured, categories] = await Promise.all([
    getCompany(),
    getProducts({ featured: true, limit: 6 }),
    getCategories(),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="relative -mt-16 overflow-hidden pt-16">
        <div className="bedgrid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 pb-10 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
          <div className="reveal">
            <p className="tag mb-5">Impressão 3D · {company.city} · Portugal</p>
            <h1 className="font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Da sua ideia
              <br />à <span className="text-orange">realidade.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-soft sm:text-xl">
              Transformamos imagens em peças 3D. Envie uma fotografia, veja o modelo criado por inteligência
              artificial e receba a peça impressa em casa.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/criar-3d" className="btn btn-primary text-base">
                Criar a minha peça em 3D com IA
              </Link>
              <Link href="/orcamento" className="btn btn-ghost text-base">
                Solicitar orçamento
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-mute">
              <li>✓ Entrega gratuita no continente</li>
              <li>✓ Peças únicas ou em série</li>
              <li>✓ Resposta pelo WhatsApp</li>
            </ul>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* SERVIÇOS (faixa) */}
      <div className="border-y border-line bg-graphite">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-8 gap-y-3 px-4 py-6 text-sm font-semibold text-soft sm:px-6">
          {SERVICES.map((s) => (
            <span key={s} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-orange" />
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* PROCESSO */}
      <Section
        eyebrow="Como funciona"
        title="Uma fotografia chega para começar."
        intro="Não precisa de saber nada de impressão 3D. Nós tratamos da parte técnica."
      >
        <ProcessSteps />
      </Section>

      {/* IA DESTAQUE */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="card layers relative overflow-hidden p-8 sm:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange/20 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="tag mb-3">Novo · Inteligência artificial</p>
              <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                Crie a sua peça em 3D com inteligência artificial
              </h2>
              <p className="mt-4 text-lg text-mute">
                Carregue a fotografia de uma peça e, em poucos minutos, veja-a transformada num modelo 3D que pode
                rodar e ampliar. Gostou? Peça a fabricação com um clique.
              </p>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <Link href="/criar-3d" className="btn btn-primary text-base">
                Experimentar agora
              </Link>
              <p className="text-sm text-mute">Gratuito · sem registo</p>
            </div>
          </div>
        </div>
      </section>

      {/* VANTAGENS */}
      <Section eyebrow="Vantagens" title="Porquê a Alvo Print 3D">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ADVANTAGES.map((a, i) => (
            <div key={a.t} className="card p-6">
              <span className="font-mono text-xs text-mute">0{i + 1}</span>
              <h3 className="mt-3 font-display text-lg font-bold text-white">{a.t}</h3>
              <p className="mt-2 text-sm text-mute">{a.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* PEÇAS / CATÁLOGO */}
      <Section
        eyebrow="Peças produzidas"
        title="Algumas peças que já saíram das nossas impressoras"
        intro={featured.length ? undefined : "Explore as categorias do nosso catálogo."}
      >
        {featured.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link key={c.id} href={`/catalogo/${c.slug}`} className="card bedgrid p-6 transition hover:border-orange/60">
                <h3 className="font-display text-lg font-bold text-white">{c.name}</h3>
                {c.description && <p className="mt-2 text-sm text-mute">{c.description}</p>}
              </Link>
            ))}
          </div>
        )}
        <div className="mt-8">
          <Link href="/catalogo" className="btn btn-ghost">Ver catálogo completo</Link>
        </div>
      </Section>

      {/* EMPRESAS + ENTREGA */}
      <section className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-2">
        <div className="card p-8 sm:p-10">
          <p className="tag mb-3">Para empresas</p>
          <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Produção em grandes quantidades</h2>
          <p className="mt-3 text-mute">
            Prototipagem, peças de substituição para manutenção industrial e séries de produção. Trabalhamos com
            empresas de todo o país.
          </p>
          <Link href="/empresas" className="btn btn-ghost mt-6">Soluções para empresas</Link>
        </div>
        <div className="card relative overflow-hidden p-8 sm:p-10">
          <PortugalMark />
          <p className="tag mb-3">Entrega</p>
          <h2 className="max-w-sm font-display text-2xl font-extrabold text-white sm:text-3xl">
            Estamos em {company.city} e entregamos gratuitamente em Portugal continental.
          </h2>
          <Link href="/entrega" className="btn btn-ghost mt-6">Saber mais</Link>
        </div>
      </section>

      {/* CTA FINAL */}
      <Section eyebrow="Contacto" title="Tem uma peça em mente?" intro="Envie-nos uma mensagem — respondemos pelo WhatsApp.">
        <div className="flex flex-col gap-3 sm:flex-row">
          <WhatsAppCta text="Olá Alvo Print 3D! Gostaria de saber mais sobre os vossos serviços." className="text-base" />
          <Link href="/orcamento" className="btn btn-primary text-base">Solicitar orçamento</Link>
        </div>
      </Section>
    </>
  );
}

function PortugalMark() {
  // Silhueta estilizada de Portugal continental com Évora assinalada
  return (
    <svg viewBox="0 0 100 200" className="pointer-events-none absolute -right-2 top-4 h-[115%] opacity-90" aria-hidden>
      <path
        d="M38 6 L62 4 L70 14 L66 30 L72 44 L64 58 L70 76 L66 96 L72 118 L68 142 L74 160 L66 178 L44 184 L34 176 L38 158 L30 140 L34 118 L26 98 L32 78 L24 58 L30 38 L26 20 Z"
        fill="none"
        stroke="#2c3037"
        strokeWidth="1.5"
      />
      <circle cx="58" cy="128" r="3.5" fill="#ff6b0b" />
      <circle cx="58" cy="128" r="8" fill="none" stroke="#ff6b0b" strokeWidth="1">
        <animate attributeName="r" values="4;14;4" dur="2.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0;1" dur="2.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
