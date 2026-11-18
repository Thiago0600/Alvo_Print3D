"use client";
import { useEffect, useState } from "react";
import { api } from "./api";
import type { CompanySettings, MeshySettings } from "@/lib/site";

type Resp = {
  company: CompanySettings;
  meshy: MeshySettings;
  status: { meshyKey: boolean; supabase: boolean; turnstile: boolean; assistantLlm: boolean; siteUrl: string | null };
  balance: { balance: number; monthly_credits: number; permanent_credits: number; monthly_resets_at: number | null } | null;
  balanceError: string | null;
};

const FORMATS = ["glb", "stl", "3mf", "obj", "fbx", "usdz"] as const;

function Dot({ ok }: { ok: boolean }) {
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${ok ? "bg-green-400" : "bg-red-400"}`} />;
}

export function SettingsPanel() {
  const [r, setR] = useState<Resp | null>(null);
  const [c, setC] = useState<CompanySettings | null>(null);
  const [m, setM] = useState<MeshySettings | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    api<Resp>("/api/admin/settings")
      .then((x) => {
        setR(x);
        setC(x.company);
        setM(x.meshy);
      })
      .catch((e) => setMsg(e.message));
  }, []);

  async function save(part: "company" | "meshy") {
    setMsg(null);
    try {
      await api("/api/admin/settings", "PUT", part === "company" ? { company: c } : { meshy: m });
      setMsg("Configurações guardadas.");
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  if (!r || !c || !m) return <p className="text-mute">{msg || "A carregar…"}</p>;
  const tf = (k: keyof CompanySettings, label: string, ph = "") => (
    <div>
      <label className="label">{label}</label>
      <input className="field" placeholder={ph} value={(c[k] as string) || ""} onChange={(e) => setC({ ...c, [k]: e.target.value })} />
    </div>
  );

  return (
    <div className="space-y-8">
      {msg && <p className="rounded-lg border border-line bg-panel p-3 text-sm text-soft">{msg}</p>}

      <section className="card p-6">
        <h2 className="font-display text-lg font-bold text-white">Estado das integrações</h2>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <li className="flex items-center gap-2"><Dot ok={r.status.supabase} /> Base de dados e armazenamento (Supabase)</li>
          <li className="flex items-center gap-2"><Dot ok={r.status.meshyKey} /> Chave API Meshy (MESHY_API_KEY)</li>
          <li className="flex items-center gap-2"><Dot ok={r.status.turnstile} /> Proteção anti-robôs (Turnstile) — recomendado</li>
          <li className="flex items-center gap-2"><Dot ok={r.status.assistantLlm} /> IA generativa no assistente — opcional, pago</li>
        </ul>
        <div className="mt-4 rounded-lg bg-graphite p-4 text-sm">
          {r.balance ? (
            <p>
              <b className="text-white">Créditos Meshy disponíveis: {r.balance.balance}</b>
              <span className="text-mute"> (mensais: {r.balance.monthly_credits} · permanentes: {r.balance.permanent_credits}
              {r.balance.monthly_resets_at ? ` · renovam a ${new Date(r.balance.monthly_resets_at).toLocaleDateString("pt-PT")}` : ""})</span>
            </p>
          ) : (
            <p className="text-mute">{r.balanceError || "Configure a MESHY_API_KEY para ver os créditos."}</p>
          )}
        </div>
        <p className="mt-3 text-xs text-mute">
          Por segurança, as chaves API não são editáveis aqui: definem-se nas variáveis de ambiente do alojamento (Netlify → Site configuration → Environment variables) e nunca ficam visíveis no site.
        </p>
      </section>

      <section className="card p-6">
        <h2 className="font-display text-lg font-bold text-white">Criação 3D (Meshy AI)</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" className="accent-[#ff6b0b]" checked={m.enabled} onChange={(e) => setM({ ...m, enabled: e.target.checked })} />
            <b className="text-white">Criação 3D ativa no site</b> (desative para pausar sem gastar créditos)
          </label>
          <div>
            <label className="label">Modelo de IA</label>
            <select className="field" value={m.ai_model} onChange={(e) => setM({ ...m, ai_model: e.target.value as MeshySettings["ai_model"] })}>
              <option value="latest">latest (mais recente)</option>
              <option value="meshy-7.1">meshy-7.1</option>
              <option value="meshy-6">meshy-6</option>
              <option value="meshy-6-lite">meshy-6-lite</option>
            </select>
          </div>
          <div>
            <label className="label">Polígonos alvo (com remesh) · 100–300 000</label>
            <input type="number" className="field" value={m.target_polycount} onChange={(e) => setM({ ...m, target_polycount: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">Limite diário por visitante</label>
            <input type="number" className="field" value={m.ip_daily_limit} onChange={(e) => setM({ ...m, ip_daily_limit: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">Limite diário total do site</label>
            <input type="number" className="field" value={m.global_daily_limit} onChange={(e) => setM({ ...m, global_daily_limit: Number(e.target.value) })} />
          </div>
          <div className="flex flex-wrap gap-5 text-sm md:col-span-2">
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-[#ff6b0b]" checked={m.should_texture} onChange={(e) => setM({ ...m, should_texture: e.target.checked })} /> Textura / cor</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-[#ff6b0b]" checked={m.enable_pbr} onChange={(e) => setM({ ...m, enable_pbr: e.target.checked })} /> Mapas PBR</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-[#ff6b0b]" checked={m.should_remesh} onChange={(e) => setM({ ...m, should_remesh: e.target.checked })} /> Remesh (malha otimizada)</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-[#ff6b0b]" checked={m.moderation} onChange={(e) => setM({ ...m, moderation: e.target.checked })} /> Moderação de conteúdo</label>
          </div>
          <div className="md:col-span-2">
            <p className="label">Formatos a gerar e guardar (GLB é obrigatório para o visualizador)</p>
            <div className="flex flex-wrap gap-4 text-sm">
              {FORMATS.map((f) => (
                <label key={f} className="flex items-center gap-2 font-mono uppercase">
                  <input
                    type="checkbox"
                    className="accent-[#ff6b0b]"
                    disabled={f === "glb"}
                    checked={f === "glb" || m.archive_formats.includes(f)}
                    onChange={(e) => setM({ ...m, archive_formats: e.target.checked ? [...m.archive_formats, f] : m.archive_formats.filter((x) => x !== f) })}
                  />
                  {f}
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-mute">Cada formato ocupa espaço no armazenamento gratuito (1 GB). GLB + STL é o recomendado para impressão.</p>
          </div>
        </div>
        <button className="btn btn-primary mt-5" onClick={() => save("meshy")}>Guardar configuração Meshy</button>
      </section>

      <section className="card p-6">
        <h2 className="font-display text-lg font-bold text-white">Informações da empresa</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {tf("name", "Nome")}
          {tf("whatsapp", "WhatsApp (com indicativo, só números)", "351966381796")}
          {tf("city", "Cidade")}
          {tf("region", "Região / localização")}
          {tf("email", "E-mail (opcional)")}
          {tf("hours", "Horário (opcional)")}
          {tf("instagram", "Instagram (URL)")}
          {tf("facebook", "Facebook (URL)")}
          <div className="md:col-span-2">
            <label className="label">Condições para Açores e Madeira</label>
            <textarea className="field" value={c.islandsNote} onChange={(e) => setC({ ...c, islandsNote: e.target.value })} />
          </div>
        </div>
        <button className="btn btn-primary mt-5" onClick={() => save("company")}>Guardar informações</button>
      </section>
    </div>
  );
}
