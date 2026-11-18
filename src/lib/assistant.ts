// Assistente "Filo" — robô feito de filamento. Respostas e fluxos predefinidos
// (gratuito, sem API). Regra de ouro: nunca inventa preços, prazos nem
// características técnicas — nesses casos encaminha para o WhatsApp.

export type BotLink = { label: string; href: string; wa?: boolean };
export type BotReply = { text: string; chips?: string[]; links?: BotLink[]; matched: boolean };

type Intent = { id: string; keys: string[]; reply: () => Omit<BotReply, "matched"> };

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const WA = (label = "Falar com a equipa"): BotLink => ({ label, href: "", wa: true });

const INTENTS: Intent[] = [
  {
    id: "saudacao",
    keys: ["ola", "bom dia", "boa tarde", "boa noite", "oi", "hello", "hey", "viva"],
    reply: () => ({
      text: "Olá! Sou o Filo, o robô da Alvo Print 3D. Fui impresso camada a camada, por isso tenho paciência para todas as perguntas. Em que posso ajudar?",
      chips: ["Como funciona a impressão 3D?", "Criar peça com IA", "Pedir orçamento", "Entrega"],
    }),
  },
  {
    id: "impressao",
    keys: ["como funciona", "impressao 3d", "imprimir", "o que e impressao", "camada", "impressora", "fdm", "fabricar"],
    reply: () => ({
      text: "A impressão 3D constrói a peça camada a camada, a partir de um modelo digital. Funciona assim connosco: 1) recebemos a sua ideia (fotografia, desenho, ficheiro ou amostra); 2) preparamos o modelo 3D; 3) escolhemos o material adequado ao uso; 4) imprimimos e enviamos.",
      chips: ["Criar peça com IA", "Que materiais?", "Pedir orçamento"],
    }),
  },
  {
    id: "ia",
    keys: ["ia", "inteligencia artificial", "meshy", "fotografia", "foto", "imagem", "modelo 3d", "criar peca", "criar modelo", "gerar"],
    reply: () => ({
      text: "Na área «Criar com IA» carrega uma fotografia da peça e a inteligência artificial (Meshy AI) cria um modelo 3D em poucos minutos. Pode rodá-lo e observá-lo em 360°, gerar novamente se não gostar, e pedir a fabricação com um botão — a mensagem segue para o nosso WhatsApp com o modelo incluído.\n\nDica: foto bem iluminada, peça centrada e fundo liso dão melhores resultados.",
      links: [{ label: "Criar a minha peça com IA", href: "/criar-3d" }],
      chips: ["A IA acerta sempre?", "Pedir orçamento"],
    }),
  },
  {
    id: "ia-qualidade",
    keys: ["acerta", "rigor", "exato", "precisao", "medidas exatas", "qualidade do modelo"],
    reply: () => ({
      text: "A IA dá uma excelente primeira versão, mas não mede a peça real. Antes de imprimir, a nossa equipa revê o modelo e ajusta medidas e encaixes consigo pelo WhatsApp. Para peças técnicas com medidas exatas, diga-nos as dimensões ou envie um desenho.",
      links: [WA()],
    }),
  },
  {
    id: "preco",
    keys: ["preco", "precos", "quanto custa", "custo", "valor", "orcamento", "barato", "caro", "euros", "pagar", "pagamento"],
    reply: () => ({
      text: "Cada peça é diferente — o valor depende do tamanho, do material, do acabamento e da quantidade. Por isso não dou preços de cabeça: prefiro que a equipa lhe faça um orçamento certo. É rápido e sem compromisso.",
      links: [{ label: "Solicitar orçamento", href: "/orcamento" }, WA("Perguntar no WhatsApp")],
    }),
  },
  {
    id: "prazo",
    keys: ["prazo", "quanto tempo", "demora", "quando fica", "rapido", "urgente", "dias", "tempo de entrega"],
    reply: () => ({
      text: "O prazo depende da peça, da quantidade e do material, por isso a equipa confirma-o sempre antes de avançar. Se tiver urgência, diga-o no pedido!",
      links: [WA("Confirmar prazo no WhatsApp")],
    }),
  },
  {
    id: "entrega",
    keys: ["entrega", "envio", "enviar", "portes", "transporte", "correio", "receber", "morada", "continente"],
    reply: () => ({
      text: "Estamos em Évora e a entrega é gratuita para todo o Portugal continental. Para os Açores e a Madeira, as condições são confirmadas caso a caso.",
      links: [{ label: "Entrega e localização", href: "/entrega" }],
      chips: ["Açores e Madeira", "Pedir orçamento"],
    }),
  },
  {
    id: "ilhas",
    keys: ["acores", "madeira", "ilhas", "ilha", "funchal", "ponta delgada"],
    reply: () => ({
      text: "Enviamos também para os Açores e a Madeira, mas as condições de envio são confirmadas caso a caso. Fale connosco e dizemos-lhe tudo.",
      links: [WA("Perguntar envio para as ilhas")],
    }),
  },
  {
    id: "materiais",
    keys: ["material", "materiais", "pla", "petg", "abs", "asa", "tpu", "nylon", "resina", "resistente", "flexivel", "calor", "exterior"],
    reply: () => ({
      text: "Escolhemos o material consoante o uso da peça. Em termos gerais: o PLA é ótimo para peças decorativas; o PETG e o ABS/ASA são mais resistentes (o ASA aguenta melhor o sol); o TPU é flexível. Diga-nos onde a peça vai ser usada e a equipa confirma o material mais indicado.",
      links: [WA("Pedir conselho sobre material")],
    }),
  },
  {
    id: "empresas",
    keys: ["empresa", "empresas", "industrial", "industria", "grandes quantidades", "quantidade", "serie", "lote", "producao em escala", "revenda", "fabrica", "b2b", "parceria"],
    reply: () => ({
      text: "Trabalhamos com empresas: produção em escala, prototipagem, desenvolvimento de peças e peças de substituição para manutenção industrial. Peça um orçamento empresarial e tratamos de tudo diretamente consigo.",
      links: [{ label: "Soluções para empresas", href: "/empresas" }],
    }),
  },
  {
    id: "automovel",
    keys: ["carro", "automovel", "auto", "mota", "suporte", "clip", "peca de carro", "viatura"],
    reply: () => ({
      text: "Fazemos peças para automóveis: suportes, clips, tampas, acessórios e reproduções de peças difíceis de encontrar. O ideal é enviar fotografias e, se possível, medidas.",
      links: [{ label: "Criar a peça com IA", href: "/criar-3d" }, { label: "Pedir orçamento", href: "/orcamento" }],
    }),
  },
  {
    id: "catalogo",
    keys: ["catalogo", "produtos", "loja", "ver pecas", "exemplos", "trabalhos"],
    reply: () => ({
      text: "No catálogo encontra peças que já produzimos, organizadas por categoria. Todas podem ser adaptadas em medida, material e cor.",
      links: [{ label: "Abrir catálogo", href: "/catalogo" }],
    }),
  },
  {
    id: "encomendar",
    keys: ["encomendar", "encomenda", "comprar", "pedido", "como peco", "quero uma peca", "fazer pedido"],
    reply: () => ({
      text: "Há três caminhos: 1) «Criar com IA» a partir de uma fotografia e carregar em «Solicitar esta peça»; 2) escolher um produto do catálogo; 3) preencher o pedido de orçamento. Em todos, a mensagem segue pronta para o nosso WhatsApp.",
      chips: ["Criar peça com IA", "Pedir orçamento", "Catálogo"],
    }),
  },
  {
    id: "escolher",
    keys: ["ajuda", "ajudar", "escolher", "nao sei", "qual servico", "duvida", "opcoes"],
    reply: () => ({
      text: "Vamos lá! O que tem neste momento?",
      chips: ["Tenho uma fotografia da peça", "Tenho um ficheiro 3D", "Só tenho uma ideia", "Sou uma empresa"],
    }),
  },
  {
    id: "tenho-foto",
    keys: ["tenho uma fotografia", "tenho foto", "tenho uma foto"],
    reply: () => ({
      text: "Perfeito — é exatamente para isso que serve a nossa IA. Carregue a fotografia e veja o modelo 3D em minutos.",
      links: [{ label: "Criar com IA", href: "/criar-3d" }],
    }),
  },
  {
    id: "tenho-ficheiro",
    keys: ["ficheiro 3d", "stl", "3mf", "obj", "step", "tenho um ficheiro", "desenho"],
    reply: () => ({
      text: "Ótimo! Envie o ficheiro no pedido de orçamento (aceitamos STL, 3MF, OBJ, PDF e imagens) e a equipa analisa.",
      links: [{ label: "Pedido de orçamento", href: "/orcamento" }],
    }),
  },
  {
    id: "ideia",
    keys: ["so tenho uma ideia", "ideia", "nao tenho foto", "desenhar"],
    reply: () => ({
      text: "Uma ideia é um ótimo começo. Descreva-a no pedido de orçamento — tamanho aproximado, para que serve, cor — e a equipa ajuda a transformá-la numa peça.",
      links: [{ label: "Descrever a minha ideia", href: "/orcamento" }, WA()],
    }),
  },
  {
    id: "localizacao",
    keys: ["onde", "localizacao", "morada", "evora", "loja fisica", "visitar", "levantar"],
    reply: () => ({
      text: "Estamos em Évora. Para combinar levantamentos ou visitas, fale com a equipa pelo WhatsApp.",
      links: [WA()],
    }),
  },
  {
    id: "humano",
    keys: ["humano", "pessoa", "falar com alguem", "atendimento", "whatsapp", "contacto", "telefone", "ligar", "email"],
    reply: () => ({
      text: "Claro! A equipa responde pelo WhatsApp: +351 966 381 796.",
      links: [WA("Abrir WhatsApp")],
    }),
  },
  {
    id: "obrigado",
    keys: ["obrigado", "obrigada", "obg", "valeu", "adeus", "tchau", "ate logo"],
    reply: () => ({
      text: "Foi um prazer! Se precisar, estou aqui no canto — sempre na camada certa. 🧡",
    }),
  },
];

