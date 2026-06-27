import { useState } from "react";
import { ExternalLink, Map as MapIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Embeds a community interactive map (chests, ascension materials, ores, echoes…)
 * inside the app. WuWa has no clean location API, so building accurate pins
 * ourselves isn't feasible — instead we surface the best existing maps. A
 * "open in browser" fallback always works if a site refuses to be framed.
 */

const SOURCES = [
  { id: "wutheringgg", label: "wuthering.gg", url: "https://wuthering.gg/map" },
  { id: "thgl", label: "The Hidden Gaming Lair", url: "https://wuthering.th.gl/" },
  { id: "appsample", label: "AppSample", url: "https://wuthering-waves-map.appsample.com/" },
] as const;

export function MapPage() {
  const [active, setActive] = useState(0);
  const src = SOURCES[active];

  async function openExternal() {
    try {
      const { openUrl } = await import("@tauri-apps/plugin-opener");
      await openUrl(src.url);
    } catch {
      window.open(src.url, "_blank", "noopener");
    }
  }

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <MapIcon size={16} className="text-[var(--color-accent)]" />
          <span className="text-[var(--color-fg-muted)]">Nguồn map:</span>
          <div className="flex gap-1.5">
            {SOURCES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-xs transition-colors",
                  i === active
                    ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/12 text-[var(--color-fg)]"
                    : "border-[var(--color-border-soft)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={openExternal}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-3 py-1.5 text-xs font-medium text-[var(--color-accent)] transition hover:bg-[var(--color-accent)]/20"
        >
          Mở trong trình duyệt <ExternalLink size={13} />
        </button>
      </div>

      <div className="glass relative flex-1 overflow-hidden">
        <iframe
          key={src.id}
          src={src.url}
          title={`Wuthering Waves map — ${src.label}`}
          className="absolute inset-0 h-full w-full border-0"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </div>

      <p className="text-xs text-[var(--color-fg-faint)]">
        * Map do cộng đồng xây dựng (rương, nguyên liệu nâng cấp, ore, echo…).
        Nếu trang không hiện trong khung, bấm <b>Mở trong trình duyệt</b>.
      </p>
    </div>
  );
}
