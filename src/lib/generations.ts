import "server-only";
import { BUCKET, publicUrl, supabaseAdmin } from "./supabase-server";
import { getImageTo3DTask, type MeshyTask } from "./meshy";
import { getMeshySettings } from "./settings";
import type { PublicGeneration } from "./types";

const TERMINAL = new Set(["SUCCEEDED", "FAILED", "CANCELED"]);

const MIME: Record<string, string> = {
  glb: "model/gltf-binary",
  stl: "model/stl",
  obj: "model/obj",
  fbx: "application/octet-stream",
  usdz: "model/vnd.usdz+zip",
  "3mf": "model/3mf",
  thumbnail: "image/png",
};

type Row = {
  id: string;
  status: string;
  progress: number;
  task_error: string | null;
  meshy_task_id: string | null;
  meshy_model_urls: Record<string, string> | null;
  meshy_thumbnail: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  files: Record<string, string> | null;
  archived: boolean;
  created_at: string;
};

export function toPublic(r: Row): PublicGeneration {
  return {
    id: r.id,
    status: r.status,
    progress: r.progress,
    error: r.task_error,
    imageUrl: r.image_url,
    thumbnailUrl: r.thumbnail_url,
    files: r.files || {},
    archived: r.archived,
    createdAt: r.created_at,
  };
}

export async function getGenerationRow(id: string): Promise<Row | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await supabaseAdmin().from("generations").select("*").eq("id", id).maybeSingle();
  return (data as Row) || null;
}

/** Copia UM ficheiro da Meshy para o armazenamento próprio (rápido, cabe no limite de tempo das funções). */
async function archiveOne(row: Row, key: string, sourceUrl: string): Promise<string> {
  const res = await fetch(sourceUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`download ${key} falhou (${res.status})`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const ext = key === "thumbnail" ? "png" : key;
  const path = `models/${row.id}/${key === "thumbnail" ? "preview" : "modelo"}.${ext}`;
  const { error } = await supabaseAdmin()
    .storage.from(BUCKET)
    .upload(path, buf, { contentType: MIME[key] || "application/octet-stream", upsert: true });
  if (error) throw error;
  return publicUrl(path);
}

/**
 * Atualiza a geração a partir da Meshy e, quando concluída, arquiva os
 * ficheiros um a um (miniatura → GLB → restantes formatos).
 */
export async function refreshGeneration(row: Row): Promise<Row> {
  const db = supabaseAdmin();
  let r = row;

  if (!TERMINAL.has(r.status) && r.meshy_task_id) {
    const t: MeshyTask = await getImageTo3DTask(r.meshy_task_id);
    const patch: Record<string, unknown> = {
      status: t.status,
      progress: Math.max(0, Math.min(100, Number(t.progress) || 0)),
      updated_at: new Date().toISOString(),
    };
    if (t.status === "SUCCEEDED") {
      patch.meshy_model_urls = t.model_urls || {};
      patch.meshy_thumbnail = t.thumbnail_url || null;
      patch.meshy_expires_at = t.expires_at || null;
      patch.consumed_credits = t.consumed_credits ?? null;
      patch.progress = 100;
    }
    if (t.status === "FAILED" || t.status === "CANCELED") {
      patch.task_error = t.task_error?.message || "A geração não foi concluída. Experimente outra fotografia.";
    }
    const { data } = await db.from("generations").update(patch).eq("id", r.id).select("*").single();
    r = (data as Row) || r;
  }

  if (r.status === "SUCCEEDED" && !r.archived) {
    const settings = await getMeshySettings();
    const wanted = ["thumbnail", "glb", ...settings.archive_formats.filter((f) => f !== "glb")];
    const files = { ...(r.files || {}) };
    let thumbnailUrl = r.thumbnail_url;
    const src = r.meshy_model_urls || {};

    const next = wanted.find((k) =>
      k === "thumbnail" ? !thumbnailUrl && r.meshy_thumbnail : !files[k] && src[k],
    );
    if (next) {
      try {
        const url = await archiveOne(r, next, next === "thumbnail" ? r.meshy_thumbnail! : src[next]);
        if (next === "thumbnail") thumbnailUrl = url;
        else files[next] = url;
      } catch (e) {
        console.error("[archive]", next, e);
        // Se falhar, tenta novamente na próxima consulta.
      }
    }
    const remaining = wanted.filter((k) =>
      k === "thumbnail" ? !thumbnailUrl && r.meshy_thumbnail : !files[k] && src[k],
    );
    const { data } = await db
      .from("generations")
      .update({ files, thumbnail_url: thumbnailUrl, archived: remaining.length === 0, updated_at: new Date().toISOString() })
      .eq("id", r.id)
      .select("*")
      .single();
    r = (data as Row) || r;
  }
  return r;
}
