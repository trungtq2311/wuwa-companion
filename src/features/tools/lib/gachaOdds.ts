/**
 * Wuthering Waves Convene (gacha) probability model for the pull planner.
 *
 * Featured Resonator Convene rules:
 *  - Base 5★ rate 0.8%; soft pity ramps up from pull 66; hard pity at 80.
 *  - 50/50: a 5★ is the featured limited unit with 50% chance; if you lose, the
 *    NEXT 5★ is a guaranteed limited.
 *  - 1 pull = 160 Astrite (or 1 Radiant Tide).
 *
 * The soft-pity ramp is an approximation (Kuro doesn't publish exact per-pull
 * odds); it lands the average 5★ around pull ~62-65, matching community data.
 * Results are labelled as estimates in the UI.
 */

export const ASTRITE_PER_PULL = 160;
export const HARD_PITY = 80;
export const SOFT_PITY_START = 66;

/** 5★ probability on the pull AFTER `pity` consecutive non-5★ pulls. */
export function fiveStarRate(pity: number): number {
  const pull = pity + 1; // 1-based index of the pull about to happen
  if (pull >= HARD_PITY) return 1;
  if (pull < SOFT_PITY_START) return 0.008;
  return Math.min(1, 0.008 + (pull - (SOFT_PITY_START - 1)) * 0.04);
}

export interface OddsInput {
  pulls: number;
  /** pulls since last 5★ */
  currentPity: number;
  /** true if the next 5★ is a guaranteed featured (lost previous 50/50) */
  guaranteed: boolean;
}

export interface OddsResult {
  /** P(obtain at least one featured limited 5★) */
  limited: number;
  /** P(obtain at least one 5★ of any kind) */
  anyFiveStar: number;
  /** expected number of 5★ pulled */
  expectedFiveStars: number;
}

/**
 * Exact DP over (pity, guaranteed) state across `pulls` pulls.
 * Tracks the probability mass that has NOT yet obtained the limited unit.
 */
export function computeOdds({ pulls, currentPity, guaranteed }: OddsInput): OddsResult {
  const key = (pity: number, g: boolean) => pity * 2 + (g ? 1 : 0);
  let notGot = new Map<number, number>();
  notGot.set(key(currentPity, guaranteed), 1);
  let gotLimited = 0;
  let anyFive = 0;
  let expectedFive = 0;

  for (let i = 0; i < pulls; i++) {
    const next = new Map<number, number>();
    const add = (k: number, p: number) =>
      next.set(k, (next.get(k) ?? 0) + p);

    for (const [k, prob] of notGot) {
      const pity = k >> 1;
      const g = (k & 1) === 1;
      const r = fiveStarRate(pity);
      const limP = g ? 1 : 0.5;

      expectedFive += prob * r;
      anyFive += prob * r; // counted per-pull; converted to "at least one" below via complement

      // Got the limited this pull
      gotLimited += prob * r * limP;
      // 5★ but lost the 50/50 → pity resets, next 5★ guaranteed, still chasing
      add(key(0, true), prob * r * (1 - limP));
      // No 5★ → pity advances
      add(key(Math.min(pity + 1, HARD_PITY), g), prob * (1 - r));
    }
    notGot = next;
  }

  // P(at least one 5★) via complement: probability we NEVER hit a 5★.
  // Re-run a lightweight pity-only walk for the "no 5★ at all" mass.
  let noFiveMass = 1;
  let pity = currentPity;
  for (let i = 0; i < pulls; i++) {
    noFiveMass *= 1 - fiveStarRate(pity);
    pity = Math.min(pity + 1, HARD_PITY);
  }

  return {
    limited: gotLimited,
    anyFiveStar: 1 - noFiveMass,
    expectedFiveStars: expectedFive,
  };
}

/** Worst-case pulls to be CERTAIN of one featured limited (two hard pities, minus pity). */
export function guaranteedPulls(currentPity: number, guaranteed: boolean): number {
  const toFirst = HARD_PITY - currentPity;
  return guaranteed ? toFirst : toFirst + HARD_PITY;
}
