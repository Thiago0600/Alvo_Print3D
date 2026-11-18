// Sessão do administrador: cookie assinado com HMAC-SHA256 (Web Crypto),
// compatível com o middleware (Edge) e com as rotas de API (Node).

export const ADMIN_COOKIE = "alvo_admin";
const MAX_AGE_S = 60 * 60 * 24 * 7; // 7 dias

const enc = new TextEncoder();

async function hmac(data: string): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) throw new Error("ADMIN_SESSION_SECRET em falta ou demasiado curto.");
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function createSessionToken(): Promise<{ token: string; maxAge: number }> {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_S;
  return { token: `${exp}.${await hmac(`admin.${exp}`)}`, maxAge: MAX_AGE_S };
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!exp || !sig || exp < Math.floor(Date.now() / 1000)) return false;
  try {
    return safeEqual(sig, await hmac(`admin.${exp}`));
  } catch {
    return false;
  }
}

export async function checkPassword(input: string): Promise<boolean> {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || pw.length < 8) return false;
  // compara os HMAC para evitar fugas por tempo de execução
  return safeEqual(await hmac(`pw.${input}`), await hmac(`pw.${pw}`));
}

export async function hashIp(ip: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    enc.encode(`${ip}|${process.env.ADMIN_SESSION_SECRET || "alvo"}`),
  );
  return Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function clientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get("x-nf-client-connection-ip") ||
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    (h.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "0.0.0.0"
  );
}
