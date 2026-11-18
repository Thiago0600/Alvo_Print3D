import { NextResponse } from "next/server";
import { str } from "@/lib/admin-guard";

export const runtime = "nodejs";

// IA generativa OPCIONAL para o assistente (só quando as respostas predefinidas
// não cobrem a pergunta). Desativada por omissão — só funciona se definir
// ASSISTANT_ANTHROPIC_API_KEY (serviço pago por utilização).
const SYSTEM = `És o Filo, o assistente virtual (um pequeno robô simpático) da Alvo Print 3D, empresa de impressão 3D em Évora, Portugal.
Responde sempre em português de Portugal, de forma curta (máx. 4 frases), natural e simpática.
Factos que podes usar: impressão 3D personalizada, peças únicas e produção em grandes quantidades, protótipos, peças industriais, para automóveis, decorativas e utilitárias; criação de modelos 3D a partir de fotografias com IA (Meshy AI) na página /criar-3d; entrega gratuita em Portugal continental; Açores e Madeira com condições confirmadas caso a caso; contacto por WhatsApp +351 966 381 796.
NUNCA inventes preços, prazos, materiais disponíveis, garantias ou características técnicas. Se a pergunta exigir isso ou não souberes, diz que a equipa responde pelo WhatsApp.
Recusa educadamente temas sem relação com a empresa.`;

export async function POST(req: Request) {
  const key = process.env.ASSISTANT_ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ enabled: false });
  const body = await req.json().catch(() => ({}));
  const message = str(body.message, 500);
  if (!message) return NextResponse.json({ enabled: false });
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.ASSISTANT_MODEL || "claude-haiku-5-5",
        max_tokens: 300,
        system: SYSTEM,
        messages: [{ role: "user", content: message }],
      }),
    });
    if (!res.ok) return NextResponse.json({ enabled: false });
    const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    const text = data.content?.find((c) => c.type === "text")?.text?.trim();
    return NextResponse.json({ enabled: Boolean(text), text });
  } catch {
    return NextResponse.json({ enabled: false });
  }
}
