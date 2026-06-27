import { useMemo, useState } from "react";
import { Sparkles, Gem, Ticket } from "lucide-react";
import {
  ASTRITE_PER_PULL,
  computeOdds,
  guaranteedPulls,
} from "./lib/gachaOdds";

const ACCENT = "var(--color-electro)";

export function PullCalculator() {
  const [astrite, setAstrite] = useState(0);
  const [tickets, setTickets] = useState(0);
  const [pity, setPity] = useState(0);
  const [guaranteed, setGuaranteed] = useState(false);

  const pulls = Math.floor(astrite / ASTRITE_PER_PULL) + tickets;

  const odds = useMemo(
    () => computeOdds({ pulls, currentPity: pity, guaranteed }),
    [pulls, pity, guaranteed],
  );
  const worstCase = guaranteedPulls(pity, guaranteed);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <NumField
          icon={<Gem size={15} />}
          label="Astrite hiện có"
          value={astrite}
          onChange={setAstrite}
          step={160}
          hint={`${Math.floor(astrite / ASTRITE_PER_PULL)} lượt từ Astrite`}
        />
        <NumField
          icon={<Ticket size={15} />}
          label="Vé Convene (Radiant/Lustrous Tide)"
          value={tickets}
          onChange={setTickets}
        />
        <NumField
          icon={<Sparkles size={15} />}
          label="Pity hiện tại (lượt từ 5★ gần nhất)"
          value={pity}
          onChange={(v) => setPity(Math.max(0, Math.min(79, v)))}
          max={79}
        />
        <label className="glass flex cursor-pointer items-center gap-3 px-4 py-3">
          <input
            type="checkbox"
            checked={guaranteed}
            onChange={(e) => setGuaranteed(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-electro)]"
          />
          <div>
            <div className="text-sm font-medium">Đang "guaranteed"</div>
            <div className="text-xs text-[var(--color-fg-muted)]">
              Lần 5★ trước thua 50:50 → 5★ tới chắc chắn ra nhân vật banner.
            </div>
          </div>
        </label>
      </div>

      {/* Summary */}
      <div className="glass tech p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <span className="text-sm text-[var(--color-fg-muted)]">
            Tổng số lượt quay
          </span>
          <span className="display text-3xl font-bold tabular-nums" style={{ color: ACCENT }}>
            {pulls}
          </span>
        </div>

        <Bar
          label="Cơ hội ra nhân vật banner (limited)"
          pct={odds.limited}
          color="var(--color-rarity-5)"
        />
        <Bar
          label="Cơ hội ra ít nhất 1 nhân vật 5★ (bất kỳ)"
          pct={odds.anyFiveStar}
          color={ACCENT}
        />

        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
          <Stat
            label="5★ kỳ vọng"
            value={odds.expectedFiveStars.toFixed(2)}
          />
          <Stat
            label="Quay tối đa để CHẮC CHẮN có banner"
            value={`${worstCase} lượt`}
            sub={`≈ ${(worstCase * ASTRITE_PER_PULL).toLocaleString()} Astrite`}
          />
        </div>
      </div>

      <p className="text-xs text-[var(--color-fg-faint)]">
        * Ước tính dựa trên mô hình tỉ lệ cộng đồng (5★ cơ bản 0.8%, soft pity từ
        lượt 66, hard pity 80, 50:50). Kuro không công bố tỉ lệ từng lượt nên đây
        là con số xấp xỉ, đủ để lên kế hoạch.
      </p>
    </div>
  );
}

function NumField({
  icon,
  label,
  value,
  onChange,
  step = 1,
  max,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  max?: number;
  hint?: string;
}) {
  return (
    <label className="glass flex flex-col gap-1.5 px-4 py-3">
      <span className="flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)]">
        <span style={{ color: ACCENT }}>{icon}</span>
        {label}
      </span>
      <input
        type="number"
        min={0}
        max={max}
        step={step}
        value={value || ""}
        placeholder="0"
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
        className="w-full bg-transparent text-lg font-semibold tabular-nums outline-none"
      />
      {hint && <span className="text-[11px] text-[var(--color-fg-faint)]">{hint}</span>}
    </label>
  );
}

function Bar({ label, pct, color }: { label: string; pct: number; color: string }) {
  const p = Math.round(pct * 100);
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-[var(--color-fg-muted)]">{label}</span>
        <span className="display font-bold tabular-nums" style={{ color }}>
          {p}%
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${p}%`, background: color, boxShadow: `0 0 10px ${color}` }}
        />
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] p-3">
      <div className="text-[11px] uppercase tracking-wide text-[var(--color-fg-faint)]">
        {label}
      </div>
      <div className="display mt-0.5 text-lg font-bold tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-[var(--color-fg-faint)]">{sub}</div>}
    </div>
  );
}
