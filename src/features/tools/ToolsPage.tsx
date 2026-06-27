import { useState } from "react";
import { Calculator, Boxes } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { PullCalculator } from "./PullCalculator";
import { MaterialLookup } from "./MaterialLookup";

const ACCENT = "var(--color-electro)";

const TABS = [
  { id: "pull", label: "Máy tính Pull", icon: Calculator },
  { id: "mats", label: "Tra nguyên liệu", icon: Boxes },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ToolsPage() {
  const [tab, setTab] = useState<TabId>("pull");

  return (
    <>
      <PageHeader
        title="Tiện ích"
        subtitle="Công cụ tính toán cho người chơi — lập kế hoạch quay & farm nguyên liệu."
        accent={ACCENT}
      />

      <div className="mb-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
              tab === t.id
                ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/12 text-[var(--color-fg)]"
                : "border-[var(--color-border-soft)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]",
            )}
          >
            <t.icon size={16} className={tab === t.id ? "text-[var(--color-accent)]" : ""} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "pull" ? <PullCalculator /> : <MaterialLookup />}
    </>
  );
}
