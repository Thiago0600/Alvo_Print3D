import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const fixed = ["", "/criar-3d", "/catalogo", "/orcamento", "/empresas", "/entrega", "/privacidade"].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : p === "/criar-3d" ? 0.9 : 0.7,
  }));
  const [cats, products] = await Promise.all([getCategories(), getProducts()]);
  return [
    ...fixed,
    ...cats.map((c) => ({ url: `${SITE_URL}/catalogo/${c.slug}`, lastModified: now, priority: 0.6 })),
    ...products.map((p) => ({ url: `${SITE_URL}/produto/${p.slug}`, lastModified: new Date(p.created_at), priority: 0.6 })),
  ];
}
