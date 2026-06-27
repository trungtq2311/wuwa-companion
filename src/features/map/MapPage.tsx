import { useEffect, useRef, useState } from "react";
import { ExternalLink, Map as MapIcon, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Embeds a community interactive map (chests, ascension materials, ores, echoes…)
 * inside the app. WuWa has no clean location API, so building accurate pins
 * ourselves isn't feasible — instead we surface the best existing maps.
 *
 * In a small app window these sites collapse to a mobile layout that buries the
 * map under a long marker list. To avoid that we render the iframe at a fixed
 * DESKTOP width and CSS-scale it down to fit, forcing the proper map+panel
 * layout. A zoom control + "open in browser" cover the rest.
 */

const SOURCES = [
  { id: "wutheringgg", label: "wuthering.gg", url: "https://wuthering.gg/map" },
  { id: "thgl", label: "The Hidden Gaming Lair", url: "https://wuthering.th.gl/" },
  { id: "appsample", label: "AppSample", url: "https://wuthering-waves-map.appsample.com/" },
] as const;

// Logical render width fed to the iframe; lower = more zoomed-in (bigger UI).
const ZOOM_WIDTHS = [1000, 1200, 1440];

export function MapPage() {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(1); // index into ZOOM_WIDTHS
  const src = SOURCES[active];

  const wrapRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ scale: 1, w: ZOOM_WIDTHS[1], h: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const vw = ZOOM_WIDTHS[zoom];
    const update = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (cw === 0 || ch === 0) return;
      const scale = cw / vw;
      setBox({ scale, w: vw, h: ch / scale });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [zoom]);

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
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <MapIcon size={16} className="text-[var(--color-accent)]" />
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
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.min(ZOOM_WIDTHS.length - 1, z + 1))}
            disabled={zoom >= ZOOM_WIDTHS.length - 1}
            title="Thu nhỏ giao diện (hiện nhiều hơn)"
            className="rounded-lg border border-[var(--color-border-soft)] p-1.5 text-[var(--color-fg-muted)] transition hover:text-[var(--color-fg)] disabled:opacity-40"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0, z - 1))}
            disabled={zoom <= 0}
            title="Phóng to giao diện"
            className="rounded-lg border border-[var(--color-border-soft)] p-1.5 text-[var(--color-fg-muted)] transition hover:text-[var(--color-fg)] disabled:opacity-40"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={openExternal}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-3 py-1.5 text-xs font-medium text-[var(--color-accent)] transition hover:bg-[var(--color-accent)]/20"
          >
            Mở trình duyệt <ExternalLink size={13} />
          </button>
        </div>
      </div>

      <div ref={wrapRef} className="glass relative flex-1 overflow-hidden">
        <iframe
          key={`${src.id}-${zoom}`}
          src={src.url}
          title={`Wuthering Waves map — ${src.label}`}
          style={{
            width: `${box.w}px`,
            height: `${box.h}px`,
            transform: `scale(${box.scale})`,
            transformOrigin: "top left",
            border: 0,
          }}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </div>

      <p className="text-xs text-[var(--color-fg-faint)]">
        * Map do cộng đồng xây dựng (rương, nguyên liệu nâng cấp, ore, echo…).
        Cửa sổ nhỏ thì giao diện thu nhỏ theo — dùng nút zoom, hoặc bấm <b>Mở
        trình duyệt</b> để xem toàn màn hình.
      </p>
    </div>
  );
}
