export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 ${className}`}>
      <div className="mb-10 max-w-2xl">
        {eyebrow && <p className="tag mb-3">{eyebrow}</p>}
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h2>
        {intro && <p className="mt-4 text-lg text-mute">{intro}</p>}
      </div>
      {children}
    </section>
  );
}

export function PageHero({ eyebrow, title, intro, children }: { eyebrow: string; title: React.ReactNode; intro?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="layers border-b border-line">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pt-16">
        <p className="tag mb-3">{eyebrow}</p>
        <h1 className="max-w-3xl font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-lg text-mute">{intro}</p>}
        {children}
      </div>
    </div>
  );
}
