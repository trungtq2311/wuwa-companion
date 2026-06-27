import { describe, it, expect } from "vitest";
import {
  fiveStarRate,
  computeOdds,
  guaranteedPulls,
  HARD_PITY,
} from "./gachaOdds";

describe("fiveStarRate", () => {
  it("is base 0.8% before soft pity", () => {
    expect(fiveStarRate(0)).toBeCloseTo(0.008);
    expect(fiveStarRate(60)).toBeCloseTo(0.008);
  });
  it("guarantees a 5★ at hard pity", () => {
    expect(fiveStarRate(HARD_PITY - 1)).toBe(1);
  });
  it("ramps up during soft pity", () => {
    expect(fiveStarRate(70)).toBeGreaterThan(0.008);
    expect(fiveStarRate(75)).toBeGreaterThan(fiveStarRate(70));
  });
});

describe("computeOdds", () => {
  it("returns ~0 for zero pulls", () => {
    const r = computeOdds({ pulls: 0, currentPity: 0, guaranteed: false });
    expect(r.limited).toBe(0);
    expect(r.anyFiveStar).toBe(0);
  });
  it("guarantees a limited within 2 hard pities from scratch", () => {
    const r = computeOdds({ pulls: 160, currentPity: 0, guaranteed: false });
    expect(r.limited).toBeGreaterThan(0.999);
  });
  it("guaranteed flag makes one hard pity certain for the limited", () => {
    const r = computeOdds({ pulls: HARD_PITY, currentPity: 0, guaranteed: true });
    expect(r.limited).toBeGreaterThan(0.999);
  });
  it("more pulls never decreases the limited chance", () => {
    const a = computeOdds({ pulls: 10, currentPity: 0, guaranteed: false });
    const b = computeOdds({ pulls: 20, currentPity: 0, guaranteed: false });
    expect(b.limited).toBeGreaterThanOrEqual(a.limited);
  });
});

describe("guaranteedPulls", () => {
  it("needs up to 80 when already guaranteed", () => {
    expect(guaranteedPulls(0, true)).toBe(80);
  });
  it("needs up to 160 worst case on a fresh 50/50", () => {
    expect(guaranteedPulls(0, false)).toBe(160);
  });
  it("accounts for existing pity", () => {
    expect(guaranteedPulls(30, true)).toBe(50);
  });
});
