import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCompany, getMeshySettings, writeSetting } from "@/lib/settings";
import { jsonError, requireAdmin, str } from "@/lib/admin-guard";
import { getBalance, isMeshyConfigured } from "@/lib/meshy";
import { turnstileEnabled } from "@/lib/turnstile";
import { DEFAULT_MESHY, type MeshySettings } from "@/lib/site";

export const runtime = "nodejs";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const [company, meshy] = await Promise.all([getCompany(), getMeshySettings()]);
  let balance: unknown = null;
  let balanceError: string | null = null;
  if (isMeshyConfigured()) {
    try {
      balance = await getBalance();
    } catch (e) {
      balanceError = (e as Error).message;
    }
  }
  return NextResponse.json({
    company,
    meshy,
    status: {
      meshyKey: isMeshyConfigured(),
      supabase: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      turnstile: turnstileEnabled(),
      assistantLlm: Boolean(process.env.ASSISTANT_ANTHROPIC_API_KEY),
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || null,
    },
    balance,
    balanceError,
  });
}

const MODELS = new Set(["latest", "meshy-7.1", "meshy-6", "meshy-6-lite"]);
const FORMATS = new Set(["glb", "stl", "obj", "fbx", "usdz", "3mf"]);

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const b = await req.json();

  if (b.company) {
    const c = b.company;
    const whatsapp = str(c.whatsapp, 20).replace(/\D/g, "");
    if (whatsapp.length < 9) return jsonError("Número de WhatsApp inválido (use o indicativo, ex.: 351966381796).");
    await writeSetting("company", {
      name: str(c.name, 80) || "Alvo Print 3D",
      whatsapp,
      city: str(c.city, 60),
      region: str(c.region, 120),
      email: str(c.email, 120),
      instagram: str(c.instagram, 200),
      facebook: str(c.facebook, 200),
      islandsNote: str(c.islandsNote, 400),
      hours: str(c.hours, 200),
    });
    revalidatePath("/", "layout");
  }

  if (b.meshy) {
    const m = b.meshy as Partial<MeshySettings>;
    const clean: MeshySettings = {
      enabled: m.enabled !== false,
      ai_model: MODELS.has(String(m.ai_model)) ? (m.ai_model as MeshySettings["ai_model"]) : DEFAULT_MESHY.ai_model,
      should_texture: m.should_texture !== false,
      enable_pbr: m.enable_pbr === true,
      should_remesh: m.should_remesh !== false,
      target_polycount: Math.max(100, Math.min(300000, Number(m.target_polycount) || DEFAULT_MESHY.target_polycount)),
      moderation: m.moderation !== false,
      archive_formats: Array.from(new Set(["glb", ...((m.archive_formats || []) as string[]).filter((f) => FORMATS.has(f))])) as MeshySettings["archive_formats"],
      ip_daily_limit: Math.max(0, Math.min(100, Number(m.ip_daily_limit) || 0)),
      global_daily_limit: Math.max(0, Math.min(5000, Number(m.global_daily_limit) || 0)),
    };
    await writeSetting("meshy", clean);
    revalidatePath("/criar-3d");
  }
  return NextResponse.json({ ok: true });
}
