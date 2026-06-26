/**
 * Redemption codes — curated snapshot (Kuro has no public codes API).
 * Livestream codes are time-limited (~48-72h); keep `lastUpdated` honest and
 * point users to the in-game redemption + official news for the latest.
 */
export interface GiftCode {
  code: string;
  reward: string;
  status: "active" | "expired" | "permanent";
  note?: string;
}

export const CODES_LAST_UPDATED = "2026-06-26";

export const GIFT_CODES: GiftCode[] = [
  {
    code: "WUTHERINGGIFT",
    reward: "Astrite ×50 + nguyên liệu",
    status: "permanent",
    note: "Code vĩnh viễn cho người chơi mới.",
  },
  {
    code: "WUTHERINGGIFT3",
    reward: "Astrite + Shell Credit",
    status: "active",
  },
];

/** How to redeem (no public web portal confirmed as of the snapshot date). */
export const REDEEM_STEPS = [
  "Mở game → Terminal (góc trên trái)",
  "Settings → Other → Redemption Code",
  "Dán code và xác nhận",
  "Nhận quà trong hộp thư",
];

export const OFFICIAL_NEWS_URL =
  "https://wutheringwaves.kurogames.com/en/main/news";
