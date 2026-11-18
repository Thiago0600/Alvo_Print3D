export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category_id: string | null;
  description: string | null;
  features: string[];
  material: string | null;
  dimensions: string | null;
  price: number | null;
  images: string[];
  published: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
  categories?: { slug: string; name: string } | null;
};

/** Dados públicos de uma geração (sem dados pessoais). */
export type PublicGeneration = {
  id: string;
  status: string;
  progress: number;
  error: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  files: Record<string, string>;
  archived: boolean;
  createdAt: string;
};

/** Força o download com nome legível (parâmetro suportado pelo Supabase Storage). */
export function downloadUrl(url: string, name: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}download=${encodeURIComponent(name)}`;
}

export function formatPrice(p: number | null | undefined): string | null {
  if (p === null || p === undefined) return null;
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(Number(p));
}
