/**
 * Real Convene (gacha) history import.
 *
 * Recipe (verified against community pull-trackers + live endpoint):
 * 1. User pastes the Convene History URL obtained in-game.
 * 2. Params live in the URL FRAGMENT (after #): player_id, svr_id, record_id,
 *    resources_id, lang.
 * 3. POST to gmserver-api.aki-game2.{net|com}/gacha/record/query for each
 *    cardPoolType 1..4 (MUST be a JSON number), 300ms apart.
 * 4. Parse data[]: time, name, qualityLevel, resourceType, resourceId, count.
 *
 * CORS on the endpoint is open (`*`) so the webview can fetch directly.
 */

export interface ConveneParams {
  playerId: string;
  serverId: string;
  recordId: string;
  cardPoolId: string;
  languageCode: string;
  apiHost: string; // gmserver-api.aki-game2.net | .com
}

export interface PullRecord {
  time: string;
  name: string;
  qualityLevel: number; // 3 | 4 | 5
  resourceType: string; // "Resonators" | "Weapons"
  resourceId: number;
  count: number;
  poolType: number; // 1..4
}

export const POOL_NAMES: Record<number, string> = {
  1: "Resonator nổi bật",
  2: "Vũ khí nổi bật",
  3: "Resonator thường",
  4: "Vũ khí thường",
};

export const POOL_TYPES = [1, 2, 3, 4];

/** Parse the in-game Convene URL. Throws if required params are missing. */
export function parseConveneUrl(raw: string): ConveneParams {
  const url = raw.trim();
  const hashIdx = url.indexOf("#");
  const frag = hashIdx >= 0 ? url.slice(hashIdx + 1) : url;
  const qIdx = frag.indexOf("?");
  const query = qIdx >= 0 ? frag.slice(qIdx + 1) : frag;
  const p = new URLSearchParams(query);

  const playerId = p.get("player_id") ?? "";
  const serverId = p.get("svr_id") ?? "";
  const recordId = p.get("record_id") ?? "";
  const cardPoolId = p.get("resources_id") ?? "";
  const languageCode = p.get("lang") ?? "en";

  if (!playerId || !recordId || !serverId) {
    throw new Error(
      "URL không hợp lệ — thiếu player_id / record_id / svr_id. Hãy mở Convene History trong game và sao chép lại URL.",
    );
  }

  const isCN = /aki-game\.com/.test(url) && !/aki-game\.net/.test(url);
  const apiHost = isCN
    ? "gmserver-api.aki-game2.com"
    : "gmserver-api.aki-game2.net";

  return { playerId, serverId, recordId, cardPoolId, languageCode, apiHost };
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function queryPool(
  params: ConveneParams,
  poolType: number,
): Promise<PullRecord[]> {
  const res = await fetch(`https://${params.apiHost}/gacha/record/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cardPoolId: params.cardPoolId,
      cardPoolType: poolType, // number, not string
      languageCode: params.languageCode,
      playerId: params.playerId,
      recordId: params.recordId,
      serverId: params.serverId,
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const json = await res.json();
  if (json.code !== 0) throw new Error(json.message || "Lỗi truy vấn");
  return (json.data ?? []).map(
    (d: Record<string, unknown>): PullRecord => ({
      time: String(d.time ?? ""),
      name: String(d.name ?? ""),
      qualityLevel: Number(d.qualityLevel ?? 3),
      resourceType: String(d.resourceType ?? ""),
      resourceId: Number(d.resourceId ?? 0),
      count: Number(d.count ?? 1),
      poolType,
    }),
  );
}

/** Fetch all 4 main banner pools sequentially (300ms apart). */
export async function fetchConveneHistory(
  params: ConveneParams,
): Promise<PullRecord[]> {
  const all: PullRecord[] = [];
  for (const pool of POOL_TYPES) {
    const records = await queryPool(params, pool);
    all.push(...records);
    await delay(300);
  }
  return all;
}
