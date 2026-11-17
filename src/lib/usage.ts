import type { CategoryId } from "./types";

/** Milliseconds spent per site for one day, plus a total per hour of the day. */
export interface UsageDay { sites: Record<string, number>; hours: number[] }

export interface UsageData {
  days: Record<string, UsageDay>;
  categories: Record<string, CategoryId>;
  since: number | null;
  tracking: boolean;
}

export type Grain = "day" | "week" | "month" | "year";

export const GRAINS: { value: Grain; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

const DAY = 86400000;
const MAX_PAGES: Record<Grain, number> = { day: 120, week: 104, month: 60, year: 6 };

export function dayKey(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const parseKey = (key: string): Date => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const startOfDay = (ts: number) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d; };
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const keysBetween = (from: Date, to: Date): string[] => {
  const out: string[] = [];
  for (let d = new Date(from); d <= to; d = addDays(d, 1)) out.push(dayKey(d.getTime()));
  return out;
};

/** One page of the swipeable chart: a day, a calendar week (Mon to Sun), a calendar month or a calendar year. */
export interface Period {
  id: string;
  grain: Grain;
  start: Date;
  end: Date;
  keys: string[];        // every date in the period, oldest first
  title: string;         // "Nov 10 – 16, 2026"
  sub: string;           // "This week"
  isCurrent: boolean;
  daysElapsed: number;   // days of the period that have actually happened so far
}

function periodStart(grain: Grain, ts: number): Date {
  const d = startOfDay(ts);
  if (grain === "week") d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  if (grain === "month") d.setDate(1);
  if (grain === "year") { d.setMonth(0); d.setDate(1); }
  return d;
}

function periodEnd(grain: Grain, start: Date): Date {
  if (grain === "day") return new Date(start);
  if (grain === "week") return addDays(start, 6);
  if (grain === "month") return new Date(start.getFullYear(), start.getMonth() + 1, 0);
  return new Date(start.getFullYear(), 11, 31);
}

const ago = (n: number, unit: string) => (n === 1 ? `Last ${unit}` : `${n} ${unit}s ago`);

function describe(grain: Grain, start: Date, end: Date, back: number): { title: string; sub: string } {
  const f = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en", o);
  if (grain === "day") {
    return { title: f(start, { weekday: "long", day: "numeric", month: "long" }), sub: back === 0 ? "Today" : back === 1 ? "Yesterday" : `${back} days ago` };
  }
  if (grain === "week") {
    const sameMonth = start.getMonth() === end.getMonth();
    const title = sameMonth ? `${f(start, { month: "short", day: "numeric" })} – ${end.getDate()}, ${end.getFullYear()}` : `${f(start, { month: "short", day: "numeric" })} – ${f(end, { month: "short", day: "numeric" })}, ${end.getFullYear()}`;
    return { title, sub: back === 0 ? "This week" : ago(back, "week") };
  }
  if (grain === "month") return { title: f(start, { month: "long", year: "numeric" }), sub: back === 0 ? "This month" : ago(back, "month") };
  return { title: String(start.getFullYear()), sub: back === 0 ? "This year so far" : back === 1 ? "Last year" : `${back} years ago` };
}

/** All pages for a grain, oldest first. The last page is the current period. Starts where your data starts. */
export function buildPeriods(grain: Grain, now: number, since: number | null): Period[] {
  const current = periodStart(grain, now);
  const first = since ? periodStart(grain, since) : current;
  const pages: Date[] = [];
  const step = (d: Date, n: number) => {
    const x = new Date(d);
    if (grain === "day") x.setDate(x.getDate() + n);
    else if (grain === "week") x.setDate(x.getDate() + 7 * n);
    else if (grain === "month") x.setMonth(x.getMonth() + n);
    else x.setFullYear(x.getFullYear() + n);
    return x;
  };
  for (let d = new Date(current), i = 0; d >= first && i < MAX_PAGES[grain]; d = step(d, -1), i++) pages.unshift(new Date(d));

  const today = startOfDay(now);
  return pages.map((start, i) => {
    const end = periodEnd(grain, start);
    const back = pages.length - 1 - i;
    const isCurrent = back === 0;
    const keys = keysBetween(start, end);
    const { title, sub } = describe(grain, start, end, back);
    const elapsed = isCurrent ? Math.round((today.getTime() - start.getTime()) / DAY) + 1 : keys.length;
    return { id: dayKey(start.getTime()), grain, start, end, keys, title, sub, isCurrent, daysElapsed: elapsed };
  });
}

/** One bar of a chart. For a day it is an hour; otherwise it is a date or a month, which can be tapped to filter. */
export interface Bucket { label: string; tip: string; keys: string[]; ms: number; current: boolean }

export function hourLabel(h: number): string {
  return `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? "AM" : "PM"}`;
}

export function bucketsFor(period: Period, data: UsageData | null, now: number): Bucket[] {
  const dayMs = (key: string) => Object.values(data?.days[key]?.sites ?? {}).reduce((a, b) => a + b, 0);
  const f = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en", o);

  if (period.grain === "day") {
    const hours = data?.days[period.keys[0]]?.hours ?? new Array(24).fill(0);
    const nowHour = period.isCurrent ? new Date(now).getHours() : -1;
    return hours.map((ms, h) => ({ label: h % 6 === 0 ? hourLabel(h).replace(" ", "") : "", tip: hourLabel(h), keys: [], ms, current: h === nowHour }));
  }
  if (period.grain === "year") {
    return Array.from({ length: 12 }, (_, m) => {
      const keys = period.keys.filter((k) => parseKey(k).getMonth() === m);
      const ms = keys.reduce((a, k) => a + dayMs(k), 0);
      const d = new Date(period.start.getFullYear(), m, 1);
      return { label: f(d, { month: "short" }), tip: f(d, { month: "long" }), keys, ms, current: period.isCurrent && m === new Date(now).getMonth() };
    });
  }
  const todayKey = dayKey(now);
  return period.keys.map((key, i) => {
    const d = parseKey(key);
    const label = period.grain === "week" ? f(d, { weekday: "short" }) : i === 0 || (i + 1) % 5 === 0 ? String(d.getDate()) : "";
    return { label, tip: f(d, { weekday: "short", day: "numeric", month: "short" }), keys: [key], ms: dayMs(key), current: key === todayKey };
  });
}

export interface Aggregate {
  total: number;
  sites: [string, number][];                 // most time first
  categories: [CategoryId, number][];        // most time first
  hours: number[];                           // 24 totals
  daysWithData: number;
}

export function aggregate(data: UsageData | null, keys: string[]): Aggregate {
  const sites: Record<string, number> = {};
  const cats: Partial<Record<CategoryId, number>> = {};
  const hours = new Array(24).fill(0) as number[];
  let total = 0;
  let daysWithData = 0;
  for (const key of keys) {
    const day = data?.days[key];
    if (!day) continue;
    let dayTotal = 0;
    for (const [site, ms] of Object.entries(day.sites)) {
      sites[site] = (sites[site] ?? 0) + ms;
      const c = data?.categories[site] ?? "other";
      cats[c] = (cats[c] ?? 0) + ms;
      dayTotal += ms;
    }
    day.hours.forEach((ms, h) => { hours[h] += ms; });
    total += dayTotal;
    if (dayTotal > 0) daysWithData++;
  }
  return {
    total,
    sites: Object.entries(sites).sort((a, b) => b[1] - a[1]),
    categories: (Object.entries(cats) as [CategoryId, number][]).sort((a, b) => b[1] - a[1]),
    hours,
    daysWithData,
  };
}

export interface Recap {
  total: number;
  daysTracked: number;
  avgPerTrackedDay: number;
  fullDays: number;                          // total expressed in 24-hour days
  busiestMonth: { label: string; ms: number } | null;
  quietestMonth: { label: string; ms: number } | null;
  busiestDay: { key: string; ms: number } | null;
  heat: { key: string; ms: number }[];       // every day of the year, in order
  longestStreak: number;                     // most days in a row with any time tracked
}

export function recapFor(period: Period, data: UsageData | null, now: number): Recap {
  const agg = aggregate(data, period.keys);
  const buckets = bucketsFor(period, data, now);
  const heat = period.keys.map((key) => ({ key, ms: Object.values(data?.days[key]?.sites ?? {}).reduce((a, b) => a + b, 0) }));
  const withData = buckets.filter((b) => b.ms > 0);
  const pick = (cmp: (a: Bucket, b: Bucket) => number) => (withData.length ? [...withData].sort(cmp)[0] : null);
  const hi = pick((a, b) => b.ms - a.ms);
  const lo = withData.length > 1 ? pick((a, b) => a.ms - b.ms) : null;   // the *completed* quietest, only meaningful with 2+ months
  const topDay = heat.reduce<{ key: string; ms: number } | null>((m, d) => (d.ms > (m?.ms ?? 0) ? d : m), null);
  let streak = 0, best = 0;
  for (const d of heat) { streak = d.ms > 0 ? streak + 1 : 0; best = Math.max(best, streak); }
  return {
    total: agg.total,
    daysTracked: agg.daysWithData,
    avgPerTrackedDay: agg.daysWithData ? agg.total / agg.daysWithData : 0,
    fullDays: agg.total / 86400000,
    busiestMonth: hi ? { label: hi.tip, ms: hi.ms } : null,
    quietestMonth: lo ? { label: lo.tip, ms: lo.ms } : null,
    busiestDay: topDay && topDay.ms > 0 ? topDay : null,
    heat,
    longestStreak: best,
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

export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}
