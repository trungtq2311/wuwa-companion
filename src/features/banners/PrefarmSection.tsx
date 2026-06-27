import { Link } from "react-router-dom";
import { Sprout, Clock } from "lucide-react";
import { RESONATORS } from "@/data/wuwa";
import { cdnImg } from "@/lib/img";
import { RarityStars } from "@/components/RarityStars";
import type { BannerInfo } from "./bannersData";

/**
 * Pre-farm materials for the characters on upcoming banners. Material data only
 * exists once a character is datamined into our dataset, so each character
 * either shows its REAL ascension cost or an honest "pending datamine" note —
 * the latter auto-fills once the daily data refresh picks the character up.
 */

const ACCENT = "var(--color-electro)";

function findResonator(name: string) {
  return RESONATORS.find((r) => r.name.toLowerCase() === name.toLowerCase());
}

export function PrefarmSection({ schedule }: { schedule: BannerInfo[] }) {
  const upcoming = schedule.filter((b) => b.status === "upcoming");
  const names = [...new Set(upcoming.flatMap((b) => b.featured5))];
  if (names.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-[var(--color-fg-faint)]">
        <Sprout size={15} className="text-[var(--color-aero)]" /> Pre-farm nguyên liệu (banner sắp tới)
      </h2>

      <div className="flex flex-col gap-3">
        {names.map((name) => (
          <CharacterPrefarm key={name} name={name} />
        ))}
      </div>

      <p className="mt-3 text-xs text-[var(--color-fg-faint)]">
        * Nguyên liệu nâng cấp ở WuWa farm được mọi ngày — gom trước để vừa ra là
        dùng luôn. Nhân vật chưa có số liệu sẽ tự hiện khi được cập nhật vào dữ liệu.
      </p>
    </section>
  );
}

function CharacterPrefarm({ name }: { name: string }) {
  const r = findResonator(name);

  // Not datamined yet — honest placeholder.
  if (!r || !r.ascension || r.ascension.length === 0) {
    return (
      <div className="glass flex items-center gap-3 px-4 py-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/[0.04] text-[var(--color-fg-faint)]">
          <Clock size={18} />
        </div>
        <div>
          <div className="text-sm font-semibold">{name}</div>
          <div className="text-xs text-[var(--color-fg-faint)]">
            Chưa có số liệu nguyên liệu — chờ nhân vật được datamine (thường ~1
            phiên bản trước khi ra mắt).
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass overflow-hidden">
      <Link
        to={`/resonators/${r.slug}`}
        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]"
      >
        <div
          className="h-11 w-11 shrink-0 overflow-hidden rounded-full"
          style={{ background: `${r.element.color}33` }}
        >
          {r.images.avatar && (
            <img
              src={cdnImg(r.images.avatar, 96)}
              alt={r.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold">
            {r.name} <RarityStars rarity={r.rarity} size={9} />
          </div>
          <div className="text-xs text-[var(--color-fg-muted)]">
            Nguyên liệu đột phá (lên cấp tối đa)
          </div>
        </div>
      </Link>
      <div className="flex flex-wrap gap-2 border-t border-[var(--color-border-soft)] px-4 py-3">
        {r.ascension.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-2 rounded-lg bg-white/[0.04] py-1 pl-1 pr-2.5"
            title={m.name}
          >
            <div
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md"
              style={{
                background: `radial-gradient(circle at 50% 30%, var(--color-rarity-${m.rarity})33, var(--color-surface-2))`,
              }}
            >
              {m.icon ? (
                <img src={cdnImg(m.icon, 64)} alt={m.name} className="h-7 w-7 object-contain" />
              ) : (
                <span className="text-xs opacity-50">?</span>
              )}
            </div>
            <span className="max-w-[120px] truncate text-xs">{m.name}</span>
            <span className="text-xs font-bold tabular-nums" style={{ color: ACCENT }}>
              ×{m.qty}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
