import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase-server";
import { getGenerationRow, refreshGeneration, toPublic } from "@/lib/generations";
import { jsonError } from "@/lib/admin-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) return jsonError("Serviço não configurado.", 503);
  const { id } = await ctx.params;
  const row = await getGenerationRow(id);
  if (!row) return jsonError("Criação não encontrada.", 404);
  try {
    const updated = await refreshGeneration(row);
    return NextResponse.json(toPublic(updated), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[status]", e);
    // devolve o último estado conhecido; o cliente volta a tentar
    return NextResponse.json({ ...toPublic(row), transientError: true }, { headers: { "Cache-Control": "no-store" } });
  }
}
