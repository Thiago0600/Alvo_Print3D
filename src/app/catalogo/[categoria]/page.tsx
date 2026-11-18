import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/CatalogView";
import { getCategories } from "@/lib/catalog";

export const revalidate = 120;

type P = { params: Promise<{ categoria: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { categoria } = await params;
  const cat = (await getCategories()).find((c) => c.slug === categoria);
  if (!cat) return {};
  return {
    title: `Impressão 3D — ${cat.name}`,
    description: cat.description || `Peças impressas em 3D na categoria ${cat.name}.`,
    alternates: { canonical: `/catalogo/${cat.slug}` },
  };
}

export default async function CategoriaPage({ params }: P) {
  const { categoria } = await params;
  const cats = await getCategories();
  if (cats.length && !cats.some((c) => c.slug === categoria)) notFound();
  return <CatalogView slug={categoria} />;
}
