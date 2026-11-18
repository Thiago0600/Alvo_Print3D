"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { prepareImage, uploadFile } from "@/lib/supabase-browser";
import { USAGE_TYPES } from "@/lib/site";
import { downloadUrl, type PublicGeneration } from "@/lib/types";
import { ModelViewer } from "./ModelViewer";
import { OrderForm } from "./OrderForm";
import { Turnstile, turnstileOn, type TurnstileHandle } from "./Turnstile";
import { WhatsAppCta } from "./WhatsAppCta";

type Phase = "form" | "uploading" | "generating" | "result" | "failed";

const STATUS_TEXT: Record<string, string> = {
  PENDING: "Na fila de criação…",
  IN_PROGRESS: "A inteligência artificial está a criar o seu modelo 3D…",
  SUCCEEDED: "A guardar o modelo…",
};

export function Creator({ available }: { available: boolean }) {
  const [phase, setPhase] = useState<Phase>("form");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", description: "", usageType: "decorativa", consent: false });
  const [error, setError] = useState<string | null>(null);
  const [gen, setGen] = useState<PublicGeneration | null>(null);
  const [approved, setApproved] = useState(false);
  const [token, setToken] = useState("");
  const ts = useRef<TurnstileHandle>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Retoma uma criação em curso (ex.: página recarregada) através de ?g=<id>
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("g");
    if (id) {
      setPhase("generating");
      poll(id);
    }
    try {
      const saved = JSON.parse(localStorage.getItem("alvo-creator") || "{}");
      if (saved.name) setForm((f) => ({ ...f, name: saved.name, phone: saved.phone || "" }));
    } catch {}
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const poll = useCallback(async (id: string, attempt = 0) => {
    try {
      const res = await fetch(`/api/meshy/status/${id}`, { cache: "no-store" });
      const data = (await res.json()) as PublicGeneration & { error?: string };
      if (!res.ok) throw new Error(data.error || "Erro ao consultar o estado.");
      setGen(data);
      if (data.status === "FAILED" || data.status === "CANCELED") {
        setError(data.error || "A criação não foi concluída. Experimente outra fotografia.");
        setPhase("failed");
        return;
      }
      if (data.status === "SUCCEEDED" && data.files.glb) setPhase("result");
      if (!(data.status === "SUCCEEDED" && data.archived)) {
        const delay = data.status === "SUCCEEDED" ? 1500 : 4000;
        timer.current = setTimeout(() => poll(id, 0), delay);
      }
    } catch (e) {
      if (attempt < 5) timer.current = setTimeout(() => poll(id, attempt + 1), 5000);
      else {
        setError((e as Error).message);
        setPhase("failed");
      }
    }
  }, []);

  function onPick(f: File | undefined) {
    setError(null);
    if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return setError("Use uma imagem JPG, PNG ou WebP.");
    if (f.size > 20 * 1024 * 1024) return setError("A imagem é demasiado grande (máx. 20 MB).");
    setFile(f);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(f);
    });
  }

  async function start(parentId?: string) {
    setError(null);
    if (!parentId && !file) return setError("Carregue uma fotografia da peça.");
    if (!form.name.trim()) return setError("Indique o seu nome.");
    if (!parentId && !form.consent) return setError("Aceite a política de privacidade para continuar.");
    if (turnstileOn && !token) return setError("Confirme a verificação de segurança.");
    try {
      localStorage.setItem("alvo-creator", JSON.stringify({ name: form.name, phone: form.phone }));
    } catch {}

    try {
      let imagePath: string | undefined;
      if (!parentId && file) {
        setPhase("uploading");
        const blob = await prepareImage(file);
        imagePath = (await uploadFile(blob, "generation", file.name)).path;
      }
      setPhase("generating");
      setGen(null);
      setApproved(false);
      const res = await fetch("/api/meshy/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, imagePath, parentId, turnstileToken: token }),
      });
      const data = await res.json().catch(() => ({}));
      ts.current?.reset();
      if (!res.ok) throw new Error(data.error || "Não foi possível iniciar a criação.");
      const url = new URL(window.location.href);
      url.searchParams.set("g", data.id);
      window.history.replaceState(null, "", url);
      poll(data.id);
    } catch (e) {
      ts.current?.reset();
      setError((e as Error).message);
      setPhase(parentId ? "result" : "form");
    }
  }

  function restart() {
    if (timer.current) clearTimeout(timer.current);
    const url = new URL(window.location.href);
    url.searchParams.delete("g");
    window.history.replaceState(null, "", url);
    setGen(null);
    setFile(null);
    setPreview(null);
    setApproved(false);
    setError(null);
    setPhase("form");
  }

  if (!available) {
    return (
      <div className="card p-8 text-center">
        <h2 className="font-display text-2xl font-bold text-white">A criação 3D com IA estará disponível em breve</h2>
        <p className="mx-auto mt-3 max-w-lg text-mute">
          Entretanto, envie-nos a fotografia da peça pelo WhatsApp e preparamos o modelo por si.
        </p>
        <WhatsAppCta className="mt-6" text="Olá! Gostaria de criar uma peça 3D a partir de uma fotografia." />
      </div>
    );
  }

  /* ---------------- PASSO 1: formulário ---------------- */
  if (phase === "form" || phase === "uploading") {
    const busy = phase === "uploading";
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start();
        }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <div className="card p-6">
          <p className="tag mb-3">1 · Fotografia</p>
          <label
            htmlFor="photo"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onPick(e.dataTransfer.files?.[0]);
            }}
            className="bedgrid relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-line text-center transition hover:border-orange"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Pré-visualização da fotografia" className="absolute inset-0 h-full w-full object-contain p-2" />
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="h-12 w-12 text-orange" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <path d="M4 7h3l2-3h6l2 3h3v13H4z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span className="mt-4 font-display text-lg font-bold text-white">Carregar fotografia</span>
                <span className="mt-1 px-6 text-sm text-mute">Toque para tirar foto ou escolher da galeria · JPG, PNG, WebP</span>
              </>
            )}
          </label>
          <input id="photo" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onPick(e.target.files?.[0])} />
          <ul className="mt-4 space-y-1 text-sm text-mute">
            <li>• A peça deve estar bem visível e centrada, de preferência num fundo liso.</li>
            <li>• Boa iluminação e sem outros objetos à volta dão melhores resultados.</li>
          </ul>
        </div>

        <div className="card space-y-4 p-6">
          <p className="tag">2 · Sobre a peça</p>
          <div>
            <label className="label" htmlFor="desc">Descrição (opcional)</label>
            <textarea
              id="desc"
              className="field min-h-24"
              placeholder="Ex.: suporte de telemóvel para o carro; tampa de substituição…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="usage">Tipo de utilização</label>
            <select id="usage" className="field" value={form.usageType} onChange={(e) => setForm({ ...form, usageType: e.target.value })}>
              {USAGE_TYPES.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">O seu nome *</label>
              <input id="name" className="field" required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="phone">Telefone (opcional)</label>
              <input id="phone" className="field" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <label className="flex items-start gap-3 text-sm text-soft">
            <input type="checkbox" className="mt-1 accent-[#ff6b0b]" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
            <span>
              Aceito que a fotografia seja processada por inteligência artificial (Meshy AI) para criar o modelo 3D, conforme a{" "}
              <Link href="/privacidade" className="text-orange underline">política de privacidade</Link>.
            </span>
          </label>
          <Turnstile ref={ts} onToken={setToken} />
          {error && <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
          <button type="submit" className="btn btn-primary w-full text-base" disabled={busy}>
            {busy ? "A enviar a fotografia…" : "Criar modelo 3D"}
          </button>
          <p className="text-center text-xs text-mute">A criação demora normalmente alguns minutos.</p>
        </div>
      </form>
    );
  }

  /* ---------------- PASSO 2: progresso ---------------- */
  if (phase === "generating") {
    const p = gen?.progress ?? 0;
    return (
      <div className="card mx-auto max-w-2xl p-8 text-center" aria-live="polite">
        <div className="relative mx-auto h-40 w-40">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#262a31" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="44" fill="none" stroke="#ff6b0b" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={276.5} strokeDashoffset={276.5 * (1 - p / 100)} style={{ transition: "stroke-dashoffset .8s" }}
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center font-display text-4xl font-extrabold text-white">{p}%</span>
        </div>
        <h2 className="mt-6 font-display text-2xl font-bold text-white">{STATUS_TEXT[gen?.status || "PENDING"] || "A processar…"}</h2>
        <p className="mt-2 text-mute">Pode deixar esta página aberta. Se a fechar, guarde o endereço para voltar mais tarde.</p>
        {gen?.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={gen.imageUrl} alt="Fotografia enviada" className="mx-auto mt-6 h-28 w-28 rounded-xl border border-line object-cover opacity-80" />
        )}
      </div>
    );
  }

  /* ---------------- FALHA ---------------- */
  if (phase === "failed") {
    return (
      <div className="card mx-auto max-w-2xl p-8 text-center">
        <h2 className="font-display text-2xl font-bold text-white">Não foi possível criar o modelo</h2>
        <p className="mt-3 text-mute">{error}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button className="btn btn-primary" onClick={restart}>Tentar com outra fotografia</button>
          <WhatsAppCta text="Olá! Tentei criar um modelo 3D no site mas não funcionou. Posso enviar-vos a fotografia?" />
        </div>
      </div>
    );
  }

  /* ---------------- PASSO 3: resultado ---------------- */
  if (!gen) return null;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <ModelViewer src={gen.files.glb} poster={gen.thumbnailUrl} className="aspect-square w-full lg:aspect-[4/3.4]" alt="Modelo 3D gerado a partir da sua fotografia" />
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-mute">Descarregar:</span>
          {Object.entries(gen.files).map(([fmt, url]) => (
            <a key={fmt} href={downloadUrl(url, `alvo-print-3d-${gen.id.slice(0, 8)}.${fmt}`)} className="rounded-lg border border-line px-3 py-1.5 font-mono text-xs uppercase hover:border-orange">
              {fmt}
            </a>
          ))}
          {!gen.archived && <span className="text-xs text-mute">· a preparar outros formatos…</span>}
        </div>
      </div>

      <div className="space-y-5">
        <div className="card p-6">
          <p className="tag">Modelo pronto</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-white">Gosta do resultado?</h2>
          <p className="mt-2 text-sm text-mute">
            Rode e amplie a peça. O modelo será revisto pela nossa equipa antes da impressão — pequenos ajustes de
            medidas e forma são feitos por nós.
          </p>
          {gen.imageUrl && (
            <div className="mt-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gen.imageUrl} alt="Fotografia original" className="h-16 w-16 rounded-lg border border-line object-cover" />
              <span className="text-xs text-mute">Fotografia original</span>
            </div>
          )}
          {!approved && (
            <div className="mt-5 grid gap-3">
              <button className="btn btn-primary text-base" onClick={() => setApproved(true)}>
                Aprovar e pedir a fabricação
              </button>
              <Turnstile ref={ts} onToken={setToken} />
              <button className="btn btn-ghost" onClick={() => start(gen.id)}>Gerar novamente</button>
              <button className="text-sm text-mute underline hover:text-white" onClick={restart}>Começar com outra fotografia</button>
            </div>
          )}
          {error && <p role="alert" className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
        </div>
        {approved && <OrderForm gen={gen} defaults={form} />}
      </div>
    </div>
  );
}
