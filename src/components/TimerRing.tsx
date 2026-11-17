export function TimerRing({
  progress, big, small, tone = "lav", size = 260,
}: { progress: number; big: string; small?: string; tone?: "lav" | "mint"; size?: number }) {
  const r = 100;
  const c = 2 * Math.PI * r;
  const p = Math.min(1, Math.max(0, progress));
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 240 240" className="absolute inset-0 -rotate-90">
        <circle cx="120" cy="120" r={r} fill="none" strokeWidth="16" className={tone === "lav" ? "stroke-lavender-100" : "stroke-mint-100"} />
        <circle
          cx="120" cy="120" r={r} fill="none" strokeWidth="16" strokeLinecap="round" className={tone === "lav" ? "stroke-lavender-500" : "stroke-mint-500"}
          strokeDasharray={c} strokeDashoffset={c * (1 - p)} style={{ transition: "stroke-dashoffset 0.9s linear" }}
        />
      </svg>
      <div className="text-center">
        <p className="text-5xl font-bold tabular-nums tracking-tight text-ink">{big}</p>
        {small && <p className="mt-1 text-sm font-medium text-muted">{small}</p>}
      </div>
    </div>
  );
}
