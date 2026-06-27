import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Radio } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { RESONATORS } from "@/data/wuwa";
import { RarityStars } from "@/components/RarityStars";
import { BUNDLED_BANNERS, loadBanners, type BannerInfo } from "./bannersData";
import { BannerCountdown } from "./BannerCountdown";

const ACCENT = "var(--color-electro)";

function findResonator(name: string) {
  return RESONATORS.find((r) => r.name.toLowerCase() === name.toLowerCase());
}

export function BannersPage() {
  const [data, setData] = useState(BUNDLED_BANNERS);

  useEffect(() => {
    let alive = true;
    loadBanners().then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, []);

  const BANNERS_LAST_UPDATED = data.lastUpdated;
  const current = data.schedule.filter((b) => b.status === "current");
  const upcoming = data.schedule.filter((b) => b.status === "upcoming");

  return (
    <>
      <PageHeader
        title="Banners & Leaks"
        subtitle={`Lịch banner hiện tại & sắp tới · cập nhật ${BANNERS_LAST_UPDATED} · nguồn preview/cộng đồng.`}
        accent={ACCENT}
      />

      <div className="mb-6">
        <BannerCountdown schedule={data.schedule} />
      </div>

      <Section icon={<Radio size={15} />} title="Đang diễn ra" banners={current} />
      <div className="h-6" />
      <Section
        icon={<CalendarClock size={15} />}
        title="Sắp tới (theo preview/leak)"
        banners={upcoming}
      />
    </>
  );
}

function Section({
  icon,
  title,
  banners,
}: {
  icon: React.ReactNode;
  title: string;
  banners: BannerInfo[];
}) {
  if (banners.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-[var(--color-fg-faint)]">
        {icon} {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {banners.map((b, i) => (
          <BannerCard key={i} banner={b} />
        ))}
      </div>
    </section>
  );
}

function BannerCard({ banner: b }: { banner: BannerInfo }) {
  return (
    <div className="glass overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ background: `${ACCENT}12` }}
      >
        <span className="font-semibold">
          Version {b.version}
          {b.phase ? ` · ${b.phase}` : ""}
        </span>
        {(b.start || b.end) && (
          <span className="text-xs text-[var(--color-fg-muted)]">
            {b.start} {b.end ? `→ ${b.end}` : ""}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-3 px-5 py-4">
        {b.featured5.map((name) => {
          const r = findResonator(name);
          const inner = (
            <div className="flex w-24 flex-col items-center gap-1.5 text-center">
              <div
                className="h-20 w-20 overflow-hidden rounded-xl"
                style={{
                  background: r
                    ? `radial-gradient(circle at 50% 30%, ${r.element.color}33, var(--color-surface-2))`
                    : "var(--color-surface-2)",
                }}
              >
                {r?.images.avatar ? (
                  <img
                    src={r.images.avatar}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-2xl font-bold text-[var(--color-fg-faint)]">
                    {name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="text-xs font-medium leading-tight">{name}</div>
              <RarityStars rarity={5} size={10} />
            </div>
          );
          return r ? (
            <Link key={name} to={`/resonators/${r.slug}`} className="transition-transform hover:scale-105">
              {inner}
            </Link>
          ) : (
            <div key={name}>{inner}</div>
          );
        })}
      </div>
      {b.featured4 && b.featured4.length > 0 && (
        <div className="border-t border-[var(--color-border-soft)] px-5 py-2.5 text-xs text-[var(--color-fg-muted)]">
          4★: {b.featured4.join(" · ")}
        </div>
      )}
    </div>
  );
}
