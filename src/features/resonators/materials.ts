/**
 * Curated full-build material reference for a Resonator
 * (Lv90 + all Forte/skills maxed). Sources are specific & actionable;
 * quantities are community-approximate totals. Tier drives the icon colour.
 */
export type MatKind =
  | "credit"
  | "exp"
  | "boss"
  | "specimen"
  | "enemy"
  | "forgery"
  | "weekly";

export interface MaterialGroup {
  kind: MatKind;
  label: string;
  icon: MatKind;
  /** Specific, actionable farming source. */
  source: string;
  /** Waveplate cost per run, or null if not stamina-gated. */
  waveplate: number | null;
  tiers: { name: string; tier: number; qty: number }[];
}

export function fullBuildMaterials(elementName: string): MaterialGroup[] {
  return [
    {
      kind: "credit",
      label: "Shell Credit",
      icon: "credit",
      source: "Tacet Field (Credit), nhiệm vụ ngày, Sim Universe, bán đồ",
      waveplate: 60,
      tiers: [{ name: "Shell Credit", tier: 3, qty: 2_030_000 }],
    },
    {
      kind: "exp",
      label: "Resonance Potion (EXP nhân vật)",
      icon: "exp",
      source: "Chế ở Synthesis (tab Resonance Potion) bằng EXP material rơi ở Tacet Field XP",
      waveplate: 60,
      tiers: [
        { name: "Basic Resonance Potion", tier: 2, qty: 4 },
        { name: "Medium Resonance Potion", tier: 3, qty: 10 },
        { name: "Advanced Resonance Potion", tier: 4, qty: 60 },
        { name: "Premium Resonance Potion", tier: 5, qty: 120 },
      ],
    },
    {
      kind: "boss",
      label: `Nguyên liệu Boss đột phá (${elementName})`,
      icon: "boss",
      source:
        "Boss thường (Tacet Discord) chỉ định của nhân vật — đánh trực tiếp trên map, nhận khi dùng Waveplate",
      waveplate: 60,
      tiers: [{ name: "Boss Ascension Drop", tier: 4, qty: 46 }],
    },
    {
      kind: "specimen",
      label: "Specimen vùng (cây/khoáng)",
      icon: "specimen",
      source:
        "Thu thập miễn phí ngoài bản đồ tại vùng quê của nhân vật (Huanglong / Black Shores...), không tốn Waveplate",
      waveplate: null,
      tiers: [{ name: "Regional Specimen", tier: 3, qty: 60 }],
    },
    {
      kind: "enemy",
      label: "Đồ rơi từ quái cùng hệ (4 hạng)",
      icon: "enemy",
      source:
        "Quái thường tương ứng — nhặt khi đi map hoặc dồn lại ở Tacet Field; nâng hạng bằng Synthesis",
      waveplate: null,
      tiers: [
        { name: "Hạng I (xanh)", tier: 2, qty: 26 },
        { name: "Hạng II (lam)", tier: 3, qty: 56 },
        { name: "Hạng III (tím)", tier: 4, qty: 57 },
        { name: "Hạng IV (cam)", tier: 5, qty: 57 },
      ],
    },
    {
      kind: "forgery",
      label: "Metallic Drip — nâng kỹ năng (Forge)",
      icon: "forgery",
      source:
        "Forgery Challenge: 'Cadence of Iron' — mở Thứ 3 / Thứ 6 / Chủ nhật (giờ reset), nhặt khi dùng Waveplate",
      waveplate: 60,
      tiers: [
        { name: "Inert Metallic Drip", tier: 2, qty: 25 },
        { name: "Reactive Metallic Drip", tier: 3, qty: 47 },
        { name: "Polarized Metallic Drip", tier: 4, qty: 63 },
        { name: "Heterized Metallic Drip", tier: 5, qty: 77 },
      ],
    },
    {
      kind: "weekly",
      label: "Nguyên liệu Boss tuần (skill lv ≥6)",
      icon: "weekly",
      source:
        "Boss tuần (Calamity-class) — giảm giá 3 lần đầu/tuần (reset Thứ 2); cần Lv giới hạn để mở",
      waveplate: 60,
      tiers: [{ name: "Weekly Boss Material", tier: 5, qty: 26 }],
    },
  ];
}

export const TIER_COLOR: Record<number, string> = {
  2: "#5fe6b0",
  3: "#79d6ff",
  4: "#c887ff",
  5: "#ffbe5c",
};
