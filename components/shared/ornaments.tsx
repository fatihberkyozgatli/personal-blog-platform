import { cn } from "@/lib/utils/cn";

function Rosette({
  cx,
  cy,
  r = 9,
  petal = "#B5512F",
  core = "#C9A24B",
}: {
  cx: number;
  cy: number;
  r?: number;
  petal?: string;
  core?: string;
}) {
  const petals = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    return <ellipse key={i} cx={px} cy={py} rx={r * 0.55} ry={r * 0.3} fill={petal} transform={`rotate(${(a * 180) / Math.PI} ${px} ${py})`} opacity={0.9} />;
  });
  return (
    <g>
      {petals}
      <circle cx={cx} cy={cy} r={r * 0.5} fill={core} />
      <circle cx={cx} cy={cy} r={r * 0.22} fill="#6E1423" />
    </g>
  );
}

function Leaf({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) {
  return (
    <path
      d={`M ${x} ${y} q ${flip ? -14 : 14} -6 ${flip ? -20 : 20} -20 q ${flip ? -6 : 6} 16 ${flip ? 20 : -20} 20 z`}
      fill="#2E5E4E"
      opacity={0.85}
    />
  );
}

export function CornerSpray({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={cn("h-20 w-20", className)}>
      <path d="M2 98 C 30 90, 50 70, 58 40" fill="none" stroke="#C9A24B" strokeWidth="1.6" opacity="0.8" />
      <Leaf x={26} y={78} />
      <Leaf x={44} y={56} flip />
      <Rosette cx={60} cy={34} r={11} />
      <Rosette cx={20} cy={86} r={7} petal="#6E1423" core="#D8B564" />
    </svg>
  );
}

export function PerchedBird({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 70" aria-hidden="true" className={cn("h-12 w-14", className)}>
      <path d="M10 60 q 18 -34 40 -36 q -8 6 -10 14 q 16 -6 26 4 q -14 0 -20 8 q 10 4 8 14 q -10 -8 -22 -4 q -14 4 -22 -4 z" fill="#1F4E79" opacity="0.9" />
      <circle cx="48" cy="26" r="2.2" fill="#F7EFDD" />
      <path d="M62 26 l 12 -3 l -10 7 z" fill="#C9A24B" />
      <path d="M14 60 q 8 6 18 4" fill="none" stroke="#C9A24B" strokeWidth="1.4" />
    </svg>
  );
}

export function ManuscriptPanel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 110" aria-hidden="true" className={cn("h-28 w-36", className)}>
      <rect x="2" y="2" width="136" height="106" rx="4" fill="#FBF6EA" fillOpacity="0.12" stroke="#C9A24B" strokeWidth="1" strokeOpacity="0.5" />
      <rect x="10" y="10" width="120" height="90" rx="2" fill="none" stroke="#C9A24B" strokeWidth="0.6" opacity="0.5" />
      {Array.from({ length: 7 }, (_, i) => (
        <line key={i} x1="20" y1={22 + i * 11} x2="120" y2={22 + i * 11} stroke="#C9A24B" strokeWidth="1.4" opacity={0.45} strokeDasharray="2 4" />
      ))}
      <Rosette cx={120} cy={20} r={7} />
    </svg>
  );
}
