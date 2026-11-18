import { NextResponse } from "next/server";
import { BUCKET, supabaseAdmin } from "@/lib/supabase-server";
import { jsonError, requireAdmin } from "@/lib/admin-guard";
import { productPayload, revalidateCatalog } from "@/lib/products-admin";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };

function storagePath(url: string) {
  const m = url.match(/\/storage\/v1\/object\/public\/media\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

export async function PUT(req: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  const p = productPayload(await req.json());
  if (!p.name || !p.slug) return jsonError("O nome é obrigatório.");
  const db = supabaseAdmin();
  const { data: old } = await db.from("products").select("images, slug").eq("id", id).maybeSingle();
  const { data, error } = await db.from("products").update(p).eq("id", id).select("*").single();
  if (error) return jsonError(error.code === "23505" ? "Já existe um produto com esse endereço (slug)." : error.message);
  // Remove do armazenamento as fotografias que deixaram de ser usadas
  const removed = ((old?.images as string[]) || []).filter((u) => !p.images.includes(u)).map(storagePath).filter(Boolean) as string[];
  if (removed.length) await db.storage.from(BUCKET).remove(removed);
  revalidateCatalog(p.slug);
  if (old?.slug && old.slug !== p.slug) revalidateCatalog(old.slug);
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  const db = supabaseAdmin();
  const { data: old } = await db.from("products").select("images, slug").eq("id", id).maybeSingle();
  const { error } = await db.from("products").delete().eq("id", id);
  if (error) return jsonError(error.message, 500);
  const paths = ((old?.images as string[]) || []).map(storagePath).filter(Boolean) as string[];
  if (paths.length) await db.storage.from(BUCKET).remove(paths);
  revalidateCatalog(old?.slug);
  return NextResponse.json({ ok: true });
}
