"use client";
import { useEffect, useState } from "react";
import { api } from "./api";
import { formatPrice, type Category, type Product } from "@/lib/types";
import { prepareImage, uploadFile } from "@/lib/supabase-browser";

type Draft = {
  id?: string; name: string; slug: string; category_id: string; description: string; features: string;
  material: string; dimensions: string; price: string; images: string[]; published: boolean; featured: boolean; sort_order: number;
};
const EMPTY: Draft = {
  name: "", slug: "", category_id: "", description: "", features: "", material: "", dimensions: "",
  price: "", images: [], published: true, featured: false, sort_order: 0,
};

export function ProductsPanel() {
  const [items, setItems] = useState<Product[] | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [d, setD] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => api<Product[]>("/api/admin/products").then(setItems).catch((e) => setMsg(e.message));
  useEffect(() => {
    load();
    api<Category[]>("/api/admin/categories").then(setCats).catch(() => {});
  }, []);

  function editProduct(p: Product) {
    setMsg(null);
    setD({
      id: p.id, name: p.name, slug: p.slug, category_id: p.category_id || "", description: p.description || "",
      features: p.features.join("\n"), material: p.material || "", dimensions: p.dimensions || "",
      price: p.price == null ? "" : String(p.price), images: p.images, published: p.published, featured: p.featured, sort_order: p.sort_order,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function addImages(files: FileList | null) {
    if (!files || !d) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) urls.push((await uploadFile(await prepareImage(f, 1800), "catalog", f.name)).publicUrl);
      setD((x) => (x ? { ...x, images: [...x.images, ...urls] } : x));
    } catch (e) {
      setMsg((e as Error).message);
    }
    setBusy(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!d) return;
    setBusy(true);
    setMsg(null);
    try {
      const body = { ...d, features: d.features.split("\n").map((s) => s.trim()).filter(Boolean), price: d.price.trim() === "" ? null : d.price };
      if (d.id) await api(`/api/admin/products/${d.id}`, "PUT", body);
      else await api("/api/admin/products", "POST", body);
      setD(null);
      setMsg("Produto guardado. O site atualiza em instantes.");
      load();
    } catch (er) {
      setMsg((er as Error).message);
    }
    setBusy(false);
  }

  async function remove(id: string) {
    if (!confirm("Remover este produto e as suas fotografias?")) return;
    await api(`/api/admin/products/${id}`, "DELETE");
    load();
  }

  const move = (i: number, dir: -1 | 1) =>
    setD((x) => {
      if (!x) return x;
      const imgs = [...x.images];
      const j = i + dir;
      if (j < 0 || j >= imgs.length) return x;
      [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
      return { ...x, images: imgs };
    });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Produtos</h1>
        {!d && <button className="btn btn-primary" onClick={() => setD({ ...EMPTY })}>+ Adicionar produto</button>}
      </div>
      {msg && <p className="mb-4 rounded-lg border border-line bg-panel p-3 text-sm text-soft">{msg}</p>}

      {d && (
        <form onSubmit={save} className="card mb-8 grid gap-4 p-6 lg:grid-cols-2">
          <h2 className="font-display text-lg font-bold text-white lg:col-span-2">{d.id ? "Editar produto" : "Novo produto"}</h2>
          <div><label className="label">Nome *</label><input className="field" required value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} /></div>
          <div><label className="label">Endereço (slug)</label><input className="field" placeholder="gerado a partir do nome" value={d.slug} onChange={(e) => setD({ ...d, slug: e.target.value })} /></div>
          <div>
            <label className="label">Categoria</label>
            <select className="field" value={d.category_id} onChange={(e) => setD({ ...d, category_id: e.target.value })}>
              <option value="">— Sem categoria —</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Preço (€) — vazio = «Solicitar orçamento»</label>
            <input className="field" inputMode="decimal" placeholder="ex.: 12,50" value={d.price} onChange={(e) => setD({ ...d, price: e.target.value })} />
          </div>
          <div><label className="label">Material</label><input className="field" value={d.material} onChange={(e) => setD({ ...d, material: e.target.value })} /></div>
          <div><label className="label">Dimensões</label><input className="field" placeholder="ex.: 10 × 6 × 2 cm" value={d.dimensions} onChange={(e) => setD({ ...d, dimensions: e.target.value })} /></div>
          <div className="lg:col-span-2"><label className="label">Descrição</label><textarea className="field min-h-28" value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} /></div>
          <div className="lg:col-span-2"><label className="label">Características (uma por linha)</label><textarea className="field min-h-24" value={d.features} onChange={(e) => setD({ ...d, features: e.target.value })} /></div>
          <div className="lg:col-span-2">
            <label className="label">Fotografias (a primeira é a capa)</label>
            <div className="flex flex-wrap gap-3">
              {d.images.map((src, i) => (
                <div key={src} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-24 w-24 rounded-lg border border-line object-cover" />
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/80 text-xs">
                    <button type="button" onClick={() => move(i, -1)} className="px-2 py-1">◀</button>
                    <button type="button" onClick={() => setD({ ...d, images: d.images.filter((x) => x !== src) })} className="px-2 py-1 text-red-300">✕</button>
                    <button type="button" onClick={() => move(i, 1)} className="px-2 py-1">▶</button>
                  </div>
                </div>
              ))}
              <label className="grid h-24 w-24 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-line text-center text-xs text-mute hover:border-orange">
                {busy ? "A enviar…" : "+ Fotos"}
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => addImages(e.target.files)} />
              </label>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 lg:col-span-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[#ff6b0b]" checked={d.published} onChange={(e) => setD({ ...d, published: e.target.checked })} /> Publicado</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[#ff6b0b]" checked={d.featured} onChange={(e) => setD({ ...d, featured: e.target.checked })} /> Destaque na página inicial</label>
            <label className="flex items-center gap-2 text-sm">Ordem <input type="number" className="field !w-20 !py-1" value={d.sort_order} onChange={(e) => setD({ ...d, sort_order: Number(e.target.value) })} /></label>
          </div>
          <div className="flex gap-3 lg:col-span-2">
            <button className="btn btn-primary" disabled={busy}>Guardar produto</button>
            <button type="button" className="btn btn-ghost" onClick={() => setD(null)}>Cancelar</button>
          </div>
        </form>
      )}

      {!items ? (
        <p className="text-mute">A carregar…</p>
      ) : items.length === 0 ? (
        <p className="card p-6 text-mute">Ainda não há produtos. Clique em «Adicionar produto».</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {items.map((p) => (
            <li key={p.id} className="card flex items-center gap-4 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.images[0] ? <img src={p.images[0]} alt="" className="h-16 w-16 rounded-lg object-cover" /> : <div className="h-16 w-16 rounded-lg bg-graphite" />}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{p.name}</p>
                <p className="text-xs text-mute">
                  {p.categories?.name || "Sem categoria"} · {formatPrice(p.price) || "Orçamento"}
                  {!p.published && " · oculto"}{p.featured && " · ★ destaque"}
                </p>
              </div>
              <button className="btn btn-ghost !py-1.5 text-sm" onClick={() => editProduct(p)}>Editar</button>
              <button className="btn btn-ghost !py-1.5 text-sm" onClick={() => remove(p.id)}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
