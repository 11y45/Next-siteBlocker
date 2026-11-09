import type { Session } from "./types";

/** Milliseconds left in the current phase (frozen while paused). */
export function sessionLeft(s: Session, now: number): number {
  return Math.max(0, s.phaseEndsAt - (s.pausedAt ?? now));
}

/** 0..1 progress through the current phase (frozen while paused). */
export function sessionProgress(s: Session, now: number): number {
  const ref = s.pausedAt ?? now;
  return Math.min(1, Math.max(0, (ref - s.phaseStartedAt) / (s.phaseEndsAt - s.phaseStartedAt)));
}

export function mmss(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${p(m)}:${p(sec)}` : `${p(m)}:${p(sec)}`;
}

export function humanDuration(ms: number): string {
  const min = Math.max(0, Math.round(ms / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 48) return `${h} h ${min % 60 ? `${min % 60} min` : ""}`.trim();
  return `${Math.round(h / 24)} days`;
}

export function minutesLabel(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function dayKey(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function lastDays(n: number, now = Date.now()): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const t = new Date(now);
    t.setDate(t.getDate() - i);
    out.push({ key: dayKey(t.getTime()), label: t.toLocaleDateString("en", { weekday: "short" }) });
  }
  return out;
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
