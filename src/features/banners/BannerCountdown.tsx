import { CalendarClock, Hourglass } from "lucide-react";
import type { BannerInfo } from "./bannersData";

/** Whole days from now until an ISO date (negative if past). */
function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const target = new Date(iso + "T00:00:00").getTime();
  const now = Date.now();
  return Math.ceil((target - now) / 86_400_000);
}

export function BannerCountdown({
  schedule,
  compact = false,
}: {
  schedule: BannerInfo[];
  compact?: boolean;
}) {
  const current = schedule.find((b) => b.status === "current");
  const next = schedule.find((b) => b.status === "upcoming" && b.start);

  const endsIn = daysUntil(current?.end);
  const nextIn = daysUntil(next?.start);

  if (endsIn == null && nextIn == null) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        {endsIn != null && endsIn >= 0 && (
          <span className="flex items-center gap-1.5 text-[var(--color-fg-muted)]">
            <Hourglass size={12} className="text-[var(--color-fusion)]" />
            Banner hiện tại còn{" "}
            <b className="text-[var(--color-fg)]">{endsIn} ngày</b>
          </span>
        )}
        {nextIn != null && nextIn >= 0 && (
          <span className="flex items-center gap-1.5 text-[var(--color-fg-muted)]">
            <CalendarClock size={12} className="text-[var(--color-electro)]" />
            Banner sau sau{" "}
            <b className="text-[var(--color-fg)]">{nextIn} ngày</b>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {endsIn != null && (
        <CountCard
          icon={<Hourglass size={16} />}
          color="var(--color-fusion)"
          label={`Banner ${current?.version} ${current?.phase ?? ""} kết thúc sau`}
          days={endsIn}
          featured={current?.featured5?.join(", ")}
        />
      )}
      {nextIn != null && (
        <CountCard
          icon={<CalendarClock size={16} />}
          color="var(--color-electro)"
          label={`Banner ${next?.version} ${next?.phase ?? ""} bắt đầu sau`}
          days={nextIn}
          featured={next?.featured5?.join(", ")}
        />
      )}
    </div>
  );
}

function CountCard({
  icon,
  color,
  label,
  days,
  featured,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
  days: number;
  featured?: string;
}) {
  const past = days < 0;
  return (
    <div className="glass tech flex items-center gap-4 p-4">
      <div
        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
        style={{ background: `${color}1f`, color }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-[var(--color-fg-muted)]">{label}</div>
        <div className="display text-2xl font-bold tabular-nums" style={{ color }}>
          {past ? "—" : days} {past ? "" : "ngày"}
        </div>
        {featured && (
          <div className="truncate text-[11px] text-[var(--color-fg-faint)]">
            {featured}
          </div>
        )}
      </div>
    </div>
  );
}
