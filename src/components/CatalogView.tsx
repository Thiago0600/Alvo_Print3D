import Link from "next/link";
import { getCategories, getProducts } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";
import { PageHero } from "./Section";

export async function CatalogView({ slug }: { slug?: string }) {
  const categories = await getCategories();
  const current = slug ? categories.find((c) => c.slug === slug) : undefined;
  const products = await getProducts({ categoryId: current?.id });

  return (
    <>
      <PageHero
        eyebrow="Catálogo"
        title={current ? current.name : "Peças impressas em 3D"}
        intro={current?.description || "Peças que já produzimos. Todas podem ser adaptadas em medida, material e cor."}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <nav className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-2" aria-label="Categorias">
          <Link href="/catalogo" className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${!current ? "border-orange bg-orange text-ink" : "border-line hover:border-orange"}`}>
            Todas
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/catalogo/${c.slug}`}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${current?.id === c.id ? "border-orange bg-orange text-ink" : "border-line hover:border-orange"}`}
            >
              {c.name}
            </Link>
          ))}
        </nav>

        {products.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        ) : (
          <div className="card bedgrid p-10 text-center">
            <h2 className="font-display text-xl font-bold text-white">Catálogo em atualização</h2>
            <p className="mx-auto mt-2 max-w-md text-mute">
              Estamos a fotografar as nossas peças. Procura algo específico? Crie a sua com IA ou peça um orçamento.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/criar-3d" className="btn btn-primary">Criar com IA</Link>
              <Link href="/orcamento" className="btn btn-ghost">Solicitar orçamento</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
