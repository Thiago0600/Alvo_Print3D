"use client";
import { useState } from "react";
import { useCompany } from "./SiteProvider";
import { MATERIALS, SITE_URL } from "@/lib/site";
import { buildPieceOrderMessage, waLink } from "@/lib/whatsapp";
import type { PublicGeneration } from "@/lib/types";
import { WaIcon } from "./WhatsAppCta";

/** Formulário "SOLICITAR ESTA PEÇA": prepara a mensagem com todos os dados e links e abre o WhatsApp. */
export function OrderForm({
  gen,
  defaults,
}: {
  gen: PublicGeneration;
  defaults: { name: string; phone: string; description: string; usageType: string };
}) {
  const company = useCompany();
  const [f, setF] = useState({
    name: defaults.name,
    phone: defaults.phone,
    description: defaults.description,
    dimensions: "",
    material: MATERIALS[0],
    color: "",
    quantity: "1",
    productionType: "individual",
    notes: "",
  });
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  const origin = typeof window !== "undefined" ? window.location.origin : SITE_URL;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = buildPieceOrderMessage({
      ...f,
      usageType: defaults.usageType,
      originalImageUrl: gen.imageUrl || undefined,
      viewUrl: `${origin}/modelo/${gen.id}`,
      files: gen.files,
      generationId: gen.id,
    });
    // Regista o pedido no painel (sem bloquear a abertura do WhatsApp)
    fetch("/api/requests", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "peca3d", generationId: gen.id, whatsappText: text, ...f }),
    }).catch(() => {});
    window.open(waLink(company.whatsapp, text), "_blank", "noopener");
    setSent(true);
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div>
        <p className="tag">Último passo</p>
        <h3 className="mt-1 font-display text-xl font-bold text-white">Detalhes para a fabricação</h3>
        <p className="mt-1 text-sm text-mute">Se não souber algum campo, deixe em branco — ajudamos pelo WhatsApp.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="o-name">Nome *</label>
          <input id="o-name" className="field" required value={f.name} onChange={set("name")} autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="o-phone">Telefone (opcional)</label>
          <input id="o-phone" className="field" value={f.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="o-desc">Descrição da peça</label>
        <textarea id="o-desc" className="field min-h-20" value={f.description} onChange={set("description")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="o-dim">Dimensões pretendidas</label>
          <input id="o-dim" className="field" placeholder="ex.: 10 × 5 × 3 cm" value={f.dimensions} onChange={set("dimensions")} />
        </div>
        <div>
          <label className="label" htmlFor="o-mat">Material</label>
          <select id="o-mat" className="field" value={f.material} onChange={set("material")}>
            {MATERIALS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="o-color">Cor</label>
          <input id="o-color" className="field" placeholder="ex.: preto, laranja…" value={f.color} onChange={set("color")} />
        </div>
        <div>
          <label className="label" htmlFor="o-qty">Quantidade</label>
          <input id="o-qty" className="field" inputMode="numeric" value={f.quantity} onChange={set("quantity")} />
        </div>
      </div>
      <fieldset>
        <legend className="label">Tipo de produção</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["individual", "Produção individual"],
            ["grandes_quantidades", "Produção em grandes quantidades"],
          ].map(([v, l]) => (
            <label key={v} className={`card flex cursor-pointer items-center gap-3 p-4 ${f.productionType === v ? "!border-orange" : ""}`}>
              <input type="radio" name="o-prod" value={v} checked={f.productionType === v} onChange={set("productionType")} className="accent-[#ff6b0b]" />
              <span className="text-sm font-semibold text-white">{l}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor="o-notes">Observações</label>
        <textarea id="o-notes" className="field min-h-20" value={f.notes} onChange={set("notes")} />
      </div>
      <button type="submit" className="btn btn-wa w-full text-base">
        <WaIcon /> SOLICITAR ESTA PEÇA
      </button>
      {sent && (
        <p className="rounded-lg border border-line bg-graphite p-3 text-sm text-soft">
          Abrimos o WhatsApp com a mensagem preparada. Basta carregar em <b>Enviar</b>. Se não abriu,{" "}
          <a className="text-orange underline" href={`${origin}/modelo/${gen.id}`}>guarde este link do modelo</a> e envie-nos.
        </p>
      )}
    </form>
  );
}
