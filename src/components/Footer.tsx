"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoFull } from "./Logo";
import { useCompany } from "./SiteProvider";
import { waLink } from "@/lib/whatsapp";

function formatPhone(d: string) {
  const m = d.match(/^(351)(\d{3})(\d{3})(\d{3})$/);
  return m ? `+${m[1]} ${m[2]} ${m[3]} ${m[4]}` : `+${d}`;
}

export function Footer() {
  const c = useCompany();
  const path = usePathname();
  if (path?.startsWith("/admin")) return null;
  return (
    <footer className="layers mt-24 border-t border-line bg-graphite">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <LogoFull width={170} className="h-auto w-36" />
          <p className="mt-4 text-sm text-mute">
            Impressão 3D personalizada em {c.city}. Entrega gratuita em Portugal continental.
          </p>
        </div>
        <div>
          <p className="tag mb-4">Serviços</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/criar-3d" className="hover:text-white">Criar peça 3D com IA</Link></li>
            <li><Link href="/catalogo" className="hover:text-white">Catálogo</Link></li>
            <li><Link href="/orcamento" className="hover:text-white">Solicitar orçamento</Link></li>
            <li><Link href="/empresas" className="hover:text-white">Produção para empresas</Link></li>
          </ul>
        </div>
        <div>
          <p className="tag mb-4">Informação</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/entrega" className="hover:text-white">Entrega e localização</Link></li>
            <li><Link href="/privacidade" className="hover:text-white">Privacidade</Link></li>
            <li><a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener" className="hover:text-white">Livro de Reclamações</a></li>
          </ul>
        </div>
        <div>
          <p className="tag mb-4">Contacto</p>
          <a href={waLink(c.whatsapp)} target="_blank" rel="noopener" className="block text-lg font-bold text-white hover:text-orange">
            {formatPhone(c.whatsapp)}
          </a>
          <p className="mt-1 text-sm text-mute">WhatsApp · {c.region}</p>
          {c.email && <a href={`mailto:${c.email}`} className="mt-2 block text-sm hover:text-white">{c.email}</a>}
          <div className="mt-3 flex gap-3 text-sm">
            {c.instagram && <a href={c.instagram} target="_blank" rel="noopener" className="hover:text-white">Instagram</a>}
            {c.facebook && <a href={c.facebook} target="_blank" rel="noopener" className="hover:text-white">Facebook</a>}
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-mute sm:px-6">
          © {new Date().getFullYear()} {c.name}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
