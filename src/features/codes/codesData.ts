/**
 * Redemption codes — curated snapshot (Kuro has no public codes API).
 * Livestream codes are time-limited (~48-72h); keep `lastUpdated` honest and
 * point users to the in-game redemption + official news for the latest.
 *
 * The JSON in this folder is the source of truth and is fetched at runtime
 * (see loadCodes) so codes can be refreshed without an app update; the imported
 * copy below is the bundled fallback.
 */
import { loadLive } from "@/lib/liveData";
import bundled from "./codes.json";

export interface GiftCode {
  code: string;
  reward: string;
  status: "active" | "expired" | "permanent";
  note?: string;
}

export interface CodesData {
  lastUpdated: string;
  codes: GiftCode[];
  redeemSteps: string[];
  officialNewsUrl: string;
}

export const BUNDLED_CODES = bundled as CodesData;

/** Fetch the latest codes from the repo (1-day cache), fall back to bundled. */
export function loadCodes(): Promise<CodesData> {
  return loadLive<CodesData>("src/features/codes/codes.json", BUNDLED_CODES);
}
