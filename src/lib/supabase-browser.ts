"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Cliente público (chave anon) — usado apenas para enviar ficheiros com URLs assinadas pelo servidor. */
export function supabaseBrowser(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("Armazenamento não configurado.");
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

/**
 * Reduz fotografias grandes antes do envio (máx. 2048 px, JPEG), poupando
 * espaço de armazenamento e acelerando a geração.
 */
export async function prepareImage(file: File, maxSide = 2048): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 3 * 1024 * 1024) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.9));
    return blob || file;
  } catch {
    return file;
  }
}

export type UploadKind = "generation" | "quote" | "catalog";

/** Pede ao servidor uma URL assinada e envia o ficheiro diretamente para o armazenamento. */
export async function uploadFile(
  file: Blob,
  kind: UploadKind,
  filename = "ficheiro",
): Promise<{ path: string; publicUrl: string }> {
  const contentType = file.type || "application/octet-stream";
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, contentType, size: file.size, filename }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Não foi possível preparar o envio do ficheiro.");
  const { error } = await supabaseBrowser()
    .storage.from("media")
    .uploadToSignedUrl(data.path, data.token, file, { contentType });
  if (error) throw new Error("Falha no envio do ficheiro. Tente novamente.");
  return { path: data.path, publicUrl: data.publicUrl };
}
