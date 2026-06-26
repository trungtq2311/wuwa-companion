import type { PullRecord } from "./api";

export interface FiveStar {
  name: string;
  pity: number;
  time: string;
  resourceType: string;
}

export interface PoolStats {
  poolType: number;
  total: number;
  fiveStarCount: number;
  fourStarCount: number;
  currentPity5: number;
  currentPity4: number;
  fiveStars: FiveStar[];
  avgPity5: number;
}

/** Compute pity/stats for one banner. `records` may be in any order. */
export function poolStats(poolType: number, records: PullRecord[]): PoolStats {
  // oldest-first for gap counting
  const ordered = [...records].sort((a, b) => (a.time < b.time ? -1 : 1));
  let sinceFive = 0;
  let sinceFour = 0;
  const fiveStars: FiveStar[] = [];
  let fourStarCount = 0;

  for (const r of ordered) {
    sinceFive++;
    sinceFour++;
    if (r.qualityLevel >= 5) {
      fiveStars.push({
        name: r.name,
        pity: sinceFive,
        time: r.time,
        resourceType: r.resourceType,
      });
      sinceFive = 0;
      sinceFour = 0;
    } else if (r.qualityLevel === 4) {
      fourStarCount++;
      sinceFour = 0;
    }
  }

  const avgPity5 = fiveStars.length
    ? fiveStars.reduce((a, f) => a + f.pity, 0) / fiveStars.length
    : 0;

  return {
    poolType,
    total: ordered.length,
    fiveStarCount: fiveStars.length,
    fourStarCount,
    currentPity5: sinceFive,
    currentPity4: sinceFour,
    fiveStars: fiveStars.reverse(), // newest-first for display
    avgPity5,
  };
}

export function allPoolStats(pulls: PullRecord[]): PoolStats[] {
  const byPool = new Map<number, PullRecord[]>();
  for (const p of pulls) {
    const arr = byPool.get(p.poolType) ?? [];
    arr.push(p);
    byPool.set(p.poolType, arr);
  }
  return [...byPool.entries()]
    .map(([poolType, recs]) => poolStats(poolType, recs))
    .sort((a, b) => a.poolType - b.poolType);
}

/** Unique resonator names the player has pulled (for roster derivation). */
export function pulledResonatorNames(pulls: PullRecord[]): string[] {
  const set = new Set<string>();
  for (const p of pulls) {
    if (p.resourceType === "Resonators") set.add(p.name);
  }
  return [...set];
}
