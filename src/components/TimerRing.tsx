export function TimerRing({
  progress, big, small, tone = "lav", size = 260,
}: { progress: number; big: string; small?: string; tone?: "lav" | "mint"; size?: number }) {
  const r = 100;
  const c = 2 * Math.PI * r;
  const p = Math.min(1, Math.max(0, progress));
  const stroke = tone === "lav" ? "#7C6CF0" : "#2FA67B";
  const track = tone === "lav" ? "#E8E4FF" : "#D5F5E6";
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 240 240" className="absolute inset-0 -rotate-90">
        <circle cx="120" cy="120" r={r} fill="none" stroke={track} strokeWidth="16" />
        <circle
          cx="120" cy="120" r={r} fill="none" stroke={stroke} strokeWidth="16" strokeLinecap="round"
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
