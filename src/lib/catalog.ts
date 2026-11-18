import "server-only";
import { isSupabaseConfigured, supabaseAdmin } from "./supabase-server";
import type { Category, Product } from "./types";

const SELECT = "*, categories(slug,name)";

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabaseAdmin().from("categories").select("*").order("sort_order");
  return (data as Category[]) || [];
}

export async function getProducts(opts: { categoryId?: string; featured?: boolean; limit?: number } = {}) {
  if (!isSupabaseConfigured()) return [] as Product[];
  let q = supabaseAdmin().from("products").select(SELECT).eq("published", true);
  if (opts.categoryId) q = q.eq("category_id", opts.categoryId);
  if (opts.featured) q = q.eq("featured", true);
  q = q.order("sort_order").order("created_at", { ascending: false });
  if (opts.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return (data as Product[]) || [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabaseAdmin().from("products").select(SELECT).eq("slug", slug).eq("published", true).maybeSingle();
  return (data as Product) || null;
}
