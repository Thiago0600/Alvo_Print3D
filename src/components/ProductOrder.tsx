"use client";
import { useState } from "react";
import { useCompany } from "./SiteProvider";
import { buildQuoteMessage, waLink } from "@/lib/whatsapp";
import { WaIcon } from "./WhatsAppCta";

export function ProductOrder({ product }: { product: { id: string; name: string; slug: string } }) {
  const company = useCompany();
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [color, setColor] = useState("");
  const [notes, setNotes] = useState("");

  function order(e: React.FormEvent) {
    e.preventDefault();
    const text = buildQuoteMessage({
      kind: "produto",
      name,
      productName: product.name,
      productUrl: `${window.location.origin}/produto/${product.slug}`,
      quantity: qty,
      color,
      description: notes,
    });
    fetch("/api/requests", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "produto", productId: product.id, name, quantity: qty, color, description: notes, pieceType: product.name, whatsappText: text }),
    }).catch(() => {});
    window.open(waLink(company.whatsapp, text), "_blank", "noopener");
  }

  return (
    <form onSubmit={order} className="card mt-8 space-y-3 p-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="po-name">Nome *</label>
          <input id="po-name" className="field" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="po-qty">Quantidade</label>
          <input id="po-qty" className="field" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="po-color">Cor pretendida</label>
        <input id="po-color" className="field" value={color} onChange={(e) => setColor(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="po-notes">Observações</label>
        <textarea id="po-notes" className="field min-h-16" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <button className="btn btn-wa w-full text-base" type="submit"><WaIcon /> Encomendar pelo WhatsApp</button>
    </form>
  );
}
