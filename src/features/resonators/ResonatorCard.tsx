import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ElementBadge } from "@/components/ElementBadge";
import { RarityStars } from "@/components/RarityStars";
import type { Resonator } from "@/data/wuwa";

const MAX_TILT = 14;

export function ResonatorCard({
  resonator: r,
  index = 0,
}: {
  resonator: Resonator;
  index?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [failed, setFailed] = useState(false);
  const accent = r.element.color;
  const img = r.images.banner || r.images.avatar;

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--ry", `${(px - 0.5) * 2 * MAX_TILT}deg`);
    el.style.setProperty("--rx", `${(0.5 - py) * 2 * MAX_TILT}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  }
  function reset() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.015, 0.25) }}
      style={{ perspective: 900 }}
    >
      <Link
        ref={ref}
        to={`/resonators/${r.slug}`}
        onMouseMove={onMove}
        onMouseLeave={reset}
        className="group relative block overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-soft)] transition-[box-shadow,border-color] duration-300 hover:border-[color-mix(in_srgb,var(--accent)_60%,transparent)]"
        style={
          {
            "--accent": accent,
            transform:
              "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
            transformStyle: "preserve-3d",
            transition: "transform 0.15s ease-out",
            boxShadow: `0 14px 40px -18px ${accent}aa`,
          } as React.CSSProperties
        }
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(120% 80% at 50% 0%, ${accent}40, var(--color-surface-2) 72%)`,
            }}
          />
          {img && !failed ? (
            <img
              src={img}
              alt={r.name}
              loading="lazy"
              decoding="async"
              onError={() => setFailed(true)}
              className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.08]"
              style={{ transform: "translateZ(20px)" }}
            />
          ) : (
            <div
              className="absolute inset-0 grid place-items-center text-6xl font-bold opacity-30"
              style={{ color: accent }}
            >
              {r.name.charAt(0)}
            </div>
          )}

          {/* holographic glare following cursor */}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(circle at var(--mx,50%) var(--my,50%), ${accent}55, transparent 45%)`,
              mixBlendMode: "screen",
            }}
          />
          <div className="holo pointer-events-none absolute inset-0" />

          {/* rarity */}
          <div className="absolute right-2 top-2 drop-shadow" style={{ transform: "translateZ(40px)" }}>
            <RarityStars rarity={r.rarity} />
          </div>
          <div
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{ background: accent, boxShadow: `0 0 14px ${accent}` }}
          />

          {/* meta */}
          <div
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-3 pb-3 pt-10"
            style={{ transform: "translateZ(30px)" }}
          >
            <div className="display font-semibold leading-tight drop-shadow">
              {r.name}
            </div>
            <div className="mt-1 flex items-center justify-between">
              <ElementBadge
                name={r.element.name}
                color={accent}
                icon={r.images.elementIcon}
                size="sm"
                showLabel={false}
              />
              <span className="text-[11px] text-white/70">{r.weapon.name}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
