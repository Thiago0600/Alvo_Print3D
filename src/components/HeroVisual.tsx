"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false, loading: () => <Fallback /> });

function Fallback() {
  return (
    <div className="grid h-full w-full place-items-center">
      <div className="h-40 w-28 animate-pulse rounded-t-full bg-gradient-to-t from-orange-deep to-orange opacity-40" />
    </div>
  );
}

/** Só carrega o WebGL quando o navegador o suporta e o utilizador não pediu movimento reduzido. */
export function HeroVisual() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      setOk(Boolean(gl));
    } catch {
      setOk(false);
    }
  }, []);
  return (
    <div className="relative h-[340px] w-full sm:h-[440px] lg:h-[540px]">
      <div className="pointer-events-none absolute inset-0 rounded-full bg-orange/10 blur-3xl" />
      {ok ? <HeroScene /> : <Fallback />}
      <div className="pointer-events-none absolute bottom-4 left-4 font-mono text-[0.65rem] tracking-widest text-mute">
        LAYER HEIGHT 0.20 MM · PLA · 215 °C
      </div>
    </div>
  );
}
