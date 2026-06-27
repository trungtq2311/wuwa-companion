/**
 * Real Wuthering Waves dataset (normalized from DommyMM/wuwabuild).
 * Images are official CDN URLs (files.wuthery.com). Built by scripts/build-data.mjs.
 */
import resonatorsJson from "./resonators.json";
import weaponsJson from "./weapons.json";
import sonatasJson from "./sonatas.json";
import manifestJson from "./manifest.json";

export interface ResonatorElement {
  id: number;
  name: string;
  color: string;
}

export interface ResonatorImages {
  avatar: string | null;
  banner: string | null;
  elementIcon: string | null;
  weaponIcon: string | null;
  /** Convene (gacha) key art + its background — only featured 5★ have these. */
  gachaArt?: string | null;
  gachaBg?: string | null;
}

export interface ResonatorBaseStats {
  hp: number | null;
  atk: number | null;
  def: number | null;
  crit: number;
  critDmg: number;
}

export interface RoleTag {
  name: string;
  icon: string | null;
}

export interface ResonatorChain {
  seq: number;
  name: string;
  description: string;
}

export interface ResonatorSkill {
  name: string;
  description: string;
}

export interface AscensionMat {
  id: number;
  qty: number;
  name: string;
  icon: string | null;
  rarity: number;
}

export interface Resonator {
  id: number;
  slug: string;
  name: string;
  nameLocal: string;
  rarity: number;
  /** in-game resonator sequence (legacyId) ≈ release order */
  releaseOrder?: number;
  element: ResonatorElement;
  weapon: { id: number; name: string };
  images: ResonatorImages;
  baseStats: ResonatorBaseStats;
  preferredStats: string[];
  roleTags: RoleTag[];
  chains: ResonatorChain[];
  skills: ResonatorSkill[];
  ascension?: AscensionMat[];
  /** ISO date the character first appeared in the dataset (datamine). */
  addedAt?: string;
}

export interface Weapon {
  id: number;
  name: string;
  type: string;
  typeId: number;
  rarity: number;
  icon: string | null;
  mainStat: { attribute: string; value: number } | null;
  subStat: { attribute: string; value: number; isRatio: boolean } | null;
  effectName: string;
  effect: string;
}

export interface Sonata {
  id: number | string;
  name: string;
  icon: string | null;
  effects: string[];
}

export const RESONATORS = resonatorsJson as Resonator[];
export const WEAPONS = weaponsJson as Weapon[];
export const SONATAS = sonatasJson as Sonata[];
export const MANIFEST = manifestJson as {
  source: string;
  sourceUrl: string;
  imagesCdn: string;
  fetchedAt: string;
  counts: Record<string, number>;
};

export function getResonator(slug: string): Resonator | undefined {
  return RESONATORS.find((r) => r.slug === slug);
}

/**
 * Characters first added to the dataset within `days` (i.e. freshly datamined —
 * these are the genuine pre-farm targets). Auto-detected from `addedAt`, so it
 * needs no hand-maintained list.
 */
export function getRecentResonators(days = 45): Resonator[] {
  const cutoff = Date.now() - days * 86_400_000;
  return RESONATORS.filter((r) => {
    if (!r.addedAt) return false;
    const t = new Date(r.addedAt + "T00:00:00").getTime();
    return !Number.isNaN(t) && t >= cutoff;
  }).sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? ""));
}
