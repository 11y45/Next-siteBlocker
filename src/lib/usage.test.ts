import { describe, expect, it } from "vitest";
import { aggregate, fmtDuration, percentChange, type UsageData } from "./usage";

const hours = (h: number, ms: number) => Array.from({ length: 24 }, (_, i) => (i === h ? ms : 0));
const data: UsageData = {
  since: null,
  tracking: true,
  categories: { "youtube.com": "entertainment", "github.com": "productivity" },
  days: {
    "2026-11-16": { sites: { "youtube.com": 600000, "github.com": 1800000 }, hours: hours(10, 2400000) },
    "2026-11-17": { sites: { "youtube.com": 300000, "unknown.dev": 60000 }, hours: hours(10, 360000) },
  },
};

describe("aggregate", () => {
  it("adds up sites, categories and hours, most time first", () => {
    const a = aggregate(data, ["2026-11-16", "2026-11-17", "2026-11-18"]);
    expect(a.total).toBe(2760000);
    expect(a.sites[0]).toEqual(["github.com", 1800000]);
    expect(a.sites.find(([s]) => s === "youtube.com")?.[1]).toBe(900000);
    expect(a.categories.find(([c]) => c === "other")?.[1]).toBe(60000); // not in the map -> other
    expect(a.hours[10]).toBe(2760000);
    expect(a.daysWithData).toBe(2);
  });

  it("handles missing data", () => {
    expect(aggregate(null, ["2026-11-16"]).total).toBe(0);
  });
});

describe("fmtDuration", () => {
  it("formats", () => {
    expect(fmtDuration(0)).toBe("0m");
    expect(fmtDuration(30000)).toBe("<1m");
    expect(fmtDuration(45 * 60000)).toBe("45m");
    expect(fmtDuration((2 * 60 + 14) * 60000)).toBe("2h 14m");
    expect(fmtDuration(60 * 60000)).toBe("1h 00m");
  });
});

describe("percentChange", () => {
  it("compares with the previous period", () => {
    expect(percentChange(150, 100)).toBe(50);
    expect(percentChange(50, 100)).toBe(-50);
    expect(percentChange(10, 0)).toBeNull();
  });
});
