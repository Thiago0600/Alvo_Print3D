import { NextResponse } from "next/server";
import { BUCKET, isSupabaseConfigured, publicUrl, supabaseAdmin } from "@/lib/supabase-server";
import { clientIp, hashIp } from "@/lib/auth";
import { isAdmin, jsonError, str } from "@/lib/admin-guard";

export const runtime = "nodejs";

const LIMITS = {
  generation: { max: 20 * 1024 * 1024, types: ["image/jpeg", "image/png", "image/webp"] },
  quote: {
    max: 25 * 1024 * 1024,
    types: [
      "image/jpeg", "image/png", "image/webp", "application/pdf",
      "model/stl", "model/3mf", "model/obj", "application/sla", "application/vnd.ms-pki.stl", "application/octet-stream",
    ],
  },
  catalog: { max: 10 * 1024 * 1024, types: ["image/jpeg", "image/png", "image/webp"] },
} as const;

const EXT: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf",
  "model/stl": "stl", "application/sla": "stl", "application/vnd.ms-pki.stl": "stl",
  "model/3mf": "3mf", "model/obj": "obj",
};

const DAILY_UPLOADS_PER_IP = 30;

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) return jsonError("Armazenamento ainda não configurado.", 503);
  const body = await req.json().catch(() => ({}));
  const kind = str(body.kind) as keyof typeof LIMITS;
  const contentType = str(body.contentType, 100);
  const size = Number(body.size) || 0;
  const filename = str(body.filename, 120);
  const rule = LIMITS[kind];
  if (!rule) return jsonError("Tipo de envio inválido.");
  if (kind === "catalog" && !(await isAdmin())) return jsonError("Não autorizado.", 401);
  if (!(rule.types as readonly string[]).includes(contentType)) return jsonError("Formato de ficheiro não suportado.");
  if (size <= 0 || size > rule.max) return jsonError(`Ficheiro demasiado grande (máx. ${Math.round(rule.max / 1048576)} MB).`);

  const db = supabaseAdmin();
  const ipHash = await hashIp(clientIp(req));
  if (kind !== "catalog") {
    const since = new Date(Date.now() - 86400000).toISOString();
    const { count } = await db
      .from("upload_log")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);
    if ((count || 0) >= DAILY_UPLOADS_PER_IP) return jsonError("Limite diário de envios atingido. Fale connosco pelo WhatsApp.", 429);
  }

  let ext = EXT[contentType];
  if (!ext) {
    const m = filename.toLowerCase().match(/\.(stl|3mf|obj|step|stp)$/);
    ext = m ? m[1] : "bin";
  }
  const folder = kind === "generation" ? "uploads" : kind === "quote" ? "referencias" : "catalogo";
  const d = new Date();
  const path = `${folder}/${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) return jsonError("Não foi possível preparar o envio.", 500);
  if (kind !== "catalog") await db.from("upload_log").insert({ ip_hash: ipHash, path });

  return NextResponse.json({ path, token: data.token, publicUrl: publicUrl(path) });
}
