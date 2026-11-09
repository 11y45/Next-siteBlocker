import { CATALOG_BY_DOMAIN } from "./catalog";
import type { CategoryId, Rule } from "./types";

/** Week starts on Monday in the UI; the extension uses JS day numbers (0 = Sunday). */
export const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_CAPS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export const WEEKDAYS = [1, 2, 3, 4, 5];
export const WEEKEND = [6, 0];
export const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];

export function daysSummary(days: number[]): string {
  const set = new Set(days);
  if (set.size === 7) return "Every day";
  if (set.size === 5 && WEEKDAYS.every((d) => set.has(d))) return "Weekdays";
  if (set.size === 2 && WEEKEND.every((d) => set.has(d))) return "Weekends";
  return DAY_ORDER.filter((d) => set.has(d)).map((d) => DAY_SHORT[d]).join(", ");
}

export function hoursSummary(r: Pick<Rule, "allDay" | "start" | "end">): string {
  return r.allDay ? "All day" : `${r.start} – ${r.end}`;
}

export function isOvernight(r: Pick<Rule, "allDay" | "start" | "end">): boolean {
  return !r.allDay && r.start > r.end;
}

/** Adult sites are never shown by name in lists. */
export function isAdultDomain(domain: string, sites: Record<string, CategoryId>): boolean {
  return sites[domain] === "adult" || CATALOG_BY_DOMAIN[domain]?.category === "adult";
}
