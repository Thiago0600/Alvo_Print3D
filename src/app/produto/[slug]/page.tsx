import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/catalog";
import { formatPrice } from "@/lib/types";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductOrder } from "@/components/ProductOrder";
import { SITE_URL } from "@/lib/site";

export const revalidate = 120;
type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: (p.description || `${p.name} — impressão 3D pela Alvo Print 3D.`).slice(0, 160),
    alternates: { canonical: `/produto/${p.slug}` },
    openGraph: { images: p.images[0] ? [{ url: p.images[0] }] : undefined },
  };
}

export default async function ProdutoPage({ params }: P) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();
  const price = formatPrice(p.price);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description || undefined,
    image: p.images,
    material: p.material || undefined,
    brand: { "@type": "Brand", name: "Alvo Print 3D" },
    ...(p.price != null && {
      offers: {
        "@type": "Offer",
        priceCurrency: "EUR",
        price: Number(p.price).toFixed(2),
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/produto/${p.slug}`,
      },
    }),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="mb-6 text-sm text-mute" aria-label="Navegação estrutural">
        <Link href="/catalogo" className="hover:text-white">Catálogo</Link>
        {p.categories && (
          <>
            {" / "}
            <Link href={`/catalogo/${p.categories.slug}`} className="hover:text-white">{p.categories.name}</Link>
          </>
        )}
      </nav>
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={p.images} name={p.name} />
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">{p.name}</h1>
          <p className={`mt-3 ${price ? "text-2xl font-bold text-white" : "text-lg font-semibold text-orange"}`}>
            {price || "Solicitar orçamento"}
          </p>
          {p.description && <p className="mt-5 whitespace-pre-line text-soft">{p.description}</p>}
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {p.material && (
              <div className="card p-4"><dt className="tag">Material</dt><dd className="mt-1 text-white">{p.material}</dd></div>
            )}
            {p.dimensions && (
              <div className="card p-4"><dt className="tag">Dimensões</dt><dd className="mt-1 text-white">{p.dimensions}</dd></div>
            )}
          </dl>
          {p.features.length > 0 && (
            <ul className="mt-6 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex gap-3 text-soft"><span className="text-orange">▸</span>{f}</li>
              ))}
            </ul>
          )}
          <ProductOrder product={{ id: p.id, name: p.name, slug: p.slug }} />
          <p className="mt-4 text-sm text-mute">Entrega gratuita em Portugal continental.</p>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
