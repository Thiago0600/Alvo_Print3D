"use client";
import { useState } from "react";
import { useCompany } from "./SiteProvider";
import { MATERIALS } from "@/lib/site";
import { buildQuoteMessage, waLink } from "@/lib/whatsapp";
import { prepareImage, uploadFile } from "@/lib/supabase-browser";
import { WaIcon } from "./WhatsAppCta";

const ACCEPT = ".jpg,.jpeg,.png,.webp,.pdf,.stl,.3mf,.obj";

export function QuoteForm({ kind = "orcamento" }: { kind?: "orcamento" | "empresa" }) {
  const company = useCompany();
  const business = kind === "empresa";
  const [f, setF] = useState({
    name: "",
    company: "",
    phone: "",
    pieceType: "",
    dimensions: "",
    material: MATERIALS[0],
    color: "",
    quantity: business ? "" : "1",
    deadline: "",
    productionType: business ? "grandes_quantidades" : "individual",
    description: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    // Abre a janela já (gesto do utilizador) para não ser bloqueada; o endereço é definido no fim.
    const win = files.length ? window.open("about:blank", "_blank") : null;
    setBusy(true);
    const referenceUrls: string[] = [];
    try {
      for (const file of files.slice(0, 5)) {
        const blob = file.type.startsWith("image/") ? await prepareImage(file) : file;
        const typed = blob.type ? blob : new Blob([blob], { type: guessType(file.name) });
        referenceUrls.push((await uploadFile(typed, "quote", file.name)).publicUrl);
      }
    } catch (err) {
      setMsg(`${(err as Error).message} O pedido segue sem anexos — pode enviar os ficheiros diretamente na conversa.`);
    }
    const text = buildQuoteMessage({ kind, ...f, referenceUrls });
    fetch("/api/requests", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, ...f, referenceUrls, whatsappText: text }),
    }).catch(() => {});
    const url = waLink(company.whatsapp, text);
    if (win) win.location.href = url;
    else window.open(url, "_blank", "noopener");
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="card space-y-5 p-6 sm:p-8">
      <fieldset>
        <legend className="label">Tipo de produção</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["individual", "Produção individual", "Uma peça ou poucas unidades"],
            ["grandes_quantidades", "Produção em grandes quantidades", "Séries para empresas e revenda"],
          ].map(([v, l, d]) => (
            <label key={v} className={`card flex cursor-pointer gap-3 p-4 ${f.productionType === v ? "!border-orange" : ""}`}>
              <input type="radio" name="prod" value={v} checked={f.productionType === v} onChange={set("productionType")} className="mt-1 accent-[#ff6b0b]" />
              <span>
                <span className="block font-semibold text-white">{l}</span>
                <span className="text-sm text-mute">{d}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="q-name">Nome *</label>
          <input id="q-name" className="field" required value={f.name} onChange={set("name")} autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="q-company">Empresa {business ? "*" : "(opcional)"}</label>
          <input id="q-company" className="field" required={business} value={f.company} onChange={set("company")} autoComplete="organization" />
        </div>
        <div>
          <label className="label" htmlFor="q-phone">Telefone (opcional)</label>
          <input id="q-phone" className="field" inputMode="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" />
        </div>
        <div>
          <label className="label" htmlFor="q-type">Tipo de peça *</label>
          <input id="q-type" className="field" required placeholder="ex.: suporte, engrenagem, protótipo…" value={f.pieceType} onChange={set("pieceType")} />
        </div>
        <div>
          <label className="label" htmlFor="q-dim">Dimensões aproximadas</label>
          <input id="q-dim" className="field" placeholder="ex.: 12 × 8 × 4 cm" value={f.dimensions} onChange={set("dimensions")} />
        </div>
        <div>
          <label className="label" htmlFor="q-mat">Material desejado</label>
          <select id="q-mat" className="field" value={f.material} onChange={set("material")}>
            {MATERIALS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="q-color">Cor</label>
          <input id="q-color" className="field" value={f.color} onChange={set("color")} />
        </div>
        <div>
          <label className="label" htmlFor="q-qty">Quantidade</label>
          <input id="q-qty" className="field" inputMode="numeric" value={f.quantity} onChange={set("quantity")} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="q-deadline">Prazo pretendido</label>
          <input id="q-deadline" className="field" placeholder="ex.: até ao fim do mês, sem pressa…" value={f.deadline} onChange={set("deadline")} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="q-files">Fotografia ou ficheiro de referência</label>
        <input
          id="q-files"
          type="file"
          multiple
          accept={ACCEPT}
          onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))}
          className="field file:mr-4 file:rounded-lg file:border-0 file:bg-orange file:px-3 file:py-1.5 file:font-semibold file:text-ink"
        />
        <p className="mt-1 text-xs text-mute">Imagens, PDF, STL, 3MF ou OBJ · até 5 ficheiros · máx. 25 MB cada</p>
      </div>

      <div>
        <label className="label" htmlFor="q-desc">Descrição adicional</label>
        <textarea id="q-desc" className="field min-h-28" value={f.description} onChange={set("description")} />
      </div>

      {msg && <p className="rounded-lg border border-line bg-graphite p-3 text-sm text-soft">{msg}</p>}
      <button type="submit" disabled={busy} className="btn btn-wa w-full text-base">
        <WaIcon /> {busy ? "A preparar…" : business ? "Solicitar orçamento empresarial" : "Enviar pedido pelo WhatsApp"}
      </button>
      <p className="text-center text-xs text-mute">Abre o WhatsApp com a mensagem pronta — só precisa de carregar em Enviar.</p>
    </form>
  );
}

function guessType(name: string) {
  const ext = name.toLowerCase().split(".").pop();
  return ext === "stl" ? "model/stl" : ext === "3mf" ? "model/3mf" : ext === "obj" ? "model/obj" : ext === "pdf" ? "application/pdf" : "application/octet-stream";
}
