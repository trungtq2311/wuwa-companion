/**
 * Build & ascension recommendations derived from real data
 * (preferredStats, element, weapon type) — heuristic, not editorial.
 */
import { SONATAS, WEAPONS, type Resonator, type Weapon } from "@/data/wuwa";
import { planAscension } from "@/lib/materialPlanner";

/** Element → its primary Sonata (Echo) set name. */
const ELEMENT_SONATA: Record<string, string> = {
  Glacio: "Freezing Frost",
  Fusion: "Molten Rift",
  Electro: "Void Thunder",
  Aero: "Sierra Gale",
  Spectro: "Celestial Light",
  Havoc: "Sun-sinking Eclipse",
};

export function recommendSonata(elementName: string) {
  const target = ELEMENT_SONATA[elementName];
  const set = SONATAS.find((s) =>
    target ? s.name.toLowerCase() === target.toLowerCase() : false,
  );
  return {
    name: set?.name ?? target ?? `${elementName} Set`,
    icon: set?.icon ?? null,
    note: `5 mảnh ${target ?? elementName} cho DPS nguyên tố ${elementName}; 2+2 với set hỗ trợ nếu cần.`,
  };
}

export interface EchoMainStatPlan {
  cost: string;
  stat: string;
}

/** Recommend 4-3-3-1-1 main stats from the character's preferred stats. */
export function recommendEchoMains(r: Resonator): EchoMainStatPlan[] {
  const prefs = r.preferredStats.map((s) => s.toLowerCase());
  const wantsCrit = prefs.some((p) => p.includes("crit"));
  const fourCost = wantsCrit ? "Crit Rate / Crit DMG" : "ATK%";
  const threeCost = `${r.element.name} DMG Bonus`;
  return [
    { cost: "4", stat: fourCost },
    { cost: "3", stat: threeCost },
    { cost: "3", stat: "ATK%" },
    { cost: "1", stat: "ATK%" },
    { cost: "1", stat: "ATK%" },
  ];
}

/** Top weapons of the character's weapon type (5★ first). */
export function recommendWeapons(r: Resonator, limit = 3): Weapon[] {
  return WEAPONS.filter((w) => w.type === r.weapon.name)
    .sort((a, b) => b.rarity - a.rarity)
    .slice(0, limit);
}

/** Element-specific ascension boss material name (approximate). */
const ELEMENT_CORE: Record<string, string> = {
  Glacio: "Tacet Core (Glacio)",
  Fusion: "Tacet Core (Fusion)",
  Electro: "Tacet Core (Electro)",
  Aero: "Tacet Core (Aero)",
  Spectro: "Tacet Core (Spectro)",
  Havoc: "Tacet Core (Havoc)",
};

export function ascensionSummary(r: Resonator) {
  const plan = planAscension(1, 90);
  return {
    coreName: ELEMENT_CORE[r.element.name] ?? "Tacet Core",
    shellCredits: plan.shellCredits,
    tacetCore: plan.tacetCore,
    specimen: plan.specimen,
    commonDrop: plan.commonDrop,
  };
}
