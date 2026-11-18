import "server-only";

// Integração oficial Meshy AI — Image to 3D
// Documentação: https://docs.meshy.ai/api/image-to-3d
//   POST https://api.meshy.ai/openapi/v1/image-to-3d        → { result: "<task id>" }
//   GET  https://api.meshy.ai/openapi/v1/image-to-3d/:id    → objeto da tarefa
//   GET  https://api.meshy.ai/openapi/v1/balance            → créditos disponíveis
// Autenticação: header "Authorization: Bearer <MESHY_API_KEY>"
// Os ficheiros gerados ficam na Meshy apenas ~3 dias (asset retention) —
// por isso o site guarda uma cópia própria no Supabase Storage.

import type { MeshySettings } from "./site";

const BASE = "https://api.meshy.ai/openapi/v1";

export type MeshyStatus = "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED" | "CANCELED";

export type MeshyTask = {
  id: string;
  type?: string;
  status: MeshyStatus;
  progress: number;
  model_urls?: Partial<Record<"glb" | "fbx" | "obj" | "usdz" | "mtl" | "stl" | "3mf" | "pre_remeshed_glb", string>>;
  thumbnail_url?: string;
  texture_urls?: Array<Record<string, string>>;
  created_at?: number;
  started_at?: number;
  finished_at?: number;
  expires_at?: number;
  preceding_tasks?: number;
  task_error?: { message?: string } | null;
  consumed_credits?: number;
};

export class MeshyError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function isMeshyConfigured() {
  return Boolean(process.env.MESHY_API_KEY);
}

function headers() {
  return {
    Authorization: `Bearer ${process.env.MESHY_API_KEY}`,
    "Content-Type": "application/json",
  };
}

const FRIENDLY: Record<number, string> = {
  400: "A imagem não pôde ser processada. Experimente outra fotografia (JPG, PNG ou WebP, com a peça bem visível).",
  401: "A integração com a IA não está corretamente configurada. Contacte-nos pelo WhatsApp.",
  402: "O serviço de criação 3D está temporariamente indisponível. Contacte-nos pelo WhatsApp.",
  403: "A imagem foi bloqueada pelo filtro de conteúdo. Utilize outra fotografia.",
  404: "Tarefa não encontrada.",
  429: "Muitos pedidos neste momento. Aguarde um minuto e tente novamente.",
};

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  if (!isMeshyConfigured()) throw new MeshyError(503, "Integração Meshy não configurada (MESHY_API_KEY em falta).");
  const res = await fetch(`${BASE}${path}`, { ...init, headers: headers(), cache: "no-store" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[meshy] ${init?.method || "GET"} ${path} → ${res.status} ${body.slice(0, 300)}`);
    throw new MeshyError(res.status, FRIENDLY[res.status] || "Erro no serviço de criação 3D. Tente novamente.");
  }
  return (await res.json()) as T;
}

export async function createImageTo3D(imageUrl: string, s: MeshySettings): Promise<string> {
  const target_formats = Array.from(new Set(["glb", ...s.archive_formats]));
  const body: Record<string, unknown> = {
    image_url: imageUrl,
    ai_model: s.ai_model,
    should_texture: s.should_texture,
    should_remesh: s.should_remesh,
    moderation: s.moderation,
    target_formats,
  };
  if (s.should_texture && s.enable_pbr) body.enable_pbr = true;
  if (s.should_remesh) body.target_polycount = Math.max(100, Math.min(300000, Math.round(s.target_polycount)));

  const data = await call<{ result: string }>("/image-to-3d", { method: "POST", body: JSON.stringify(body) });
  if (!data?.result) throw new MeshyError(500, "Resposta inesperada do serviço de criação 3D.");
  return data.result;
}

export function getImageTo3DTask(id: string) {
  return call<MeshyTask>(`/image-to-3d/${encodeURIComponent(id)}`);
}

export function getBalance() {
  return call<{ balance: number; monthly_credits: number; permanent_credits: number; monthly_resets_at: number | null }>(
    "/balance",
  );
}
