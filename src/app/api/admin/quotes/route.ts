import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { jsonError, requireAdmin, str } from "@/lib/admin-guard";

export const runtime = "nodejs";
const STATUSES = new Set(["novo", "em_contacto", "concluido", "arquivado"]);

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { data, error } = await supabaseAdmin()
    .from("quote_requests")
    .select("*, generations(id, thumbnail_url, files, image_url), products(name, slug)")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) return jsonError(error.message, 500);
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const b = await req.json();
  const status = str(b.status, 20);
  if (!b.id || !STATUSES.has(status)) return jsonError("Dados inválidos.");
  const { error } = await supabaseAdmin().from("quote_requests").update({ status }).eq("id", b.id);
  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return jsonError("Falta o id.");
  const { error } = await supabaseAdmin().from("quote_requests").delete().eq("id", id);
  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ ok: true });
}
