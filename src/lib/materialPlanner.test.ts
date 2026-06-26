import { describe, it, expect } from "vitest";
import { planAscension, ASCENSION_PHASES } from "./materialPlanner";

describe("planAscension", () => {
  it("includes all 6 phases from 1 to 90", () => {
    const p = planAscension(1, 90);
    expect(p.phases).toHaveLength(6);
    expect(p.shellCredits).toBe(
      ASCENSION_PHASES.reduce((a, x) => a + x.shellCredits, 0),
    );
  });

  it("includes only the phase gated within the range", () => {
    const p = planAscension(50, 60);
    expect(p.phases).toHaveLength(1);
    expect(p.phases[0].atLevel).toBe(50);
  });

  it("returns nothing when no gate is crossed", () => {
    const p = planAscension(41, 49);
    expect(p.phases).toHaveLength(0);
    expect(p.shellCredits).toBe(0);
  });

  it("is order-insensitive for from/to", () => {
    expect(planAscension(90, 1).phases).toHaveLength(6);
  });
});
