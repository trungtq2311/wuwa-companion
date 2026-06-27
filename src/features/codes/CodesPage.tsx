import { useEffect, useState } from "react";
import { Copy, Check, Gift, ExternalLink, Info } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BUNDLED_CODES, loadCodes, type GiftCode } from "./codesData";
import { cn } from "@/lib/utils";

const ACCENT = "var(--color-spectro)";

const STATUS: Record<GiftCode["status"], { label: string; color: string }> = {
  permanent: { label: "Vĩnh viễn", color: "var(--color-aero)" },
  active: { label: "Còn hiệu lực", color: "var(--color-accent)" },
  expired: { label: "Hết hạn", color: "var(--color-fg-faint)" },
};

export function CodesPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [data, setData] = useState(BUNDLED_CODES);

  useEffect(() => {
    let alive = true;
    loadCodes().then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, []);

  const { codes: GIFT_CODES, redeemSteps: REDEEM_STEPS, officialNewsUrl: OFFICIAL_NEWS_URL, lastUpdated: CODES_LAST_UPDATED } = data;

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied((c) => (c === code ? null : c)), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <>
      <PageHeader
        title="Redemption Codes"
        subtitle={`Code đổi quà · cập nhật ${CODES_LAST_UPDATED}. Code livestream chỉ có hạn ~48-72h.`}
        accent={ACCENT}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-2.5">
          {GIFT_CODES.map((c) => {
            const st = STATUS[c.status];
            return (
              <div
                key={c.code}
                className="glass flex items-center gap-4 px-5 py-3.5"
              >
                <Gift size={20} style={{ color: ACCENT }} className="shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-semibold tracking-wide">
                      {c.code}
                    </span>
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                      style={{ background: `${st.color}22`, color: st.color }}
                    >
                      {st.label}
                    </span>
                  </div>
                  <div className="text-sm text-[var(--color-fg-muted)]">
                    {c.reward}
                    {c.note ? ` · ${c.note}` : ""}
                  </div>
                </div>
                <button
                  onClick={() => copy(c.code)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                    copied === c.code
                      ? "border-[var(--color-aero)]/50 text-[var(--color-aero)]"
                      : "border-[var(--color-border-soft)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]",
                  )}
                >
                  {copied === c.code ? <Check size={14} /> : <Copy size={14} />}
                  {copied === c.code ? "Đã chép" : "Chép"}
                </button>
              </div>
            );
          })}

          <a
            href={OFFICIAL_NEWS_URL}
            target="_blank"
            rel="noreferrer"
            className="glass glass-hover flex items-center justify-center gap-1.5 px-5 py-3 text-sm text-[var(--color-accent)]"
          >
            Xem code mới nhất trên trang chính thức <ExternalLink size={14} />
          </a>
        </div>

        {/* How to redeem */}
        <div className="glass h-fit p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Info size={15} style={{ color: ACCENT }} /> Cách đổi code
          </div>
          <ol className="flex flex-col gap-2">
            {REDEEM_STEPS.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <span
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-semibold"
                  style={{ background: `${ACCENT}22`, color: ACCENT }}
                >
                  {i + 1}
                </span>
                <span className="text-[var(--color-fg-muted)]">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
