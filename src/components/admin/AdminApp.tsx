"use client";
import { useState } from "react";
import Link from "next/link";
import { LogoMark } from "../Logo";
import { QuotesPanel } from "./QuotesPanel";
import { GenerationsPanel } from "./GenerationsPanel";
import { ProductsPanel } from "./ProductsPanel";
import { CategoriesPanel } from "./CategoriesPanel";
import { SettingsPanel } from "./SettingsPanel";

const TABS = [
  { id: "quotes", label: "Pedidos" },
  { id: "generations", label: "Gerações 3D" },
  { id: "products", label: "Produtos" },
  { id: "categories", label: "Categorias" },
  { id: "settings", label: "Empresa & Meshy" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function AdminApp() {
  const [tab, setTab] = useState<Tab>("quotes");

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  return (
    <div>
      <header className="sticky top-0 z-30 border-b border-line bg-ink/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <LogoMark />
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" target="_blank" className="btn btn-ghost !py-2">Ver site</Link>
            <button onClick={logout} className="btn btn-ghost !py-2">Sair</button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold ${tab === t.id ? "bg-orange text-ink" : "text-soft hover:bg-panel"}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        {tab === "quotes" && <QuotesPanel />}
        {tab === "generations" && <GenerationsPanel />}
        {tab === "products" && <ProductsPanel />}
        {tab === "categories" && <CategoriesPanel />}
        {tab === "settings" && <SettingsPanel />}
      </main>
    </div>
  );
}
