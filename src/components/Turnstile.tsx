"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
export const turnstileOn = Boolean(SITE_KEY);

export type TurnstileHandle = { reset: () => void };

/** Widget Cloudflare Turnstile (só aparece se a chave pública estiver configurada). */
export const Turnstile = forwardRef<TurnstileHandle, { onToken: (t: string) => void }>(function Turnstile({ onToken }, ref) {
  const box = useRef<HTMLDivElement>(null);
  const id = useRef<string | undefined>(undefined);
  const cb = useRef(onToken);
  cb.current = onToken;

  useImperativeHandle(ref, () => ({
    reset: () => {
      cb.current("");
      if (window.turnstile && id.current) window.turnstile.reset(id.current);
    },
  }));

  useEffect(() => {
    if (!SITE_KEY || !box.current) return;
    const render = () => {
      if (!window.turnstile || !box.current || id.current) return;
      id.current = window.turnstile.render(box.current, {
        sitekey: SITE_KEY,
        language: "pt",
        theme: "dark",
        callback: (t: string) => cb.current(t),
        "expired-callback": () => cb.current(""),
      });
    };
    if (window.turnstile) render();
    else {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = render;
      document.head.appendChild(s);
    }
    return () => {
      if (window.turnstile && id.current) window.turnstile.remove(id.current);
      id.current = undefined;
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={box} className="min-h-[65px]" />;
});
