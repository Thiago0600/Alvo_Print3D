"use client";
import { useEffect, useState } from "react";
import { api, fmtDate } from "./api";
import { PRODUCTION_LABEL, waLink } from "@/lib/whatsapp";

type Quote = {
  id: string; created_at: string; kind: string; status: string; name: string; phone: string; company: string;
  piece_type: string; dimensions: string; material: string; color: string; quantity: string; deadline: string;
  production_type: string; description: string; reference_urls: string[]; whatsapp_text: string;
  generations: { id: string; thumbnail_url: string | null; files: Record<string, string>; image_url: string | null } | null;
  products: { name: string; slug: string } | null;
};

const KIND: Record<string, string> = { orcamento: "Orçamento", empresa: "Empresa", produto: "Produto", peca3d: "Peça 3D (IA)" };
const STATUS: Record<string, string> = { novo: "Novo", em_contacto: "Em contacto", concluido: "Concluído", arquivado: "Arquivado" };

export function QuotesPanel() {
  const [items, setItems] = useState<Quote[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState("ativos");
  const [open, setOpen] = useState<string | null>(null);

  const load = () => api<Quote[]>("/api/admin/quotes").then(setItems).catch((e) => setErr(e.message));
  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: string) {
    await api("/api/admin/quotes", "PATCH", { id, status });
    setItems((xs) => xs?.map((q) => (q.id === id ? { ...q, status } : q)) || null);
  }
  async function remove(id: string) {
    if (!confirm("Apagar este pedido?")) return;
    await api(`/api/admin/quotes?id=${id}`, "DELETE");
    setItems((xs) => xs?.filter((q) => q.id !== id) || null);
  }

  if (err) return <p className="text-red-300">{err}</p>;
  if (!items) return <p className="text-mute">A carregar…</p>;
  const shown = items.filter((q) => (filter === "ativos" ? q.status !== "arquivado" && q.status !== "concluido" : filter === "todos" ? true : q.status === filter));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-white">Pedidos registados <span className="text-mute">({shown.length})</span></h1>
        <select className="field !w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="ativos">Ativos</option>
          <option value="todos">Todos</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      {shown.length === 0 && <p className="card p-6 text-mute">Sem pedidos.</p>}
      <ul className="space-y-3">
        {shown.map((q) => (
          <li key={q.id} className="card p-4">
            <div className="flex flex-wrap items-center gap-3">
              {q.generations?.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={q.generations.thumbnail_url} alt="" className="h-14 w-14 rounded-lg border border-line object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">
                  {q.name} {q.company && <span className="text-mute">· {q.company}</span>}
                </p>
                <p className="text-xs text-mute">
                  {fmtDate(q.created_at)} · <span className="text-orange">{KIND[q.kind] || q.kind}</span>
                  {q.production_type && ` · ${PRODUCTION_LABEL[q.production_type] || q.production_type}`}
                  {q.products && ` · ${q.products.name}`}
                </p>
              </div>
              <select className="field !w-auto !py-1.5 text-sm" value={q.status} onChange={(e) => setStatus(q.id, e.target.value)}>
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <button className="btn btn-ghost !py-1.5 text-sm" onClick={() => setOpen(open === q.id ? null : q.id)}>
                {open === q.id ? "Fechar" : "Detalhes"}
              </button>
            </div>
            {open === q.id && (
              <div className="mt-4 grid gap-4 border-t border-line pt-4 md:grid-cols-2">
                <pre className="whitespace-pre-wrap rounded-lg bg-graphite p-3 font-sans text-sm text-soft">{q.whatsapp_text || q.description}</pre>
                <div className="space-y-3 text-sm">
                  {q.generations && (
                    <div className="space-y-1">
                      <a className="text-orange underline" href={`/modelo/${q.generations.id}`} target="_blank">Ver modelo 3D</a>
                      {Object.entries(q.generations.files || {}).map(([f, u]) => (
                        <a key={f} href={u} className="block text-soft underline" target="_blank">Descarregar {f.toUpperCase()}</a>
                      ))}
                      {q.generations.image_url && <a href={q.generations.image_url} target="_blank" className="block text-soft underline">Fotografia original</a>}
                    </div>
                  )}
                  {q.reference_urls?.map((u, i) => (
                    <a key={u} href={u} target="_blank" className="block text-soft underline">Ficheiro de referência {i + 1}</a>
                  ))}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {q.phone && (
                      <a className="btn btn-wa !py-1.5 text-sm" target="_blank" href={waLink(q.phone.replace(/\D/g, "").replace(/^(9\d{8})$/, "351$1"))}>
                        Responder no WhatsApp
                      </a>
                    )}
                    <button className="btn btn-ghost !py-1.5 text-sm" onClick={() => remove(q.id)}>Apagar</button>
                  </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
