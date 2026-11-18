import { NextResponse } from "next/server";
import { ADMIN_COOKIE, checkPassword, createSessionToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET)
    return NextResponse.json({ error: "Painel não configurado: defina ADMIN_PASSWORD e ADMIN_SESSION_SECRET." }, { status: 503 });
  // pequeno atraso fixo para dificultar tentativas em massa
  await new Promise((r) => setTimeout(r, 600));
  if (!(await checkPassword(password))) return NextResponse.json({ error: "Palavra-passe incorreta." }, { status: 401 });
  const { token, maxAge } = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
