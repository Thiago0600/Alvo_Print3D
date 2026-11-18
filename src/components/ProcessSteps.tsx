// Demonstração animada do processo: Fotografia → Modelo 3D (IA) → Impressão → Entrega

const STEPS = [
  { n: "01", t: "Envie uma fotografia", d: "Tire uma foto da peça que quer reproduzir ou carregue uma imagem de referência." },
  { n: "02", t: "A IA cria o modelo 3D", d: "Em poucos minutos vê a peça em 3D, pode rodá-la e observá-la em 360°." },
  { n: "03", t: "Imprimimos camada a camada", d: "Afinamos o modelo, escolhemos o material certo e produzimos a peça." },
  { n: "04", t: "Entregamos em sua casa", d: "Envio gratuito para todo o Portugal continental." },
];

function StepArt({ i }: { i: number }) {
  if (i === 0)
    return (
      <svg viewBox="0 0 120 90" className="h-full w-full" aria-hidden>
        <rect x="22" y="14" width="76" height="60" rx="8" fill="none" stroke="#3a3f47" strokeWidth="2" />
        <circle cx="60" cy="44" r="16" fill="none" stroke="#ff6b0b" strokeWidth="2.5">
          <animate attributeName="r" values="14;17;14" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="60" cy="44" r="6" fill="#ff6b0b" />
        <rect x="74" y="20" width="14" height="6" rx="2" fill="#3a3f47" />
      </svg>
    );
  if (i === 1)
    return (
      <svg viewBox="0 0 120 90" className="h-full w-full" aria-hidden>
        <g stroke="#ff6b0b" strokeWidth="2" fill="none">
          <path d="M60 14 L92 31 L92 63 L60 80 L28 63 L28 31 Z" strokeDasharray="200" strokeDashoffset="200">
            <animate attributeName="stroke-dashoffset" values="200;0;0" dur="3s" repeatCount="indefinite" />
          </path>
          <path d="M28 31 L60 48 L92 31 M60 48 L60 80" stroke="#8b919c" strokeDasharray="90" strokeDashoffset="90">
            <animate attributeName="stroke-dashoffset" values="90;90;0" dur="3s" repeatCount="indefinite" />
          </path>
        </g>
      </svg>
    );
  if (i === 2)
    return (
      <svg viewBox="0 0 120 90" className="h-full w-full" aria-hidden>
        <rect x="18" y="78" width="84" height="4" rx="2" fill="#3a3f47" />
        {Array.from({ length: 8 }).map((_, k) => (
          <rect key={k} x={38 - (k % 2)} y={72 - k * 6} width={44 + (k % 2) * 2} height="4.5" rx="2" fill="#ff6b0b" opacity={0.55 + k * 0.05}>
            <animate attributeName="width" values={`0;${44 + (k % 2) * 2};${44 + (k % 2) * 2}`} keyTimes="0;0.5;1" dur="4s" begin={`${k * 0.4}s`} repeatCount="indefinite" />
          </rect>
        ))}
        <g>
          <animateTransform attributeName="transform" type="translate" values="0 0;40 0;0 0" dur="1.2s" repeatCount="indefinite" />
          <rect x="30" y="10" width="18" height="12" rx="2" fill="#2a2e35" />
          <path d="M35 22 L43 22 L39 29 Z" fill="#d7a65a" />
        </g>
      </svg>
    );
  return (
    <svg viewBox="0 0 120 90" className="h-full w-full" aria-hidden>
      <g>
        <animateTransform attributeName="transform" type="translate" values="-10 0;10 0;-10 0" dur="3s" repeatCount="indefinite" />
        <rect x="24" y="30" width="46" height="30" rx="4" fill="none" stroke="#ff6b0b" strokeWidth="2.5" />
        <path d="M70 38 L86 38 L96 48 L96 60 L70 60 Z" fill="none" stroke="#ff6b0b" strokeWidth="2.5" />
        <circle cx="38" cy="64" r="6" fill="#121418" stroke="#c9ced6" strokeWidth="2" />
        <circle cx="84" cy="64" r="6" fill="#121418" stroke="#c9ced6" strokeWidth="2" />
      </g>
      <path d="M10 76 H110" stroke="#3a3f47" strokeWidth="2" strokeDasharray="6 6">
        <animate attributeName="stroke-dashoffset" values="0;-24" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

export function ProcessSteps() {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((s, i) => (
        <li key={s.n} className="card relative overflow-hidden p-6">
          <div className="mb-5 h-24">
            <StepArt i={i} />
          </div>
          <p className="font-mono text-xs text-orange">{s.n}</p>
          <h3 className="mt-1 font-display text-lg font-bold text-white">{s.t}</h3>
          <p className="mt-2 text-sm text-mute">{s.d}</p>
        </li>
      ))}
    </ol>
  );
}
