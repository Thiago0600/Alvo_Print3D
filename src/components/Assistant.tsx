"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { answer, GREETING, type BotReply } from "@/lib/assistant";
import { waLink } from "@/lib/whatsapp";
import { useCompany } from "./SiteProvider";

type Msg = { from: "bot" | "user"; reply?: BotReply; text?: string };

/** Personagem "Filo": robô com cabeça de bico de impressora e olhos LED. */
function Robot({ talking = false, className = "" }: { talking?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <defs>
        <linearGradient id="filo-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2a2e35" />
          <stop offset="1" stopColor="#14161a" />
        </linearGradient>
        <radialGradient id="filo-eye">
          <stop offset="0" stopColor="#ffd2a8" />
          <stop offset="1" stopColor="#ff6b0b" />
        </radialGradient>
      </defs>
      {/* antena */}
      <line x1="40" y1="6" x2="40" y2="15" stroke="#8b919c" strokeWidth="2" />
      <circle cx="40" cy="6" r="3.5" fill="#ff6b0b">
        <animate attributeName="opacity" values="1;.35;1" dur="1.6s" repeatCount="indefinite" />
      </circle>
      {/* cabeça */}
      <rect x="14" y="15" width="52" height="38" rx="12" fill="url(#filo-body)" stroke="#3a3f47" strokeWidth="1.5" />
      <rect x="20" y="22" width="40" height="22" rx="8" fill="#0b0c0e" />
      <g style={{ transformOrigin: "40px 33px" }} className="animate-blink">
        <rect x="27" y="28" width="8" height="10" rx="4" fill="url(#filo-eye)" />
        <rect x="45" y="28" width="8" height="10" rx="4" fill="url(#filo-eye)" />
      </g>
      {/* "boca" LED */}
      <rect x="34" y="40" width="12" height="2" rx="1" fill="#ff6b0b" opacity=".8">
        {talking && <animate attributeName="width" values="12;6;12" dur=".35s" repeatCount="indefinite" />}
      </rect>
      {/* bico / corpo */}
      <path d="M30 53 L50 53 L46 63 L34 63 Z" fill="#b8bcc4" />
      <path d="M36 63 L44 63 L40 70 Z" fill="#d7a65a" />
      <circle cx="40" cy="72" r="2" fill="#ff8a2a">
        <animate attributeName="r" values="1.5;2.6;1.5" dur="1.2s" repeatCount="indefinite" />
      </circle>
      {/* orelhas */}
      <rect x="9" y="27" width="5" height="14" rx="2" fill="#ff6b0b" />
      <rect x="66" y="27" width="5" height="14" rx="2" fill="#ff6b0b" />
    </svg>
  );
}

export function Assistant() {
  const path = usePathname();
  const company = useCompany();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", reply: GREETING }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [bubble, setBubble] = useState(false);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setBubble(true), 6000);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  if (path?.startsWith("/admin")) return null;

  async function send(text: string) {
    const q = text.trim();
    if (!q) return;
    setInput("");
    setMsgs((m) => [...m, { from: "user", text: q }]);
    setTyping(true);
    let reply = answer(q);
    if (!reply.matched) {
      // IA generativa opcional (só se configurada no servidor)
      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: q }),
        });
        const data = await res.json();
        if (data.enabled && data.text) reply = { ...reply, text: data.text, chips: undefined };
      } catch {}
    }
    await new Promise((r) => setTimeout(r, 450 + Math.min(900, reply.text.length * 6)));
    setTyping(false);
    setMsgs((m) => [...m, { from: "bot", reply }]);
  }

  const lastBot = [...msgs].reverse().find((m) => m.from === "bot");

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end sm:bottom-6 sm:right-6">
      {open && (
        <div
          role="dialog"
          aria-label="Assistente virtual Filo"
          className="reveal mb-3 flex h-[min(560px,calc(100dvh-7rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-line bg-graphite shadow-2xl shadow-black/60"
        >
          <div className="flex items-center gap-3 border-b border-line bg-panel px-4 py-3">
            <Robot talking={typing} className="h-10 w-10" />
            <div className="flex-1">
              <p className="font-display font-bold text-white">Filo</p>
              <p className="text-xs text-mute">Assistente da Alvo Print 3D · {typing ? "a escrever…" : "online"}</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Fechar assistente" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-line">
              ✕
            </button>
          </div>
          <div ref={list} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {msgs.map((m, i) =>
              m.from === "user" ? (
                <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-orange px-4 py-2.5 text-sm font-medium text-ink">
                  {m.text}
                </div>
              ) : (
                <div key={i} className="max-w-[90%]">
                  <div className="whitespace-pre-line rounded-2xl rounded-bl-md bg-panel px-4 py-2.5 text-sm text-soft">{m.reply!.text}</div>
                  {m.reply!.links && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.reply!.links.map((l) =>
                        l.wa ? (
                          <a key={l.label} href={waLink(company.whatsapp, "Olá Alvo Print 3D! Vim do assistente do site.")} target="_blank" rel="noopener" className="btn btn-wa !px-3 !py-1.5 text-xs">
                            {l.label}
                          </a>
                        ) : (
                          <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="btn btn-primary !px-3 !py-1.5 text-xs">
                            {l.label}
                          </Link>
                        ),
                      )}
                    </div>
                  )}
                </div>
              ),
            )}
            {typing && (
              <div className="flex w-16 gap-1 rounded-2xl bg-panel px-4 py-3">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-mute" style={{ animationDelay: `${d * 0.15}s` }} />
                ))}
              </div>
            )}
          </div>
          {lastBot?.reply?.chips && !typing && (
            <div className="flex gap-2 overflow-x-auto border-t border-line px-3 py-2">
              {lastBot.reply.chips.map((c) => (
                <button key={c} onClick={() => send(c)} className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-soft hover:border-orange hover:text-white">
                  {c}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 border-t border-line p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escreva a sua pergunta…"
              aria-label="Mensagem para o assistente"
              className="field !py-2 text-sm"
              maxLength={500}
            />
            <button type="submit" className="btn btn-primary !px-4 !py-2" aria-label="Enviar">➤</button>
          </form>
        </div>
      )}

      {!open && bubble && (
        <button
          onClick={() => setOpen(true)}
          className="reveal mb-2 max-w-[230px] rounded-2xl rounded-br-md border border-line bg-panel px-4 py-2.5 text-left text-sm text-soft shadow-xl"
        >
          Olá! Precisa de ajuda com a sua peça? 👋
        </button>
      )}
      <button
        onClick={() => {
          setOpen((v) => !v);
          setBubble(false);
        }}
        aria-label={open ? "Fechar assistente virtual" : "Abrir assistente virtual"}
        aria-expanded={open}
        className="group relative grid h-16 w-16 animate-float place-items-center rounded-full border border-line bg-panel shadow-xl shadow-orange/20 transition hover:border-orange"
      >
        <span className="absolute inset-0 rounded-full bg-orange/20 opacity-0 blur-md transition group-hover:opacity-100" />
        <Robot talking={open} className="relative h-12 w-12" />
      </button>
    </div>
  );
}