/** Escolhe a melhor intenção pelo número e tamanho das palavras-chave encontradas. */
export function answer(input: string): BotReply {
  const n = ` ${normalize(input)} `;
  const words = n.trim().split(" ");
  // palavras isoladas com 4+ letras aceitam variações (entrega → entregas, enviar → enviam)
  const hit = (k: string) =>
    n.includes(` ${k} `) ||
    (!k.includes(" ") && k.length >= 4 && words.some((w) => w.startsWith(k.slice(0, Math.max(4, k.length - 1)))));
  let best: { intent: Intent; score: number } | null = null;
  for (const it of INTENTS) {
    let score = 0;
    for (const k of it.keys) if (hit(k)) score += k.split(" ").length * 2 + k.length / 10;
    if (score > 0 && (!best || score > best.score)) best = { intent: it, score };
  }
  if (best) return { ...best.intent.reply(), matched: true };
  return {
    text: "Essa pergunta merece uma resposta certa, e não quero inventar. A equipa da Alvo Print 3D responde-lhe pelo WhatsApp.",
    links: [WA("Perguntar à equipa")],
    chips: ["Como funciona a impressão 3D?", "Criar peça com IA", "Pedir orçamento"],
    matched: false,
  };
}

export const GREETING: BotReply = {
  text: "Olá! Sou o Filo 🤖 Posso explicar como funciona a impressão 3D, ajudar a criar a sua peça com IA ou encaminhá-lo para a equipa.",
  chips: ["Ajude-me a escolher", "Criar peça com IA", "Preços", "Entrega"],
  matched: true,
};
