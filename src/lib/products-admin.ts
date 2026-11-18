import "server-only";
import { revalidatePath } from "next/cache";
import { slugify, str } from "./admin-guard";

export function productPayload(b: Record<string, unknown>) {
  const priceRaw = b.price;
  const price =
    priceRaw === null || priceRaw === undefined || priceRaw === ""
      ? null
      : Number(String(priceRaw).replace(",", "."));
  return {
    name: str(b.name, 160),
    slug: slugify(str(b.slug, 100) || str(b.name, 100)),
    category_id: typeof b.category_id === "string" && b.category_id ? b.category_id : null,
    description: str(b.description, 5000) || null,
    features: Array.isArray(b.features) ? b.features.map((x) => str(x, 200)).filter(Boolean).slice(0, 20) : [],
    material: str(b.material, 120) || null,
    dimensions: str(b.dimensions, 120) || null,
    price: price !== null && Number.isFinite(price) && price >= 0 ? price : null,
    images: Array.isArray(b.images) ? b.images.filter((x): x is string => typeof x === "string" && x.startsWith("https://")).slice(0, 12) : [],
    published: b.published !== false,
    featured: b.featured === true,
    sort_order: Number(b.sort_order) || 0,
    updated_at: new Date().toISOString(),
  };
}

export function revalidateCatalog(slug?: string) {
  revalidatePath("/");
  revalidatePath("/catalogo", "layout");
  if (slug) revalidatePath(`/produto/${slug}`);
  revalidatePath("/sitemap.xml");
}
