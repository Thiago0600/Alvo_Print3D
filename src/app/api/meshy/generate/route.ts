import { NextResponse } from "next/server";
import { isSupabaseConfigured, publicUrl, supabaseAdmin } from "@/lib/supabase-server";
import { createImageTo3D, isMeshyConfigured, MeshyError } from "@/lib/meshy";
import { getMeshySettings } from "@/lib/settings";
import { clientIp, hashIp } from "@/lib/auth";
import { jsonError, str } from "@/lib/admin-guard";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) return jsonError("O serviço ainda não está configurado.", 503);
  if (!isMeshyConfigured())
    return jsonError("A criação 3D com IA ainda não está ativa. Fale connosco pelo WhatsApp.", 503);

  const settings = await getMeshySettings();
  if (!settings.enabled)
    return jsonError("A criação 3D com IA está temporariamente em pausa. Fale connosco pelo WhatsApp.", 503);

  const body = await req.json().catch(() => ({}));
  const ip = clientIp(req);
  if (!(await verifyTurnstile(str(body.turnstileToken, 4000), ip)))
    return jsonError("Verificação de segurança falhou. Atualize a página e tente novamente.", 403);

  const db = supabaseAdmin();
  const parentId = str(body.parentId, 40) || null;
  let imagePath = str(body.imagePath, 300);
  let meta = {
    customer_name: str(body.name, 120),
    customer_phone: str(body.phone, 40),
    description: str(body.description, 1500),
    usage_type: str(body.usageType, 40),
  };

  // Nova geração a partir de uma anterior: reutiliza a fotografia e os dados.
  if (parentId) {
    const { data: parent } = await db.from("generations").select("*").eq("id", parentId).maybeSingle();
    if (!parent) return jsonError("Geração anterior não encontrada.", 404);
    imagePath = parent.image_path;
    meta = {
      customer_name: meta.customer_name || parent.customer_name,
      customer_phone: meta.customer_phone || parent.customer_phone,
      description: meta.description || parent.description,
      usage_type: meta.usage_type || parent.usage_type,
    };
  }

  if (!/^uploads\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(imagePath))
    return jsonError("Fotografia inválida. Carregue a imagem novamente.");
  if (!meta.customer_name) return jsonError("Indique o seu nome.");

  // Limites anti-abuso (protegem os créditos da Meshy)
  const ipHash = await hashIp(ip);
  const since = new Date(Date.now() - 86400000).toISOString();
  const [{ count: ipCount }, { count: totalCount }] = await Promise.all([
    db.from("generations").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since),
    db.from("generations").select("id", { count: "exact", head: true }).gte("created_at", since),
  ]);
  if ((ipCount || 0) >= settings.ip_daily_limit)
    return jsonError(
      "Atingiu o limite diário de criações gratuitas. Envie-nos a fotografia pelo WhatsApp e tratamos do modelo por si.",
      429,
    );
  if ((totalCount || 0) >= settings.global_daily_limit)
    return jsonError("Muitos pedidos hoje. Envie-nos a fotografia pelo WhatsApp e tratamos do modelo por si.", 429);

  const imageUrl = publicUrl(imagePath);

  let taskId: string;
  try {
    taskId = await createImageTo3D(imageUrl, settings);
  } catch (e) {
    const err = e as MeshyError;
    return jsonError(err.message || "Erro ao iniciar a criação 3D.", err.status && err.status < 500 ? 400 : 502);
  }

  const { data, error } = await db
    .from("generations")
    .insert({
      ...meta,
      parent_id: parentId,
      meshy_task_id: taskId,
      status: "PENDING",
      progress: 0,
      image_path: imagePath,
      image_url: imageUrl,
      ip_hash: ipHash,
    })
    .select("id")
    .single();
  if (error || !data) return jsonError("Erro ao registar a criação.", 500);

  return NextResponse.json({ id: data.id });
}
