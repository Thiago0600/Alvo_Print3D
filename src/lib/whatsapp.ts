// Construção de mensagens para o WhatsApp Click to Chat (gratuito).
// https://faq.whatsapp.com/5913398998672934 — formato https://wa.me/<número>?text=<texto>

export function waLink(phoneDigits: string, text?: string): string {
  const num = (phoneDigits || "").replace(/\D/g, "");
  const base = `https://wa.me/${num}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

type Line = [label: string, value: string | number | null | undefined];

/** Monta um bloco de texto "Rótulo: valor", ignorando campos vazios. */
export function formatLines(lines: Line[]): string {
  return lines
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
    .map(([k, v]) => `*${k}:* ${String(v).trim()}`)
    .join("\n");
}

export const PRODUCTION_LABEL: Record<string, string> = {
  individual: "Produção individual",
  grandes_quantidades: "Produção em grandes quantidades",
};

export type PieceOrder = {
  name: string;
  phone?: string;
  description?: string;
  usageType?: string;
  dimensions?: string;
  material?: string;
  color?: string;
  quantity?: string;
  productionType?: string;
  notes?: string;
  originalImageUrl?: string;
  viewUrl: string;
  files: Record<string, string>;
  generationId: string;
};

export function buildPieceOrderMessage(o: PieceOrder): string {
  const fileLines = Object.entries(o.files)
    .filter(([fmt]) => fmt !== "thumbnail")
    .map(([fmt, url]) => `• ${fmt.toUpperCase()}: ${url}`)
    .join("\n");
  const formats = Object.keys(o.files)
    .filter((f) => f !== "thumbnail")
    .map((f) => f.toUpperCase())
    .join(", ");

  return [
    "Olá Alvo Print 3D! Quero encomendar esta peça criada com IA no vosso site.",
    "",
    formatLines([
      ["Nome", o.name],
      ["Contacto", o.phone],
      ["Descrição da peça", o.description],
      ["Utilização", o.usageType],
      ["Dimensões pretendidas", o.dimensions],
      ["Material", o.material],
      ["Cor", o.color],
      ["Quantidade", o.quantity],
      ["Tipo de produção", o.productionType ? PRODUCTION_LABEL[o.productionType] || o.productionType : ""],
      ["Observações", o.notes],
    ]),
    "",
    `*Modelo 3D (ver em 360°):* ${o.viewUrl}`,
    formats ? `*Formato(s):* ${formats}` : "",
    fileLines ? `*Descarregar modelo:*\n${fileLines}` : "",
    o.originalImageUrl ? `*Fotografia original:* ${o.originalImageUrl}` : "",
    `*Referência:* ${o.generationId.slice(0, 8).toUpperCase()}`,
  ]
    .filter((l) => l !== "")
    .join("\n");
}

export type QuoteMessage = {
  kind: "orcamento" | "empresa" | "produto";
  name: string;
  phone?: string;
  company?: string;
  pieceType?: string;
  dimensions?: string;
  material?: string;
  color?: string;
  quantity?: string;
  deadline?: string;
  productionType?: string;
  description?: string;
  referenceUrls?: string[];
  productName?: string;
  productUrl?: string;
  reference?: string;
};

export function buildQuoteMessage(q: QuoteMessage): string {
  const intro =
    q.kind === "empresa"
      ? "Olá Alvo Print 3D! Gostaria de pedir um orçamento empresarial."
      : q.kind === "produto"
        ? `Olá Alvo Print 3D! Tenho interesse no produto "${q.productName || ""}".`
        : "Olá Alvo Print 3D! Gostaria de pedir um orçamento.";
  const refs = (q.referenceUrls || []).map((u, i) => `• Ficheiro ${i + 1}: ${u}`).join("\n");
  return [
    intro,
    "",
    formatLines([
      ["Nome", q.name],
      ["Empresa", q.company],
      ["Contacto", q.phone],
      ["Produto", q.productUrl],
      ["Tipo de peça", q.pieceType],
      ["Dimensões aproximadas", q.dimensions],
      ["Material", q.material],
      ["Cor", q.color],
      ["Quantidade", q.quantity],
      ["Prazo pretendido", q.deadline],
      ["Tipo de produção", q.productionType ? PRODUCTION_LABEL[q.productionType] || q.productionType : ""],
      ["Descrição", q.description],
    ]),
    refs ? `\n*Ficheiros de referência:*\n${refs}` : "",
    q.reference ? `*Referência:* ${q.reference}` : "",
  ]
    .filter((l) => l !== "")
    .join("\n");
}
