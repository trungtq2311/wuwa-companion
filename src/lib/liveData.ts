/**
 * Runtime "live" data loader. Curated content (codes, banners) lives as JSON in
 * the repo; the app ships a bundled copy as fallback but tries to fetch the
 * latest from GitHub on launch, cached in localStorage with a 1-day TTL. This
 * lets us push fresh codes/banners without shipping a new app build.
 */

const RAW_BASE =
  "https://raw.githubusercontent.com/trungtq2311/wuwa-companion/master/";
const TTL_MS = 24 * 60 * 60 * 1000; // 1 day
const CACHE_PREFIX = "wuwa-live:";

interface CacheEntry<T> {
  at: number;
  data: T;
}

function readCache<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    return raw ? (JSON.parse(raw) as CacheEntry<T>) : null;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T) {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ at: Date.now(), data } satisfies CacheEntry<T>),
    );
  } catch {
    /* quota / unavailable — ignore */
  }
}

/**
 * Resolve the freshest available copy of a repo-hosted JSON file.
 *
 * @param repoPath  path of the file within the repo, e.g. "src/features/codes/codes.json"
 * @param fallback  bundled value used while offline / on first run / on error
 */
export async function loadLive<T>(repoPath: string, fallback: T): Promise<T> {
  const cached = readCache<T>(repoPath);
  const fresh = cached && Date.now() - cached.at < TTL_MS;

  // Serve a still-fresh cache immediately without hitting the network.
  if (fresh) return cached!.data;

  try {
    const res = await fetch(RAW_BASE + repoPath, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as T;
    writeCache(repoPath, data);
    return data;
  } catch {
    // Network failed: prefer a stale cache over the bundled fallback if present.
    if (cached) return cached.data;
    return fallback;
  }
}
