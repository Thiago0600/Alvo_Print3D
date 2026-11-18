"use client";
import { useState } from "react";
import Image from "next/image";

export default function AdminLogin() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(data.error || "Erro ao entrar.");
    window.location.href = "/admin";
  }

  return (
    <div className="bedgrid grid min-h-dvh place-items-center px-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-8">
        <Image src="/brand/logo-dark.png" alt="Alvo Print 3D" width={160} height={155} className="mx-auto h-auto w-32" priority />
        <h1 className="text-center font-display text-xl font-bold text-white">Painel administrativo</h1>
        <div>
          <label className="label" htmlFor="pw">Palavra-passe</label>
          <input id="pw" type="password" className="field" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} required />
        </div>
        {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? "A entrar…" : "Entrar"}</button>
      </form>
    </div>
  );
}
