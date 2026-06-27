import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Link2,
  Loader2,
  AlertCircle,
  Trash2,
  ChevronDown,
  Sparkles,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { RarityStars } from "@/components/RarityStars";
import { useConveneStore } from "@/stores/conveneStore";
import { RESONATORS } from "@/data/wuwa";
import { cn } from "@/lib/utils";
import {
  parseConveneUrl,
  fetchConveneHistory,
  POOL_NAMES,
} from "./api";
import { allPoolStats, pulledResonatorNames, type PoolStats } from "./pity";

const ACCENT = "var(--color-electro)";
const HARD_PITY = 80;

export function ConvenePage() {
  const { pulls, lastImported, importPulls, clear, manualPity, setManualPity } =
    useConveneStore();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imported, setImported] = useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const hasPulls = pulls.length > 0;
  const stats = useMemo<PoolStats[]>(() => {
    if (hasPulls) return allPoolStats(pulls);
    // Fall back to manually-entered pity.
    return Object.entries(manualPity)
      .filter(([, v]) => v != null)
      .map(([pt, v]) => ({
        poolType: Number(pt),
        total: 0,
        fiveStarCount: 0,
        fourStarCount: 0,
        currentPity5: v,
        currentPity4: 0,
        fiveStars: [],
        avgPity5: 0,
      }))
      .sort((a, b) => a.poolType - b.poolType);
  }, [hasPulls, pulls, manualPity]);
  const ownedNames = useMemo(() => pulledResonatorNames(pulls), [pulls]);
  const owned = useMemo(() => {
    const set = new Set(ownedNames.map((n) => n.toLowerCase()));
    return RESONATORS.filter((r) => set.has(r.name.toLowerCase())).sort(
      (a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name),
    );
  }, [ownedNames]);

  async function analyze(link: string) {
    setError(null);
    setImported(null);
    setBusy(true);
    try {
      const params = parseConveneUrl(link);
      const records = await fetchConveneHistory(params);
      if (records.length === 0)
        throw new Error(
          "Không lấy được dữ liệu — record_id có thể đã hết hạn. Mở lại Convene History trong game và lấy URL mới.",
        );
      const n = importPulls(records);
      setImported(n);
      setUrl("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Convene"
        subtitle="Liên kết lịch sử Convene thật để xem pity, thống kê và nhân vật sở hữu."
        accent={ACCENT}
      />

      {/* Import bar */}
      <div className="glass mb-6 p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-3 py-2">
            <Link2 size={16} className="shrink-0 text-[var(--color-fg-faint)]" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Dán URL Convene History (từ trong game)..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-fg-faint)]"
            />
          </div>
          <button
            onClick={() => analyze(url)}
            disabled={busy || !url.trim()}
            className="flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-[var(--color-bg)] transition-transform hover:scale-[1.02] disabled:opacity-40"
            style={{ background: ACCENT }}
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : null}
            Phân tích
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-[var(--color-fusion)]/10 px-3 py-2 text-sm text-[var(--color-fusion)]">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}
        {imported !== null && !error && (
          <div className="mt-3 text-sm text-[var(--color-aero)]">
            ✓ Đã nhập {imported} lượt mới.
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-fg-faint)]">
          <button
            onClick={() => setShowHelp((v) => !v)}
            className="flex items-center gap-1 hover:text-[var(--color-fg)]"
          >
            <Info size={13} /> Cách lấy URL
            <ChevronDown
              size={13}
              className={cn("transition-transform", showHelp && "rotate-180")}
            />
          </button>
          {lastImported && (
            <span className="flex items-center gap-2">
              Nhập lần cuối: {lastImported.slice(0, 16).replace("T", " ")}
              <button
                onClick={clear}
                className="flex items-center gap-1 hover:text-[var(--color-fusion)]"
              >
                <Trash2 size={12} /> Xoá
              </button>
            </span>
          )}
        </div>

        {showHelp && (
          <ol className="mt-3 flex flex-col gap-1.5 border-t border-[var(--color-border-soft)] pt-3 text-xs text-[var(--color-fg-muted)]">
            <li>
              1. Bản game 3.x <b>không ghi URL Convene ra log/đĩa</b>, nên không
              app nào tự lấy được URL trên máy này (giới hạn của game).
            </li>
            <li>
              2. Nếu bạn lấy được URL Convene History bằng cách khác, dán vào ô
              trên rồi bấm <b>Phân tích</b> để nhập lịch sử thật.
            </li>
            <li className="text-[var(--color-accent)]">
              → Cách đơn giản nhất: dùng <b>"Nhập pity thủ công"</b> bên dưới —
              mở Convene → History trong game, đếm số lần quay kể từ sau 5★ gần
              nhất.
            </li>
          </ol>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {/* Manual pity entry (fallback when auto-import unavailable) */}
        {!hasPulls && (
          <ManualPity values={manualPity} onSet={setManualPity} />
        )}

        {/* Pity per banner — from real import or manual entry */}
        {stats.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {stats.map((s) => (
              <PityCard key={s.poolType} stats={s} manual={!hasPulls} />
            ))}
          </div>
        )}

        {/* Owned roster (only meaningful from real import) */}
        {hasPulls && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-[var(--color-fg-faint)]">
              Nhân vật sở hữu ({owned.length}) · bấm để xem build & nguyên liệu
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-3">
              {owned.map((r) => (
                <Link
                  key={r.id}
                  to={`/resonators/${r.slug}`}
                  className="glass glass-hover flex flex-col items-center gap-1.5 p-2.5 text-center"
                >
                  <div
                    className="h-16 w-16 overflow-hidden rounded-xl"
                    style={{
                      background: `radial-gradient(circle at 50% 25%, ${r.element.color}33, var(--color-surface-2))`,
                    }}
                  >
                    {r.images.avatar && (
                      <img
                        src={r.images.avatar}
                        alt={r.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <span className="line-clamp-1 text-xs font-medium">
                    {r.name}
                  </span>
                  <RarityStars rarity={r.rarity} size={9} />
                </Link>
              ))}
            </div>
            <p className="mt-3 text-xs text-[var(--color-fg-faint)]">
              * Suy ra từ lịch sử quay — không gồm nhân vật tặng qua sự kiện hay
              ngoài kênh convene.
            </p>
          </section>
        )}
      </div>
    </>
  );
}

function ManualPity({
  values,
  onSet,
}: {
  values: Record<number, number>;
  onSet: (poolType: number, value: number) => void;
}) {
  const banners = [1, 2, 3];
  return (
    <div className="glass p-5">
      <div className="mb-1 flex items-center gap-2 text-sm font-medium">
        <Sparkles size={15} style={{ color: ACCENT }} /> Nhập pity thủ công
      </div>
      <p className="mb-4 text-xs text-[var(--color-fg-muted)]">
        Mở Convene → History trong game, đếm số lần quay <b>kể từ sau 5★ gần
        nhất</b> rồi nhập vào đây. App sẽ hiện thanh pity & cảnh báo cận hard
        pity.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {banners.map((pt) => (
          <label key={pt} className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-fg-muted)]">
              {POOL_NAMES[pt]}
            </span>
            <input
              type="number"
              min={0}
              max={89}
              value={values[pt] ?? ""}
              placeholder="0"
              onChange={(e) => onSet(pt, parseInt(e.target.value, 10) || 0)}
              className="glass px-3 py-2 text-sm outline-none"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function PityCard({ stats: s, manual }: { stats: PoolStats; manual?: boolean }) {
  const pct = Math.min(100, (s.currentPity5 / HARD_PITY) * 100);
  const danger = s.currentPity5 >= 66;
  return (
    <div className="glass p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="display font-semibold">{POOL_NAMES[s.poolType]}</span>
        <span className="text-xs text-[var(--color-fg-faint)]">
          {manual ? "nhập tay" : `${s.total} lượt`}
        </span>
      </div>
      <div className="mb-1 flex items-end justify-between">
        <span className="text-xs text-[var(--color-fg-muted)]">Pity 5★</span>
        <span className="display text-lg font-bold tabular-nums">
          {s.currentPity5}
          <span className="text-sm text-[var(--color-fg-faint)]"> / {HARD_PITY}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: danger
              ? "linear-gradient(90deg, var(--color-rarity-5), var(--color-fusion))"
              : `linear-gradient(90deg, ${ACCENT}, var(--color-rarity-5))`,
          }}
        />
      </div>
      <div className="mt-2 text-right text-[11px] text-[var(--color-fg-faint)]">
        {s.currentPity5 >= 66
          ? "⚠ Đã vào soft pity — sắp ra 5★!"
          : `Còn ~${66 - s.currentPity5} lượt tới soft pity`}
      </div>
      {!manual && (
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Mini label="5★" value={s.fiveStarCount} />
          <Mini label="4★" value={s.fourStarCount} />
          <Mini label="Pity TB" value={s.avgPity5 ? s.avgPity5.toFixed(0) : "—"} />
        </div>
      )}
      {!manual && s.fiveStars.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[var(--color-border-soft)] pt-3">
          {s.fiveStars.slice(0, 8).map((f, i) => (
            <span
              key={i}
              className="rounded-md bg-[var(--color-rarity-5)]/12 px-2 py-0.5 text-[11px] text-[var(--color-rarity-5)]"
              title={`pity ${f.pity} · ${f.time}`}
            >
              {f.name} ({f.pity})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white/[0.03] py-1.5">
      <div className="text-[10px] uppercase text-[var(--color-fg-faint)]">
        {label}
      </div>
      <div className="display text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}
