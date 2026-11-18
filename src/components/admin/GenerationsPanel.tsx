"use client";
import { useEffect, useState } from "react";
import { api, fmtDate } from "./api";

type Gen = {
  id: string; created_at: string; status: string; progress: number; task_error: string | null;
  customer_name: string; customer_phone: string; description: string; usage_type: string;
  image_url: string | null; thumbnail_url: string | null; files: Record<string, string>; archived: boolean;
  consumed_credits: number | null; approved: boolean; order_requested_at: string | null; parent_id: string | null;
};

const BADGE: Record<string, string> = {
  SUCCEEDED: "bg-green-500/15 text-green-300",
  FAILED: "bg-red-500/15 text-red-300",
  CANCELED: "bg-red-500/15 text-red-300",
  PENDING: "bg-yellow-500/15 text-yellow-200",
  IN_PROGRESS: "bg-yellow-500/15 text-yellow-200",
};

export function GenerationsPanel() {
  const [items, setItems] = useState<Gen[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [onlyOrders, setOnlyOrders] = useState(false);

  useEffect(() => {
    api<Gen[]>("/api/admin/generations").then(setItems).catch((e) => setErr(e.message));
  }, []);

  async function remove(id: string) {
    if (!confirm("Apagar esta geração e os respetivos ficheiros? Esta ação não pode ser anulada.")) return;
    await api(`/api/admin/generations?id=${id}`, "DELETE");
    setItems((xs) => xs?.filter((g) => g.id !== id) || null);
  }

  if (err) return <p className="text-red-300">{err}</p>;
  if (!items) return <p className="text-mute">A carregar…</p>;
  const shown = onlyOrders ? items.filter((g) => g.order_requested_at) : items;
  const credits = items.reduce((s, g) => s + (g.consumed_credits || 0), 0);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Gerações 3D <span className="text-mute">({shown.length})</span></h1>
          <p className="text-sm text-mute">Créditos Meshy consumidos (nas gerações listadas): {credits}</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="accent-[#ff6b0b]" checked={onlyOrders} onChange={(e) => setOnlyOrders(e.target.checked)} />
          Só com encomenda pedida
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((g) => (
          <div key={g.id} className="card overflow-hidden">
            <div className="grid grid-cols-2 bg-graphite">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {g.image_url ? <img src={g.image_url} alt="Original" className="aspect-square w-full object-cover" /> : <div className="aspect-square" />}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {g.thumbnail_url ? <img src={g.thumbnail_url} alt="Modelo" className="aspect-square w-full object-contain" /> : <div className="grid aspect-square place-items-center text-xs text-mute">{g.progress}%</div>}
            </div>
            <div className="space-y-2 p-4 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className={`rounded-full px-2 py-0.5 font-mono text-[0.65rem] ${BADGE[g.status] || ""}`}>{g.status}</span>
                {g.order_requested_at && <span className="rounded-full bg-orange/20 px-2 py-0.5 text-xs font-semibold text-orange">Encomenda pedida</span>}
              </div>
              <p className="font-semibold text-white">{g.customer_name || "—"} {g.customer_phone && <span className="text-mute">· {g.customer_phone}</span>}</p>
              <p className="text-xs text-mute">{fmtDate(g.created_at)} · {g.usage_type}{g.parent_id ? " · regeneração" : ""}</p>
              {g.description && <p className="line-clamp-3 text-soft">{g.description}</p>}
              {g.task_error && <p className="text-red-300">{g.task_error}</p>}
              <div className="flex flex-wrap gap-2 pt-1">
                {g.files.glb && <a href={`/modelo/${g.id}`} target="_blank" className="text-orange underline">Ver 3D</a>}
                {Object.entries(g.files).map(([f, u]) => (
                  <a key={f} href={u} target="_blank" className="font-mono text-xs uppercase text-soft underline">{f}</a>
                ))}
                {g.status === "SUCCEEDED" && !g.archived && <span className="text-xs text-yellow-200">a arquivar…</span>}
              </div>
              <button onClick={() => remove(g.id)} className="text-xs text-mute underline hover:text-red-300">Apagar</button>
            </div>
          </div>
        ))}
      </div>
      {shown.length === 0 && <p className="card p-6 text-mute">Sem gerações.</p>}
    </div>
  );
}
