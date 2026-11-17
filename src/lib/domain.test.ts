import { describe, expect, it } from "vitest";
import { normalizeDomain } from "./domain";

// The same table lives in the extension's test/domain.test.js: the two copies of normalizeDomain must agree.
export const CASES: [string, string | null][] = [
  ["https://www.Instagram.com/foo?x=1", "instagram.com"],
  ["YouTube.com", "youtube.com"],
  ["  m.youtube.com  ", "m.youtube.com"],
  ["http://example.org:8080/a", "example.org"],
  ["reddit.com.", "reddit.com"],
  ["localhost", null],
  ["not a domain", null],
  ["", null],
  ["https://", null],
  ["a.b", null],
];

describe("normalizeDomain", () => {
  it.each(CASES)("%j -> %j", (input, expected) => {
    expect(normalizeDomain(input)).toBe(expected);
  });
});
