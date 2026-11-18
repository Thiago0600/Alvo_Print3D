import { NextResponse } from "next/server";
import { BUCKET, supabaseAdmin } from "@/lib/supabase-server";
import { jsonError, requireAdmin } from "@/lib/admin-guard";

export const runtime = "nodejs";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { data, error } = await supabaseAdmin()
    .from("generations")
    .select("id, created_at, status, progress, task_error, customer_name, customer_phone, description, usage_type, image_url, thumbnail_url, files, archived, consumed_credits, approved, order_requested_at, parent_id, meshy_task_id")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) return jsonError(error.message, 500);
  return NextResponse.json(data);
}

/** Apaga a geração e os respetivos ficheiros (liberta espaço de armazenamento). */
export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id");
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return jsonError("id inválido.");
  const db = supabaseAdmin();
  const { data: g } = await db.from("generations").select("image_path").eq("id", id).maybeSingle();
  const { data: list } = await db.storage.from(BUCKET).list(`models/${id}`);
  const paths = (list || []).map((f) => `models/${id}/${f.name}`);
  // só apaga a fotografia se nenhuma outra geração a usar (regenerações partilham a foto)
  if (g?.image_path) {
    const { count } = await db.from("generations").select("id", { count: "exact", head: true }).eq("image_path", g.image_path);
    if ((count || 0) <= 1) paths.push(g.image_path);
  }
  if (paths.length) await db.storage.from(BUCKET).remove(paths);
  const { error } = await db.from("generations").delete().eq("id", id);
  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ ok: true });
}
