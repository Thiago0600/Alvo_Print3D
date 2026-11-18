import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase-server";
import { jsonError, str } from "@/lib/admin-guard";

export const runtime = "nodejs";

// Regista um pedido (orçamento, encomenda de peça 3D, empresa, produto) para
// consulta no painel. O envio ao cliente acontece pelo WhatsApp no navegador;
// se este registo falhar, a conversa no WhatsApp continua a funcionar.
const KINDS = new Set(["orcamento", "empresa", "produto", "peca3d"]);

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ ok: false, stored: false });
  const b = await req.json().catch(() => ({}));
  const kind = str(b.kind, 20);
  if (!KINDS.has(kind)) return jsonError("Tipo inválido.");

  const uuid = (v: unknown) => (typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v) ? v : null);
  const refs = Array.isArray(b.referenceUrls)
    ? b.referenceUrls.filter((u: unknown) => typeof u === "string" && u.startsWith("https://")).slice(0, 5)
    : [];

  const row = {
    kind,
    name: str(b.name, 120),
    phone: str(b.phone, 40),
    company: str(b.company, 160),
    piece_type: str(b.pieceType, 200),
    dimensions: str(b.dimensions, 200),
    material: str(b.material, 80),
    color: str(b.color, 80),
    quantity: str(b.quantity, 40),
    deadline: str(b.deadline, 80),
    production_type: str(b.productionType, 40),
    description: str(b.description, 3000),
    reference_urls: refs,
    generation_id: uuid(b.generationId),
    product_id: uuid(b.productId),
    whatsapp_text: str(b.whatsappText, 6000),
  };
  if (!row.name) return jsonError("Indique o nome.");

  const db = supabaseAdmin();
  const { error } = await db.from("quote_requests").insert(row);
  if (error) {
    console.error("[requests]", error);
    return NextResponse.json({ ok: false, stored: false });
  }
  if (row.generation_id) {
    await db
      .from("generations")
      .update({ approved: true, order_requested_at: new Date().toISOString() })
      .eq("id", row.generation_id);
  }
  return NextResponse.json({ ok: true, stored: true });
}
