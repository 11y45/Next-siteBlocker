import type { CategoryId } from "./types";

/** Milliseconds spent per site for one day, plus a total per hour of the day. */
export interface UsageDay { sites: Record<string, number>; hours: number[] }

export interface UsageData {
  days: Record<string, UsageDay>;
  categories: Record<string, CategoryId>;
  since: number | null;
  tracking: boolean;
}

export type Range = "today" | "yesterday" | "week" | "month";

export const RANGES: { value: Range; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "7 days" },
  { value: "month", label: "30 days" },
];

const DAY = 86400000;

export function dayKey(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Date keys of a range, oldest first. `shift` moves it back by whole ranges (1 = the period before). */
export function rangeKeys(range: Range, now: number, shift = 0): string[] {
  const n = range === "week" ? 7 : range === "month" ? 30 : 1;
  const end = now - (range === "yesterday" ? 1 : 0) * DAY - shift * n * DAY;
  return Array.from({ length: n }, (_, i) => dayKey(end - (n - 1 - i) * DAY));
}

export interface Aggregate {
  total: number;
  sites: [string, number][];                 // most time first
  categories: [CategoryId, number][];        // most time first
  perDay: { key: string; ms: number }[];     // one entry per day of the range, oldest first
  hours: number[];                           // 24 totals
}

export function aggregate(data: UsageData | null, keys: string[]): Aggregate {
  const sites: Record<string, number> = {};
  const cats: Partial<Record<CategoryId, number>> = {};
  const hours = new Array(24).fill(0) as number[];
  const perDay: { key: string; ms: number }[] = [];
  let total = 0;
  for (const key of keys) {
    const day = data?.days[key];
    let dayTotal = 0;
    if (day) {
      for (const [site, ms] of Object.entries(day.sites)) {
        sites[site] = (sites[site] ?? 0) + ms;
        const c = data?.categories[site] ?? "other";
        cats[c] = (cats[c] ?? 0) + ms;
        dayTotal += ms;
      }
      day.hours.forEach((ms, h) => { hours[h] += ms; });
    }
    perDay.push({ key, ms: dayTotal });
    total += dayTotal;
  }
  return {
    total,
    sites: Object.entries(sites).sort((a, b) => b[1] - a[1]),
    categories: (Object.entries(cats) as [CategoryId, number][]).sort((a, b) => b[1] - a[1]),
    perDay,
    hours,
  };
}

/** "2h 14m", "45m", "<1m", "0m" */
export function fmtDuration(ms: number): string {
  if (ms <= 0) return "0m";
  if (ms < 60000) return "<1m";
  const m = Math.round(ms / 60000);
  const h = Math.floor(m / 60);
  return h ? `${h}h ${String(m % 60).padStart(2, "0")}m` : `${m}m`;
}

/** "3 PM" style label for an hour 0-23 */
export function hourLabel(h: number): string {
  const suffix = h < 12 ? "AM" : "PM";
  return `${h % 12 === 0 ? 12 : h % 12} ${suffix}`;
}

export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}
