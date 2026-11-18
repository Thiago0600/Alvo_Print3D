// Constantes do site. Os dados editáveis (WhatsApp, cidade, etc.) vivem na
// tabela "settings" e podem ser alterados no painel; estes são os valores de
// recurso caso a base de dados ainda não esteja configurada.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export type CompanySettings = {
  name: string;
  whatsapp: string; // apenas dígitos, com indicativo (ex.: 351966381796)
  city: string;
  region: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  islandsNote: string;
  hours?: string;
};

export const DEFAULT_COMPANY: CompanySettings = {
  name: "Alvo Print 3D",
  whatsapp: "351966381796",
  city: "Évora",
  region: "Évora, Portugal",
  email: "",
  instagram: "",
  facebook: "",
  islandsNote:
    "Para os Açores e a Madeira, as condições de envio são confirmadas caso a caso pelo WhatsApp.",
  hours: "",
};

export type MeshySettings = {
  enabled: boolean;
  ai_model: "latest" | "meshy-7.1" | "meshy-6" | "meshy-6-lite";
  should_texture: boolean;
  enable_pbr: boolean;
  should_remesh: boolean;
  target_polycount: number;
  moderation: boolean;
  archive_formats: Array<"glb" | "stl" | "obj" | "fbx" | "usdz" | "3mf">;
  ip_daily_limit: number;
  global_daily_limit: number;
};

export const DEFAULT_MESHY: MeshySettings = {
  enabled: true,
  ai_model: "latest",
  should_texture: true,
  enable_pbr: false,
  should_remesh: true,
  target_polycount: 30000,
  moderation: true,
  archive_formats: ["glb", "stl"],
  ip_daily_limit: 3,
  global_daily_limit: 25,
};

export const USAGE_TYPES = [
  { value: "decorativa", label: "Decorativa" },
  { value: "funcional", label: "Funcional / utilitária" },
  { value: "automovel", label: "Automóvel" },
  { value: "industrial", label: "Industrial" },
  { value: "prototipo", label: "Protótipo" },
  { value: "outro", label: "Outro" },
] as const;

export const MATERIALS = [
  "Ainda não sei — aconselhem-me",
  "PLA",
  "PETG",
  "ABS",
  "ASA",
  "TPU (flexível)",
  "Nylon",
  "Resina",
  "Outro",
];

export const NAV = [
  { href: "/criar-3d", label: "Criar com IA" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/empresas", label: "Empresas" },
  { href: "/entrega", label: "Entrega" },
  { href: "/orcamento", label: "Orçamento" },
];
