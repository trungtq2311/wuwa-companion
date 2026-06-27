import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ELEMENTS, WEAPON_TYPES } from "@/lib/elements";
import { cn } from "@/lib/utils";
import { RESONATORS } from "@/data/wuwa";
import { ResonatorCard } from "./ResonatorCard";

type RarityFilter = "all" | 4 | 5;

export function ResonatorsPage() {
  const [query, setQuery] = useState("");
  const [element, setElement] = useState<string>("all");
  const [weapon, setWeapon] = useState<string>("all");
  const [rarity, setRarity] = useState<RarityFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESONATORS.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q)) return false;
      if (element !== "all" && r.element.name !== element) return false;
      if (weapon !== "all" && r.weapon.name !== weapon) return false;
      if (rarity !== "all" && r.rarity !== rarity) return false;
      return true;
    }).sort(
      // 4★ first, then 5★; within each, by in-game release order.
      (a, b) =>
        a.rarity - b.rarity ||
        (a.releaseOrder ?? 9999) - (b.releaseOrder ?? 9999) ||
        a.name.localeCompare(b.name),
    );
  }, [query, element, weapon, rarity]);

  const hasFilters =
    query || element !== "all" || weapon !== "all" || rarity !== "all";

  return (
    <>
      <PageHeader
        title="Resonators"
        subtitle={`${RESONATORS.length} nhân vật · ảnh & dữ liệu thật · lọc theo nguyên tố, vũ khí, độ hiếm.`}
      />

      <div className="mb-4 flex items-center gap-2">
        <div className="glass flex flex-1 items-center gap-2 px-3 py-2">
          <Search size={16} className="text-[var(--color-fg-faint)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm nhân vật..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-fg-faint)]"
          />
        </div>
        {hasFilters && (
          <button
            onClick={() => {
              setQuery("");
              setElement("all");
              setWeapon("all");
              setRarity("all");
            }}
            className="glass glass-hover flex items-center gap-1.5 px-3 py-2 text-sm text-[var(--color-fg-muted)]"
          >
            <X size={14} /> Xóa lọc
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-2.5">
        <FilterRow label="Nguyên tố">
          <Chip active={element === "all"} onClick={() => setElement("all")}>
            Tất cả
          </Chip>
          {ELEMENTS.map((el) => (
            <Chip
              key={el.id}
              active={element === el.name}
              onClick={() => setElement(el.name)}
              dotColor={el.color}
            >
              {el.name}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Vũ khí">
          <Chip active={weapon === "all"} onClick={() => setWeapon("all")}>
            Tất cả
          </Chip>
          {WEAPON_TYPES.map((w) => (
            <Chip
              key={w.id}
              active={weapon === w.name}
              onClick={() => setWeapon(w.name)}
            >
              {w.name}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Độ hiếm">
          <Chip active={rarity === "all"} onClick={() => setRarity("all")}>
            Tất cả
          </Chip>
          <Chip active={rarity === 5} onClick={() => setRarity(5)}>
            5★
          </Chip>
          <Chip active={rarity === 4} onClick={() => setRarity(4)}>
            4★
          </Chip>
        </FilterRow>
      </div>

      {filtered.length === 0 ? (
        <div className="glass px-6 py-16 text-center text-sm text-[var(--color-fg-muted)]">
          Không có nhân vật khớp bộ lọc.
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(116px,1fr))] gap-3">
          {filtered.map((r, i) => (
            <ResonatorCard key={r.id} resonator={r} index={i} />
          ))}
        </div>
      )}
    </>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 shrink-0 text-xs uppercase tracking-wider text-[var(--color-fg-faint)]">
        {label}
      </span>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  dotColor,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dotColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors",
        active
          ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/12 text-[var(--color-fg)]"
          : "border-[var(--color-border-soft)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:border-[var(--color-border)]",
      )}
    >
      {dotColor && (
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: dotColor, boxShadow: `0 0 6px ${dotColor}` }}
        />
      )}
      {children}
    </button>
  );
}
