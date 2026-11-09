import { CATALOG_BY_DOMAIN } from "./catalog";
import type { CategoryId } from "./types";

// What new users see first. Order matters: later ones are the first to be replaced by personal picks.
const DEFAULTS = ["youtube.com", "instagram.com", "facebook.com", "reddit.com", "netflix.com", "tiktok.com"];

export interface Shortcut {
  domain: string;
  name: string;
  personal: boolean;
  category: CategoryId;
}

const pretty = (domain: string) => {
  const label = domain.split(".")[0];
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/**
 * Up to `max` one-click shortcuts.
 * Sites you add by hand again and again (2+ times) take the places of the defaults, most frequent first,
 * so "Amazon" can replace "Netflix" if that's what you actually block. Already-blocked sites are skipped,
 * and adult sites are never suggested.
 */
export function buildShortcuts(blocked: Record<string, CategoryId>, counts: Record<string, number>, max = 6): Shortcut[] {
  const out: Shortcut[] = [];
  const push = (domain: string, personal: boolean) => {
    const known = CATALOG_BY_DOMAIN[domain];
    out.push({ domain, personal, name: known?.name ?? pretty(domain), category: known?.category ?? "other" });
  };

  Object.entries(counts)
    .filter(([d, n]) => n >= 2 && !blocked[d] && CATALOG_BY_DOMAIN[d]?.category !== "adult")
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .forEach(([d]) => push(d, true));

  for (const d of DEFAULTS) {
    if (out.length >= max) break;
    if (!blocked[d] && !out.some((o) => o.domain === d)) push(d, false);
  }
  return out;
}
