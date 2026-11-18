import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { jsonError, requireAdmin } from "@/lib/admin-guard";
import { productPayload, revalidateCatalog } from "@/lib/products-admin";

export const runtime = "nodejs";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { data, error } = await supabaseAdmin()
    .from("products")
    .select("*, categories(slug,name)")
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) return jsonError(error.message, 500);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const p = productPayload(await req.json());
  if (!p.name || !p.slug) return jsonError("O nome é obrigatório.");
  const { data, error } = await supabaseAdmin().from("products").insert(p).select("*").single();
  if (error) return jsonError(error.code === "23505" ? "Já existe um produto com esse endereço (slug)." : error.message);
  revalidateCatalog(p.slug);
  return NextResponse.json(data);
}
