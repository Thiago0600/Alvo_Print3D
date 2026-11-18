import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="tag">Erro 404</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold text-white">Esta página não foi impressa.</h1>
      <p className="mt-3 text-mute">O endereço pode estar errado ou a página foi removida.</p>
      <Link href="/" className="btn btn-primary mt-8">Voltar ao início</Link>
    </div>
  );
}
