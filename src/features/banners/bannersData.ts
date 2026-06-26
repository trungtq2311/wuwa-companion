/**
 * Banner schedule — curated from official previews + community leaks
 * (no reliable banner API). Clearly labelled and dated; verify before pulling.
 */
export interface BannerInfo {
  version: string;
  phase?: string;
  status: "current" | "upcoming";
  type: "character" | "weapon";
  featured5: string[];
  featured4?: string[];
  start?: string;
  end?: string;
}

export const BANNERS_LAST_UPDATED = "2026-06-26";

export const BANNER_SCHEDULE: BannerInfo[] = [
  {
    version: "3.4",
    phase: "Phase II",
    status: "current",
    type: "character",
    featured5: ["Cartethyia"],
    featured4: ["Yuanwu", "Aalto", "Baizhi"],
  },
  {
    version: "3.5",
    phase: "Phase I",
    status: "upcoming",
    type: "character",
    featured5: ["Xuanling", "Suisui"],
    start: "2026-07-10",
    end: "2026-07-31",
  },
];
