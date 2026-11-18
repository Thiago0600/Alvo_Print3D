import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-server";
import { jsonError, requireAdmin, slugify, str } from "@/lib/admin-guard";

export const runtime = "nodejs";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { data } = await supabaseAdmin().from("categories").select("*").order("sort_order");
  return NextResponse.json(data || []);
}

/** Cria (sem id) ou atualiza (com id) uma categoria. */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const b = await req.json();
  const row = {
    name: str(b.name, 80),
    slug: slugify(str(b.slug, 80) || str(b.name, 80)),
    description: str(b.description, 300) || null,
    sort_order: Number(b.sort_order) || 0,
  };
  if (!row.name) return jsonError("O nome é obrigatório.");
  const db = supabaseAdmin();
  const q = b.id ? db.from("categories").update(row).eq("id", b.id) : db.from("categories").insert(row);
  const { error } = await q;
  if (error) return jsonError(error.code === "23505" ? "Já existe uma categoria com esse endereço." : error.message);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return jsonError("Falta o id.");
  const { error } = await supabaseAdmin().from("categories").delete().eq("id", id);
  if (error) return jsonError(error.message, 500);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
