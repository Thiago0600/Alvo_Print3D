import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ModelViewer } from "@/components/ModelViewer";
import { WhatsAppCta } from "@/components/WhatsAppCta";
import { getGenerationRow, refreshGeneration, toPublic } from "@/lib/generations";
import { isSupabaseConfigured } from "@/lib/supabase-server";
import { downloadUrl } from "@/lib/types";

// Página pública de visualização de um modelo gerado — é este o link que
// segue na mensagem do WhatsApp. Não aparece no Google (noindex).
export const metadata: Metadata = {
  title: "Modelo 3D",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function ModeloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();
  let row = await getGenerationRow(id);
  if (!row) notFound();
  if (row.status === "SUCCEEDED" && !row.archived) {
    try {
      row = await refreshGeneration(row);
    } catch {}
  }
  const g = toPublic(row);
  const ref = g.id.slice(0, 8).toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="tag">Modelo 3D · Ref. {ref}</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">Visualização do modelo 3D</h1>
      {g.files.glb ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <ModelViewer src={g.files.glb} poster={g.thumbnailUrl} className="aspect-square w-full lg:aspect-[4/3.3]" />
          <div className="space-y-5">
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-white">Ficheiros</h2>
              <ul className="mt-3 space-y-2">
                {Object.entries(g.files).map(([fmt, url]) => (
                  <li key={fmt}>
                    <a href={downloadUrl(url, `alvo-print-3d-${ref}.${fmt}`)} className="flex items-center justify-between rounded-lg border border-line px-4 py-3 hover:border-orange">
                      <span className="font-mono text-sm uppercase text-white">{fmt}</span>
                      <span className="text-sm text-orange">Descarregar ↓</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {g.imageUrl && (
              <div className="card p-6">
                <h2 className="font-display text-lg font-bold text-white">Fotografia original</h2>
                <a href={g.imageUrl} target="_blank" rel="noopener">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.imageUrl} alt="Fotografia original enviada pelo cliente" className="mt-3 max-h-64 w-full rounded-lg border border-line object-contain" />
                </a>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <WhatsAppCta text={`Olá! Tenho uma questão sobre o modelo 3D com a referência ${ref}.`} />
              <Link href="/criar-3d" className="btn btn-ghost">Criar outra peça</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="card mt-8 p-8 text-center">
          <p className="text-lg text-white">
            {g.status === "FAILED" || g.status === "CANCELED"
              ? "Este modelo não foi concluído."
              : "O modelo ainda está a ser preparado. Atualize a página dentro de alguns minutos."}
          </p>
        </div>
      )}
    </div>
  );
}
