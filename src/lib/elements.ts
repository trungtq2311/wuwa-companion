/**
 * Reference data for Wuthering Waves elements (attributes) and weapon types.
 * Kept data-driven — the live game adds mechanics over time, so consumers
 * should iterate these lists rather than hardcoding counts.
 */

export type ElementId =
  | "glacio"
  | "fusion"
  | "electro"
  | "aero"
  | "spectro"
  | "havoc";

export interface ElementDef {
  id: ElementId;
  name: string;
  /** CSS color (matches the --color-<id> token in global.css). */
  color: string;
}

export const ELEMENTS: ElementDef[] = [
  { id: "glacio", name: "Glacio", color: "var(--color-glacio)" },
  { id: "fusion", name: "Fusion", color: "var(--color-fusion)" },
  { id: "electro", name: "Electro", color: "var(--color-electro)" },
  { id: "aero", name: "Aero", color: "var(--color-aero)" },
  { id: "spectro", name: "Spectro", color: "var(--color-spectro)" },
  { id: "havoc", name: "Havoc", color: "var(--color-havoc)" },
];

export const ELEMENT_MAP: Record<ElementId, ElementDef> = Object.fromEntries(
  ELEMENTS.map((e) => [e.id, e]),
) as Record<ElementId, ElementDef>;

export type WeaponTypeId =
  | "sword"
  | "broadblade"
  | "pistols"
  | "gauntlets"
  | "rectifier";

export interface WeaponTypeDef {
  id: WeaponTypeId;
  name: string;
}

export const WEAPON_TYPES: WeaponTypeDef[] = [
  { id: "sword", name: "Sword" },
  { id: "broadblade", name: "Broadblade" },
  { id: "pistols", name: "Pistols" },
  { id: "gauntlets", name: "Gauntlets" },
  { id: "rectifier", name: "Rectifier" },
];

export const WEAPON_TYPE_MAP: Record<WeaponTypeId, WeaponTypeDef> =
  Object.fromEntries(WEAPON_TYPES.map((w) => [w.id, w])) as Record<
    WeaponTypeId,
    WeaponTypeDef
  >;
