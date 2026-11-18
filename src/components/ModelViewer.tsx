"use client";
import { useEffect, useState } from "react";

// Carregado a partir do CDN oficial da Google (traz o seu próprio three.js),
// evitando conflitos de versões com o three.js usado na animação da página inicial.
const MODEL_VIEWER_SRC = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.1.0/model-viewer.min.js";

let loading: Promise<void> | null = null;
function loadModelViewer(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (customElements.get("model-viewer")) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.type = "module";
      s.src = MODEL_VIEWER_SRC;
      s.onload = () => customElements.whenDefined("model-viewer").then(() => resolve());
      s.onerror = () => {
        loading = null;
        reject(new Error("model-viewer"));
      };
      document.head.appendChild(s);
    });
  }
  return loading;
}

/**
 * Visualizador 3D interativo (Google <model-viewer>, gratuito e open source):
 * rodar, ampliar e observar em 360°, com suporte a toque e realidade aumentada
 * em telemóveis compatíveis.
 */
export function ModelViewer({ src, poster, alt = "Modelo 3D", className = "" }: { src: string; poster?: string | null; alt?: string; className?: string }) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    let alive = true;
    loadModelViewer()
      .then(() => alive && setState("ready"))
      .catch(() => alive && setState("error"));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className={`bedgrid relative overflow-hidden rounded-2xl border border-line bg-graphite ${className}`}>
      {state === "ready" ? (
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
          style={{ width: "100%", height: "100%", background: "transparent" }}
        />
      ) : state === "error" ? (
        <div className="grid h-full place-items-center p-6 text-center text-sm text-mute">
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt={alt} className="max-h-full object-contain" />
          ) : (
            "Não foi possível carregar o visualizador 3D. Atualize a página."
          )}
        </div>
      ) : (
        <div className="grid h-full place-items-center text-sm text-mute">A carregar o visualizador 3D…</div>
      )}
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-ink/70 px-3 py-1 font-mono text-[0.65rem] tracking-wider text-soft backdrop-blur">
        ARRASTE PARA RODAR · PINÇA/RODA PARA AMPLIAR
      </div>
    </div>
  );
}
