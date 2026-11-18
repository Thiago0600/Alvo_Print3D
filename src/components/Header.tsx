"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoMark } from "./Logo";
import { NAV } from "@/lib/site";
import { useCompany } from "./SiteProvider";
import { waLink } from "@/lib/whatsapp";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();
  const company = useCompany();

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  if (path?.startsWith("/admin")) return null;

  return (
    <header
      className={`sticky top-0 z-40 transition-colors ${
        scrolled || open ? "border-b border-line bg-ink/85 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <LogoMark />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:text-white ${
                path?.startsWith(n.href) ? "text-orange" : "text-soft"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <a href={waLink(company.whatsapp)} target="_blank" rel="noopener" className="btn btn-ghost !py-2 text-sm">
            WhatsApp
          </a>
          <Link href="/orcamento" className="btn btn-primary !py-2 text-sm">
            Solicitar orçamento
          </Link>
        </div>
        <button
          className="grid h-11 w-11 place-items-center rounded-lg border border-line lg:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-3 w-5">
            <span className={`absolute left-0 h-0.5 w-5 bg-white transition ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-1.5 h-0.5 w-5 bg-white transition ${open ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 h-0.5 w-5 bg-white transition ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>
      {open && (
        <nav className="border-t border-line px-4 pb-6 pt-2 lg:hidden" aria-label="Menu móvel">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="block border-b border-line/60 py-4 text-lg font-semibold text-white">
              {n.label}
            </Link>
          ))}
          <div className="mt-5 grid gap-3">
            <Link href="/criar-3d" className="btn btn-primary">Criar a minha peça em 3D com IA</Link>
            <a href={waLink(company.whatsapp)} target="_blank" rel="noopener" className="btn btn-wa">Falar no WhatsApp</a>
          </div>
        </nav>
      )}
    </header>
  );
}
