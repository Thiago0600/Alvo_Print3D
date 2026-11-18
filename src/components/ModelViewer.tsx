"use client";
import { useEffect, useState } from "react";

/**
 * Visualizador 3D interativo (Google <model-viewer>, gratuito e open source):
 * rodar, ampliar e observar em 360°, com suporte a toque e realidade aumentada
 * em telemóveis compatíveis.
 */
export function ModelViewer({ src, poster, alt = "Modelo 3D", className = "" }: { src: string; poster?: string | null; alt?: string; className?: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    import("@google/model-viewer").then(() => alive && setReady(true)).catch(() => alive && setReady(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className={`bedgrid relative overflow-hidden rounded-2xl border border-line bg-graphite ${className}`}>
      {ready ? (
        <model-viewer
          src={src}
          poster={poster || undefined}
          alt={alt}
          camera-controls
          auto-rotate
          ar
          ar-modes="webxr scene-viewer quick-look"
          touch-action="pan-y"
          shadow-intensity="1"
          exposure="1.05"
          interaction-prompt="auto"
          style={{ width: "100%", height: "100%", background: "transparent", ["--poster-color" as string]: "transparent" }}
        />
      ) : (
        <div className="grid h-full place-items-center text-sm text-mute">A carregar o visualizador 3D…</div>
      )}
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-ink/70 px-3 py-1 font-mono text-[0.65rem] tracking-wider text-soft backdrop-blur">
        ARRASTE PARA RODAR · PINÇA/RODA PARA AMPLIAR
      </div>
    </div>
  );
}
