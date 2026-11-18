import "server-only";
import { cache } from "react";
import { isSupabaseConfigured, supabaseAdmin } from "./supabase-server";
import { DEFAULT_COMPANY, DEFAULT_MESHY, type CompanySettings, type MeshySettings } from "./site";

async function readSetting<T extends object>(key: string, fallback: T): Promise<T> {
  if (!isSupabaseConfigured()) return fallback;
  try {
    const { data } = await supabaseAdmin().from("settings").select("value").eq("key", key).maybeSingle();
    return { ...fallback, ...((data?.value as Partial<T>) || {}) };
  } catch {
    return fallback;
  }
}

export const getCompany = cache(() => readSetting<CompanySettings>("company", DEFAULT_COMPANY));
export const getMeshySettings = () => readSetting<MeshySettings>("meshy", DEFAULT_MESHY);

export async function writeSetting(key: string, value: unknown) {
  const { error } = await supabaseAdmin()
    .from("settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}
