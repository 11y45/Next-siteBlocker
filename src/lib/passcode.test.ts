import { describe, expect, it } from "vitest";
import { generatePasscode } from "./passcode";

describe("generatePasscode", () => {
  it("has the XXXX-XXXX-XXXX-XXXX shape with no look-alike characters", () => {
    for (let i = 0; i < 200; i++) {
      expect(generatePasscode()).toMatch(/^[A-HJKMNP-Z2-9]{4}(-[A-HJKMNP-Z2-9]{4}){3}$/);
    }
  });

  it("does not repeat", () => {
    const seen = new Set(Array.from({ length: 500 }, generatePasscode));
    expect(seen.size).toBe(500);
  });

  it("uses every symbol about equally often (no modulo bias)", () => {
    const counts = new Map<string, number>();
    const N = 4000; // 64,000 symbols over 31 letters: about 2,065 each
    for (let i = 0; i < N; i++) for (const c of generatePasscode().replace(/-/g, "")) counts.set(c, (counts.get(c) ?? 0) + 1);
    const values = [...counts.values()];
    expect(values.length).toBe(31);
    const expected = (N * 16) / 31;
    for (const v of values) expect(Math.abs(v - expected) / expected).toBeLessThan(0.1);
  });
});
