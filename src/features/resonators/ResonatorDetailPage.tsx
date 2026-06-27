import { useState } from "react";
import { cdnImg } from "@/lib/img";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Zap,
  Swords,
  Hammer,
  Disc3,
  Coins,
  FlaskConical,
  Skull,
  Leaf,
  Gem,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";
import { ElementBadge } from "@/components/ElementBadge";
import { RarityStars } from "@/components/RarityStars";
import { getResonator } from "@/data/wuwa";
import {
  recommendSonata,
  recommendEchoMains,
  recommendWeapons,
} from "./buildGuide";
import { fullBuildMaterials, TIER_COLOR, type MatKind } from "./materials";
import itemsData from "@/data/wuwa/items.json";

const ITEM_ICON = new Map(
  (itemsData as { name: string; icon: string; rarity: number }[]).map((i) => [
    i.name.toLowerCase(),
    i,
  ]),
);
const resolveItem = (name: string) => ITEM_ICON.get(name.toLowerCase()) ?? null;
function fmtQty(n: number) {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

export function ResonatorDetailPage() {
  const { slug } = useParams();
  const r = slug ? getResonator(slug) : undefined;
  const [bannerStage, setBannerStage] = useState<"proxy" | "original" | "failed">(
    "proxy",
  );

  if (!r) {
    return (
      <div className="glass px-6 py-16 text-center">
        <p className="text-sm text-[var(--color-fg-muted)]">
          Không tìm thấy nhân vật.
        </p>
        <Link
          to="/resonators"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-accent)]"
        >
          <ArrowLeft size={15} /> Quay lại
        </Link>
      </div>
    );
  }

  const accent = r.element.color;
  const sonata = recommendSonata(r.element.name);
  const echoMains = recommendEchoMains(r);
  const weapons = recommendWeapons(r);
  const materials = fullBuildMaterials(r.element.name);

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/resonators"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
      >
        <ArrowLeft size={15} /> Resonators
      </Link>

      {/* Hero */}
      <section className="glass relative overflow-hidden">
        <div className="relative grid grid-cols-1 md:grid-cols-[300px_1fr]">
          {/* Banner art */}
          <div className="relative aspect-[3/4] overflow-hidden md:aspect-auto">
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(120% 90% at 50% 0%, ${accent}40, var(--color-surface-2) 75%)`,
              }}
            />
            {r.images.gachaArt ? (
              <img
                src={cdnImg(r.images.gachaArt, 600)}
                alt={r.name}
                className="absolute inset-0 h-full w-full object-contain object-bottom drop-shadow-[0_0_24px_rgba(0,0,0,0.4)]"
              />
            ) : r.images.banner && bannerStage !== "failed" ? (
              <img
                src={
                  bannerStage === "proxy"
                    ? cdnImg(r.images.banner, 700)
                    : r.images.banner
                }
                alt={r.name}
                onError={() =>
                  setBannerStage((s) => (s === "proxy" ? "original" : "failed"))
                }
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            ) : (
              <div
                className="absolute inset-0 grid place-items-center text-8xl font-bold opacity-30"
                style={{ color: accent }}
              >
                {r.name.charAt(0)}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--color-surface)] md:block hidden" />
          </div>

          {/* Info */}
          <div className="relative p-6">
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-20 blur-3xl"
              style={{ background: accent }}
            />
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{r.name}</h1>
              <RarityStars rarity={r.rarity} size={18} />
            </div>
            {r.nameLocal && r.nameLocal !== r.name && (
              <p className="mt-0.5 text-sm text-[var(--color-fg-faint)]">
                {r.nameLocal}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm"
                style={{ background: `${accent}22`, color: accent }}
              >
                <ElementBadge
                  name={r.element.name}
                  color={accent}
                  icon={r.images.elementIcon}
                  size="sm"
                />
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1 text-sm">
                {r.images.weaponIcon && (
                  <img src={r.images.weaponIcon} alt="" width={16} height={16} />
                )}
                {r.weapon.name}
              </span>
            </div>

            {/* Role tags */}
            {r.roleTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.roleTags.slice(0, 4).map((t) => (
                  <span
                    key={t.name}
                    className="flex items-center gap-1 rounded-md border border-[var(--color-border-soft)] bg-white/[0.02] px-2 py-0.5 text-xs text-[var(--color-fg-muted)]"
                  >
                    {t.icon && <img src={t.icon} alt="" width={13} height={13} />}
                    {t.name}
                  </span>
                ))}
              </div>
            )}

            {/* Base stats */}
            <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
              <StatBox label="HP" value={r.baseStats.hp} />
              <StatBox label="ATK" value={r.baseStats.atk} />
              <StatBox label="DEF" value={r.baseStats.def} />
              <StatBox label="Crit" value={`${r.baseStats.crit}%`} />
              <StatBox label="Crit DMG" value={`${r.baseStats.critDmg}%`} />
            </div>
          </div>
        </div>
      </section>

      {/* Preferred stats (build hint) */}
      {r.preferredStats.length > 0 && (
        <section className="glass p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Sparkles size={15} style={{ color: accent }} /> Chỉ số ưu tiên (gợi
            ý build)
          </div>
          <div className="flex flex-wrap gap-2">
            {r.preferredStats.map((s, i) => (
              <span
                key={s}
                className="rounded-lg border px-3 py-1.5 text-sm"
                style={{
                  borderColor: i === 0 ? `${accent}66` : "var(--color-border-soft)",
                  background: i === 0 ? `${accent}14` : "transparent",
                  color: i === 0 ? accent : "var(--color-fg-muted)",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Build guide */}
      <section className="glass p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium">
          <Disc3 size={15} style={{ color: accent }} /> Gợi ý build
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Sonata */}
          <div>
            <div className="mb-2 text-xs uppercase tracking-wider text-[var(--color-fg-faint)]">
              Bộ Echo (Sonata)
            </div>
            <div className="flex items-center gap-2.5">
              {sonata.icon && (
                <img src={sonata.icon} alt="" width={32} height={32} />
              )}
              <span className="font-medium">{sonata.name}</span>
              <span className="text-xs text-[var(--color-fg-faint)]">×5</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--color-fg-muted)]">
              {sonata.note}
            </p>
          </div>

          {/* Echo main stats */}
          <div>
            <div className="mb-2 text-xs uppercase tracking-wider text-[var(--color-fg-faint)]">
              Main stat (4-3-3-1-1)
            </div>
            <div className="flex flex-col gap-1.5">
              {echoMains.map((e, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span
                    className="grid h-5 w-5 shrink-0 place-items-center rounded text-[11px] font-bold"
                    style={{ background: `${accent}22`, color: accent }}
                  >
                    {e.cost}
                  </span>
                  <span className="text-[var(--color-fg-muted)]">{e.stat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weapons */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider text-[var(--color-fg-faint)]">
              <Swords size={12} /> Vũ khí khuyên dùng
            </div>
            <div className="flex flex-col gap-2">
              {weapons.map((w) => (
                <div key={w.id} className="flex items-center gap-2">
                  {w.icon && <img src={w.icon} alt="" width={28} height={28} />}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{w.name}</div>
                    <div className="text-[11px] text-[var(--color-fg-faint)]">
                      {w.rarity}★ · {w.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ascension materials — REAL data (icon + name + qty) */}
      {r.ascension && r.ascension.length > 0 && (
        <section className="glass p-5">
          <div className="mb-1 flex items-center gap-2 text-sm font-medium">
            <Hammer size={15} style={{ color: accent }} /> Nguyên liệu đột phá
            (Lv20 → 90)
          </div>
          <p className="mb-4 text-xs text-[var(--color-fg-muted)]">
            Tổng vật phẩm thật cần để đột phá tối đa nhân vật này.
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2.5">
            {r.ascension.map((m) => (
              <ItemCard key={m.id} mat={m} />
            ))}
          </div>
        </section>
      )}

      {/* Skill-up materials (curated reference) */}
      <section className="glass p-5">
        <div className="mb-1 flex items-center gap-2 text-sm font-medium">
          <Swords size={15} style={{ color: accent }} /> Nguyên liệu nâng kỹ năng
          + cách farm
        </div>
        <p className="mb-4 text-xs text-[var(--color-fg-muted)]">
          Để nâng Forte/skill · kèm địa điểm farm & Waveplate.
        </p>
        <div className="flex flex-col gap-4">
          {materials
            .filter((g) => ["exp", "forgery", "weekly", "credit"].includes(g.kind))
            .map((g) => (
              <SkillGroup key={g.kind} group={g} accent={accent} />
            ))}
        </div>
        <p className="mt-3 text-xs text-[var(--color-fg-faint)]">
          * Phần nâng skill là ước lượng chung — số lượng đột phá ở trên là dữ
          liệu thật theo nhân vật.
        </p>
      </section>

      {/* Resonance chain */}
      {r.chains.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-[var(--color-fg-faint)]">
            <Zap size={15} /> Resonance Chain
          </h2>
          <div className="flex flex-col gap-2">
            {r.chains.map((ch) => (
              <div key={ch.seq} className="glass flex gap-3 p-4">
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold"
                  style={{ background: `${accent}22`, color: accent }}
                >
                  S{ch.seq}
                </span>
                <div>
                  <div className="font-medium">{ch.name}</div>
                  {ch.description && (
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-[var(--color-fg-muted)]">
                      {ch.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {r.skills.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-[var(--color-fg-faint)]">
            Kỹ năng
          </h2>
          <div className="flex flex-col gap-2">
            {r.skills.map((sk, i) => (
              <div key={i} className="glass p-4">
                <div className="font-medium">{sk.name}</div>
                {sk.description && (
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-[var(--color-fg-muted)]">
                    {sk.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  return (
    <div className="rounded-lg bg-white/[0.03] px-2.5 py-2 text-center">
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-fg-faint)]">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums">
        {value ?? "—"}
      </div>
    </div>
  );
}

function ItemCard({
  mat,
}: {
  mat: { id: number; qty: number; name: string; icon: string | null; rarity: number };
}) {
  const c = TIER_COLOR[mat.rarity] ?? TIER_COLOR[3];
  return (
    <div className="group flex flex-col items-center gap-1 text-center">
      <div
        className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-xl"
        style={{
          background: `radial-gradient(circle at 50% 20%, ${c}33, var(--color-surface-2) 75%)`,
          border: `1px solid ${c}66`,
          boxShadow: `0 0 16px -6px ${c}`,
        }}
        title={mat.name}
      >
        {mat.icon ? (
          <img
            src={mat.icon}
            alt={mat.name}
            loading="lazy"
            className="h-[78%] w-[78%] object-contain"
          />
        ) : (
          <span className="text-xs text-[var(--color-fg-faint)]">?</span>
        )}
        <span
          className="absolute bottom-0 right-0 rounded-tl-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums"
          style={{ background: "rgba(0,0,0,0.75)", color: c }}
        >
          ×{fmtQty(mat.qty)}
        </span>
      </div>
      <span className="line-clamp-2 text-[11px] leading-tight text-[var(--color-fg-muted)]">
        {mat.name}
      </span>
    </div>
  );
}

const MAT_ICON: Record<MatKind, LucideIcon> = {
  credit: Coins,
  exp: FlaskConical,
  boss: Skull,
  specimen: Leaf,
  enemy: Gem,
  forgery: Hammer,
  weekly: CalendarClock,
};

function SkillGroup({
  group: g,
  accent,
}: {
  group: ReturnType<typeof fullBuildMaterials>[number];
  accent: string;
}) {
  const Icon = MAT_ICON[g.icon];
  return (
    <div className="rounded-xl bg-white/[0.03] p-3">
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
          style={{ background: `${accent}1f`, color: accent }}
        >
          <Icon size={15} />
        </span>
        <span className="text-sm font-medium">{g.label}</span>
        {g.waveplate != null ? (
          <span className="rounded bg-[var(--color-spectro)]/15 px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-spectro)]">
            ⚡ {g.waveplate} Waveplate/lần
          </span>
        ) : (
          <span className="rounded bg-[var(--color-aero)]/15 px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-aero)]">
            miễn phí
          </span>
        )}
        <span className="w-full text-xs text-[var(--color-fg-faint)]">
          {g.source}
        </span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2.5">
        {g.tiers.map((t) => {
          const real = resolveItem(t.name);
          return (
            <ItemCard
              key={t.name}
              mat={{
                id: 0,
                qty: t.qty,
                name: t.name,
                icon: real?.icon ?? null,
                rarity: real?.rarity ?? t.tier,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
