/**
 * Banner schedule — curated from official previews + community leaks
 * (no reliable banner API). Clearly labelled and dated; verify before pulling.
 *
 * The JSON in this folder is the source of truth and is fetched at runtime
 * (see loadBanners) so the schedule can be refreshed without an app update; the
 * imported copy below is the bundled fallback.
 */
import { loadLive } from "@/lib/liveData";
import bundled from "./banners.json";

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

export interface BannersData {
  lastUpdated: string;
  schedule: BannerInfo[];
}

export const BUNDLED_BANNERS = bundled as BannersData;

/** Fetch the latest banner schedule from the repo (1-day cache), fall back to bundled. */
export function loadBanners(): Promise<BannersData> {
  return loadLive<BannersData>("src/features/banners/banners.json", BUNDLED_BANNERS);
}
