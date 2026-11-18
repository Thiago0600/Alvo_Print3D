"use client";
import { useEffect, useState } from "react";
import { api } from "./api";
import type { Category } from "@/lib/types";

const EMPTY = { id: "", name: "", slug: "", description: "", sort_order: 0 };

export function CategoriesPanel() {
  const [items, setItems] = useState<Category[]>([]);
  const [edit, setEdit] = useState(EMPTY);
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => api<Category[]>("/api/admin/categories").then(setItems).catch((e) => setMsg(e.message));
  useEffect(() => {
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api("/api/admin/categories", "POST", { ...edit, id: edit.id || undefined });
      setEdit(EMPTY);
      setMsg("Guardado.");
      load();
    } catch (er) {
      setMsg((er as Error).message);
    }
  }
  async function remove(id: string) {
    if (!confirm("Apagar categoria? Os produtos ficam sem categoria.")) return;
    await api(`/api/admin/categories?id=${id}`, "DELETE");
    load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div>
        <h1 className="mb-5 font-display text-2xl font-bold text-white">Categorias</h1>
        <ul className="space-y-2">
          {items.map((c) => (
            <li key={c.id} className="card flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold text-white">{c.name}</p>
                <p className="font-mono text-xs text-mute">/catalogo/{c.slug} · ordem {c.sort_order}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-ghost !py-1.5 text-sm" onClick={() => setEdit({ ...c, description: c.description || "" })}>Editar</button>
                <button className="btn btn-ghost !py-1.5 text-sm" onClick={() => remove(c.id)}>Apagar</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <form onSubmit={save} className="card h-fit space-y-3 p-5">
        <h2 className="font-display text-lg font-bold text-white">{edit.id ? "Editar categoria" : "Nova categoria"}</h2>
        <div><label className="label">Nome</label><input className="field" required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
        <div><label className="label">Endereço (slug)</label><input className="field" placeholder="automático" value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} /></div>
        <div><label className="label">Descrição</label><textarea className="field" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></div>
        <div><label className="label">Ordem</label><input type="number" className="field" value={edit.sort_order} onChange={(e) => setEdit({ ...edit, sort_order: Number(e.target.value) })} /></div>
        {msg && <p className="text-sm text-soft">{msg}</p>}
        <div className="flex gap-2">
          <button className="btn btn-primary flex-1">Guardar</button>
          {edit.id && <button type="button" className="btn btn-ghost" onClick={() => setEdit(EMPTY)}>Cancelar</button>}
        </div>
      </form>
    </div>
  );
}
