import { test } from "node:test";
import assert from "node:assert/strict";
import { answer, normalize } from "../src/lib/assistant";
import { buildPieceOrderMessage, buildQuoteMessage, waLink } from "../src/lib/whatsapp";

test("normalize remove acentos e pontuação", () => {
  assert.equal(normalize("Olá! Impressão 3D?"), "ola impressao 3d");
});

test("waLink gera endereço Click to Chat correto", () => {
  assert.equal(waLink("+351 966 381 796"), "https://wa.me/351966381796");
  assert.equal(waLink("351966381796", "Olá & bem-vindo"), "https://wa.me/351966381796?text=Ol%C3%A1%20%26%20bem-vindo");
});

test("mensagem de encomenda inclui todos os dados e links", () => {
  const msg = buildPieceOrderMessage({
    name: "Ana Silva",
    phone: "912345678",
    description: "Suporte de telemóvel",
    usageType: "automovel",
    dimensions: "10 × 5 cm",
    material: "PETG",
    color: "Preto",
    quantity: "2",
    productionType: "individual",
    notes: "Urgente",
    originalImageUrl: "https://x.supabase.co/storage/v1/object/public/media/uploads/a.jpg",
    viewUrl: "https://alvo.pt/modelo/0b7c8e8e-1111-2222-3333-444455556666",
    files: { glb: "https://x/modelo.glb", stl: "https://x/modelo.stl" },
    generationId: "0b7c8e8e-1111-2222-3333-444455556666",
  });
  for (const s of [
    "Ana Silva", "912345678", "Suporte de telemóvel", "10 × 5 cm", "PETG", "Preto", "*Quantidade:* 2",
    "Produção individual", "Urgente", "uploads/a.jpg", "/modelo/0b7c8e8e", "GLB: https://x/modelo.glb",
    "STL: https://x/modelo.stl", "GLB, STL", "0B7C8E8E",
  ])
    assert.ok(msg.includes(s), `falta: ${s}`);
  assert.ok(encodeURIComponent(msg).length < 6000, "mensagem demasiado longa para o wa.me");
});

test("orçamento omite campos vazios", () => {
  const msg = buildQuoteMessage({ kind: "empresa", name: "Rui", company: "Metal Lda", productionType: "grandes_quantidades", color: "" });
  assert.ok(msg.includes("orçamento empresarial"));
  assert.ok(msg.includes("Produção em grandes quantidades"));
  assert.ok(!msg.includes("Cor"));
});

const cases: Array<[string, string]> = [
  ["Olá", "Sou o Filo"],
  ["Como funciona a impressão 3D?", "camada a camada"],
  ["Criar peça com IA", "Meshy"],
  ["A IA acerta sempre?", "não mede a peça real"],
  ["Quanto custa uma peça?", "não dou preços"],
  ["Preços", "não dou preços"],
  ["Quanto tempo demora?", "confirma-o sempre"],
  ["Fazem entregas para o Porto?", "gratuita"],
  ["Enviam para os Açores?", "caso a caso"],
  ["Que materiais?", "PETG"],
  ["Sou uma empresa", "produção em escala"],
  ["Ajude-me a escolher", "O que tem"],
  ["Tenho uma fotografia da peça", "exatamente para isso"],
  ["Tenho um ficheiro 3D", "STL"],
  ["Só tenho uma ideia", "Uma ideia"],
  ["Quero falar com uma pessoa", "WhatsApp"],
];
for (const [q, expect] of cases) {
  test(`assistente: "${q}"`, () => {
    const r = answer(q);
    assert.ok(r.matched, "devia reconhecer a pergunta");
    assert.ok(r.text.includes(expect), `resposta inesperada: ${r.text}`);
  });
}

test("assistente encaminha para WhatsApp quando não sabe", () => {
  const r = answer("qual é a capital da Mongólia");
  assert.equal(r.matched, false);
  assert.ok(r.links?.some((l) => l.wa));
});

test("assistente nunca menciona valores em euros", () => {
  for (const q of ["preço", "quanto custa 100 peças", "é caro?", "valor do envio"]) {
    assert.ok(!/\d+\s?€|€\s?\d+|\d+\s?euros/i.test(answer(q).text), q);
  }
});
