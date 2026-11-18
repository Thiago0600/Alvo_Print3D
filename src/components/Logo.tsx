import Image from "next/image";
import Link from "next/link";

/** Marca horizontal para o cabeçalho: símbolo + logótipo tipográfico. */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Alvo Print 3D — página inicial" className={`flex items-center gap-2.5 ${className}`}>
      <Image src="/brand/icon-dark.png" alt="" width={56} height={34} priority className="h-8 w-auto" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.15rem] font-extrabold tracking-tight text-white">
          ALVO <span className="text-orange">PRINT</span>
        </span>
        <span className="font-mono text-[0.6rem] tracking-[0.3em] text-mute">IMPRESSÃO 3D</span>
      </span>
    </Link>
  );
}

export function LogoFull({ className = "", width = 260 }: { className?: string; width?: number }) {
  return (
    <Image
      src="/brand/logo-dark.png"
      alt="Alvo Print 3D — Impressão 3D"
      width={width}
      height={Math.round(width * (950 / 980))}
      className={className}
    />
  );
}
