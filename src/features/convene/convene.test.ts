import { describe, it, expect } from "vitest";
import { parseConveneUrl } from "./api";
import { poolStats, pulledResonatorNames } from "./pity";
import type { PullRecord } from "./api";

describe("parseConveneUrl", () => {
  it("parses params from the URL fragment", () => {
    const url =
      "https://aki-gm-resources-oversea.aki-game.net/aki/gacha/index.html#/record?svr_id=abc&player_id=123&lang=en&gacha_id=x&gacha_type=1&svr_area=global&record_id=tok&resources_id=pool9";
    const p = parseConveneUrl(url);
    expect(p.playerId).toBe("123");
    expect(p.serverId).toBe("abc");
    expect(p.recordId).toBe("tok");
    expect(p.cardPoolId).toBe("pool9");
    expect(p.languageCode).toBe("en");
    expect(p.apiHost).toBe("gmserver-api.aki-game2.net");
  });

  it("detects the CN host", () => {
    const url =
      "https://aki-gm-resources.aki-game.com/aki/gacha/index.html#/record?svr_id=s&player_id=1&record_id=r&resources_id=p";
    expect(parseConveneUrl(url).apiHost).toBe("gmserver-api.aki-game2.com");
  });

  it("throws on a URL missing required params", () => {
    expect(() => parseConveneUrl("https://example.com/#/record?lang=en")).toThrow();
  });
});

describe("poolStats", () => {
  const mk = (time: string, q: number, type = "Resonators", name = "X"): PullRecord => ({
    time,
    name,
    qualityLevel: q,
    resourceType: type,
    resourceId: 1,
    count: 1,
    poolType: 1,
  });

  it("computes pity, counts and current pity", () => {
    // oldest-first: 3,3,4,5,3  → 5★ at pity 4, then 1 pull since
    const pulls = [
      mk("2026-01-01 00:00:01", 3),
      mk("2026-01-01 00:00:02", 3),
      mk("2026-01-01 00:00:03", 4),
      mk("2026-01-01 00:00:04", 5, "Resonators", "Jinhsi"),
      mk("2026-01-01 00:00:05", 3),
    ];
    const s = poolStats(1, pulls);
    expect(s.total).toBe(5);
    expect(s.fiveStarCount).toBe(1);
    expect(s.fourStarCount).toBe(1);
    expect(s.currentPity5).toBe(1);
    expect(s.avgPity5).toBeCloseTo(4, 5);
    expect(s.fiveStars[0].name).toBe("Jinhsi");
    expect(s.fiveStars[0].pity).toBe(4);
  });

  it("is order-insensitive (sorts by time)", () => {
    const pulls = [
      mk("2026-01-01 00:00:05", 5),
      mk("2026-01-01 00:00:01", 3),
      mk("2026-01-01 00:00:02", 3),
    ];
    const s = poolStats(1, pulls);
    // 3,3,5 oldest-first → 5★ at pity 3, currentPity5 = 0
    expect(s.fiveStars[0].pity).toBe(3);
    expect(s.currentPity5).toBe(0);
  });
});

describe("pulledResonatorNames", () => {
  it("returns unique resonator names only", () => {
    const pulls: PullRecord[] = [
      { time: "1", name: "Jinhsi", qualityLevel: 5, resourceType: "Resonators", resourceId: 1, count: 1, poolType: 1 },
      { time: "2", name: "Jinhsi", qualityLevel: 5, resourceType: "Resonators", resourceId: 1, count: 1, poolType: 1 },
      { time: "3", name: "Sword X", qualityLevel: 5, resourceType: "Weapons", resourceId: 2, count: 1, poolType: 2 },
    ];
    expect(pulledResonatorNames(pulls)).toEqual(["Jinhsi"]);
  });
});
