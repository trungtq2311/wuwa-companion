import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Newspaper, Sparkles } from "lucide-react";
import { NAV_ITEMS } from "@/routes/nav";
import { RESONATORS, MANIFEST, type Resonator } from "@/data/wuwa";
import { ElementBadge } from "@/components/ElementBadge";
import { RarityStars } from "@/components/RarityStars";
import { useAsync } from "@/lib/useAsync";
import { cdnImg } from "@/lib/img";
import { fetchNewsList } from "@/features/news/api";
import { BUNDLED_BANNERS, loadBanners } from "@/features/banners/bannersData";

const accentByPath: Record<string, string> = {
  "/resonators": "var(--color-glacio)",
  "/convene": "var(--color-electro)",
  "/news": "var(--color-spectro)",
  "/codes": "var(--color-spectro)",
  "/banners": "var(--color-fusion)",
};

function pickFeatured(): Resonator {
  const pool = RESONATORS.filter((r) => r.rarity === 5 && r.images.banner);
  return pool[Math.floor(Math.random() * pool.length)] ?? RESONATORS[0];
}

export function DashboardPage() {
  const [hero] = useState(pickFeatured);
  const news = useAsync(fetchNewsList, []);
  const tiles = NAV_ITEMS.filter((n) => n.path !== "/").slice(0, 6);
  const banners = useAsync(loadBanners, []);
  const schedule = banners.data?.schedule ?? BUNDLED_BANNERS.schedule;
  const currentBanner = schedule.find((b) => b.status === "current");

  return (
    <div className="flex flex-col gap-6">
      {/* Cinematic hero */}
      <section className="glass tech relative h-[260px] overflow-hidden sm:h-[330px]">
        {/* splash art */}
        {hero.images.banner && (
          <img
            src={cdnImg(hero.images.banner, 700)}
            alt={hero.name}
            onError={(e) => {
              // proxy failed → fall back to the original CDN url once
              const el = e.currentTarget;
              if (el.src !== hero.images.banner && hero.images.banner)
                el.src = hero.images.banner;
            }}
            className="absolute right-0 top-0 h-full w-2/3 object-cover object-top"
          />
        )}
        {/* gradient veils */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-surface)]/85 to-transparent" />
        <div
          className="absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full opacity-25 blur-[90px]"
          style={{ background: hero.element.color }}
        />

        <div className="relative flex h-full flex-col justify-center gap-3 px-9 max-w-[60%]">
          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.25em] text-[var(--color-accent)]">
            <Sparkles size={13} /> Resonator nổi bật
          </span>
          <div className="flex items-center gap-3">
            <h1 className="display text-3xl font-bold leading-none sm:text-5xl">
              {hero.name}
            </h1>
            <RarityStars rarity={hero.rarity} size={18} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ElementBadge
              name={hero.element.name}
              color={hero.element.color}
              icon={hero.images.elementIcon}
              size="sm"
            />
            <span className="text-sm text-[var(--color-fg-muted)]">
              · {hero.weapon.name}
            </span>
            {hero.roleTags[0] && (
              <span className="rounded-md border border-[var(--color-border-soft)] px-2 py-0.5 text-xs text-[var(--color-fg-muted)]">
                {hero.roleTags[0].name}
              </span>
            )}
          </div>
          <Link
            to={`/resonators/${hero.slug}`}
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--color-bg)] transition-transform hover:scale-[1.03]"
          >
            Xem chi tiết & build <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Feature tiles */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((item, i) => {
          const accent = accentByPath[item.path] ?? "var(--color-accent)";
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={item.path}
                className="glass glass-hover group flex items-center gap-3 p-4"
              >
                <div
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                  style={{
                    background: `color-mix(in srgb, ${accent} 16%, transparent)`,
                    color: accent,
                  }}
                >
                  <item.icon size={21} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="display flex items-center gap-1 font-semibold">
                    {item.label}
                    <ArrowUpRight
                      size={14}
                      className="text-[var(--color-fg-faint)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </div>
                  <div className="truncate text-xs text-[var(--color-fg-muted)]">
                    {item.description}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </section>

      {/* News + banner row */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        {/* Latest news */}
        <div className="glass p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="display flex items-center gap-2 text-sm font-semibold">
              <Newspaper size={15} style={{ color: "var(--color-spectro)" }} />
              Tin mới nhất
            </div>
            <Link
              to="/news"
              className="text-xs text-[var(--color-accent)] hover:underline"
            >
              Tất cả
            </Link>
          </div>
          {news.loading && (
            <div className="text-sm text-[var(--color-fg-faint)]">Đang tải…</div>
          )}
          {news.error && (
            <div className="text-sm text-[var(--color-fg-faint)]">
              Không tải được tin.
            </div>
          )}
          <div className="flex flex-col">
            {news.data?.slice(0, 5).map((a) => (
              <Link
                key={a.articleId}
                to={`/news/${a.articleId}`}
                className="flex items-center gap-3 border-b border-[var(--color-border-soft)] py-2 last:border-0 hover:text-[var(--color-accent)]"
              >
                <span className="text-[11px] tabular-nums text-[var(--color-fg-faint)]">
                  {a.createTime?.slice(5, 10)}
                </span>
                <span className="line-clamp-1 text-sm">{a.articleTitle}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Current banner */}
        <div className="glass p-5">
          <div className="display mb-3 text-sm font-semibold">Banner hiện tại</div>
          {currentBanner ? (
            <Link to="/banners" className="block">
              <div className="text-xs text-[var(--color-fg-muted)]">
                Version {currentBanner.version}
                {currentBanner.phase ? ` · ${currentBanner.phase}` : ""}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {currentBanner.featured5.map((name) => (
                  <span
                    key={name}
                    className="rounded-lg bg-[var(--color-rarity-5)]/12 px-2.5 py-1 text-sm font-medium text-[var(--color-rarity-5)]"
                  >
                    ★ {name}
                  </span>
                ))}
              </div>
            </Link>
          ) : (
            <div className="text-sm text-[var(--color-fg-faint)]">—</div>
          )}
          <div className="mt-4 border-t border-[var(--color-border-soft)] pt-3 text-[11px] text-[var(--color-fg-faint)]">
            {RESONATORS.length} nhân vật · nguồn {MANIFEST.source.split(" ")[0]}
          </div>
        </div>
      </section>
    </div>
  );
}
