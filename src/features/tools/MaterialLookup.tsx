import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Info } from "lucide-react";
import { RESONATORS, type Resonator } from "@/data/wuwa";
import { cdnImg } from "@/lib/img";
import { RarityStars } from "@/components/RarityStars";

const ACCENT = "var(--color-aero)";

interface MatEntry {
  id: number;
  name: string;
  icon: string | null;
  rarity: number;
  users: { resonator: Resonator; qty: number }[];
  totalQty: number;
}

/** Build a material → characters index from each resonator's ascension cost. */
function buildIndex(): MatEntry[] {
  const map = new Map<number, MatEntry>();
  for (const r of RESONATORS) {
    for (const m of r.ascension ?? []) {
      let e = map.get(m.id);
      if (!e) {
        e = { id: m.id, name: m.name, icon: m.icon, rarity: m.rarity, users: [], totalQty: 0 };
        map.set(m.id, e);
      }
      e.users.push({ resonator: r, qty: m.qty });
      e.totalQty += m.qty;
    }
  }
  return [...map.values()].sort(
    (a, b) => b.rarity - a.rarity || b.users.length - a.users.length,
  );
}

export function MaterialLookup() {
  const all = useMemo(buildIndex, []);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((m) => m.name.toLowerCase().includes(q));
  }, [all, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2 rounded-lg bg-[var(--color-aero)]/10 px-3 py-2 text-xs text-[var(--color-aero)]">
        <Info size={14} className="mt-0.5 shrink-0" />
        Ở Wuthering Waves nguyên liệu nâng cấp <b>farm được mọi ngày</b> (không
        khóa theo thứ). Chọn nguyên liệu để xem nhân vật nào cần — ưu tiên farm
        thứ nhiều người dùng.
      </div>

      <div className="glass flex items-center gap-2 px-3 py-2">
        <Search size={16} className="text-[var(--color-fg-faint)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm nguyên liệu..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-fg-faint)]"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="glass px-6 py-12 text-center text-sm text-[var(--color-fg-muted)]">
          Không tìm thấy nguyên liệu khớp.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((m) => (
            <div key={m.id} className="glass overflow-hidden">
              <button
                onClick={() => setOpenId((id) => (id === m.id ? null : m.id))}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
              >
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-lg"
                  style={{
                    background: `radial-gradient(circle at 50% 30%, var(--color-rarity-${m.rarity})33, var(--color-surface-2))`,
                  }}
                >
                  {m.icon ? (
                    <img src={cdnImg(m.icon, 96)} alt={m.name} className="h-10 w-10 object-contain" />
                  ) : (
                    <span className="text-lg opacity-50">?</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{m.name}</div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <RarityStars rarity={m.rarity} size={9} />
                    <span className="text-xs text-[var(--color-fg-faint)]">
                      {m.users.length} nhân vật cần
                    </span>
                  </div>
                </div>
                <span className="display text-sm font-bold tabular-nums" style={{ color: ACCENT }}>
                  ×{m.totalQty}
                </span>
              </button>

              {openId === m.id && (
                <div className="flex flex-wrap gap-2 border-t border-[var(--color-border-soft)] px-4 py-3">
                  {m.users
                    .sort((a, b) => b.qty - a.qty)
                    .map(({ resonator: r, qty }) => (
                      <Link
                        key={r.id}
                        to={`/resonators/${r.slug}`}
                        className="flex items-center gap-2 rounded-lg bg-white/[0.04] py-1 pl-1 pr-2.5 transition-colors hover:bg-white/[0.08]"
                      >
                        <div
                          className="h-8 w-8 overflow-hidden rounded-full"
                          style={{ background: `${r.element.color}33` }}
                        >
                          {r.images.avatar && (
                            <img
                              src={cdnImg(r.images.avatar, 64)}
                              alt={r.name}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <span className="text-xs font-medium">{r.name}</span>
                        <span className="text-[11px] text-[var(--color-fg-faint)]">×{qty}</span>
                      </Link>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
