import Image from "next/image";
import Link from "next/link";
import { formatPrice, type Product } from "@/lib/types";

export function ProductCard({ p }: { p: Product }) {
  const price = formatPrice(p.price);
  return (
    <Link href={`/produto/${p.slug}`} className="card group flex flex-col overflow-hidden transition hover:border-orange/60">
      <div className="relative aspect-[4/3] overflow-hidden bg-graphite">
        {p.images[0] ? (
          <Image
            src={p.images[0]}
            alt={p.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="bedgrid grid h-full place-items-center text-mute">Sem fotografia</div>
        )}
        {p.categories?.name && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-soft backdrop-blur">
            {p.categories.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold text-white">{p.name}</h3>
        {p.material && <p className="mt-1 text-sm text-mute">{p.material}</p>}
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className={price ? "text-lg font-bold text-white" : "text-sm font-semibold text-orange"}>
            {price || "Solicitar orçamento"}
          </span>
          <span className="text-sm font-semibold text-soft group-hover:text-orange">Ver →</span>
        </div>
      </div>
    </Link>
  );
}
