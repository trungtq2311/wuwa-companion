/**
 * Character ascension planner (APPROXIMATE).
 *
 * WuWa characters ascend in 6 phases gated at levels 20/40/50/60/70/80.
 * Exact material counts vary by version; the table below is a reasonable
 * estimate for planning farming, not exact in-game data. Always labelled
 * as an estimate in the UI.
 */

export interface AscensionPhase {
  index: number;
  /** Level gate that unlocks this phase. */
  atLevel: number;
  /** Level cap after completing it. */
  capAfter: number;
  shellCredits: number;
  tacetCore: number; // boss drop
  specimen: number; // regional collectible
  commonDrop: number; // enemy drop
}

export const ASCENSION_PHASES: AscensionPhase[] = [
  { index: 1, atLevel: 20, capAfter: 40, shellCredits: 5000, tacetCore: 4, specimen: 4, commonDrop: 4 },
  { index: 2, atLevel: 40, capAfter: 50, shellCredits: 10000, tacetCore: 4, specimen: 8, commonDrop: 12 },
  { index: 3, atLevel: 50, capAfter: 60, shellCredits: 15000, tacetCore: 8, specimen: 12, commonDrop: 12 },
  { index: 4, atLevel: 60, capAfter: 70, shellCredits: 20000, tacetCore: 12, specimen: 16, commonDrop: 16 },
  { index: 5, atLevel: 70, capAfter: 80, shellCredits: 40000, tacetCore: 12, specimen: 20, commonDrop: 20 },
  { index: 6, atLevel: 80, capAfter: 90, shellCredits: 80000, tacetCore: 16, specimen: 24, commonDrop: 24 },
];

export interface MaterialTotals {
  phases: AscensionPhase[];
  shellCredits: number;
  tacetCore: number;
  specimen: number;
  commonDrop: number;
}

/**
 * Phases that must be completed to go from `from` to `to` level, plus totals.
 * A phase counts if its gate level is within [from, to).
 */
export function planAscension(from: number, to: number): MaterialTotals {
  const lo = Math.max(1, Math.min(from, to));
  const hi = Math.max(from, to);
  const phases = ASCENSION_PHASES.filter(
    (p) => p.atLevel >= lo && p.atLevel < hi,
  );
  return {
    phases,
    shellCredits: phases.reduce((a, p) => a + p.shellCredits, 0),
    tacetCore: phases.reduce((a, p) => a + p.tacetCore, 0),
    specimen: phases.reduce((a, p) => a + p.specimen, 0),
    commonDrop: phases.reduce((a, p) => a + p.commonDrop, 0),
  };
}
