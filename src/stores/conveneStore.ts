import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PullRecord } from "@/features/convene/api";

interface ConveneState {
  pulls: PullRecord[];
  lastImported: string | null;
  /** Manually-entered current pity per banner (poolType -> pity since last 5★). */
  manualPity: Record<number, number>;
  importPulls: (incoming: PullRecord[]) => number;
  setManualPity: (poolType: number, value: number) => void;
  clear: () => void;
}

const keyOf = (p: PullRecord) =>
  `${p.poolType}|${p.time}|${p.resourceId}|${p.name}`;

export const useConveneStore = create<ConveneState>()(
  persist(
    (set, get) => ({
      pulls: [],
      lastImported: null,
      manualPity: {},

      setManualPity: (poolType, value) =>
        set((s) => ({
          manualPity: {
            ...s.manualPity,
            [poolType]: Math.max(0, Math.min(89, Math.floor(value) || 0)),
          },
        })),

      importPulls: (incoming) => {
        const existing = get().pulls;
        const seen = new Set(existing.map(keyOf));
        const fresh = incoming.filter((p) => !seen.has(keyOf(p)));
        set({
          pulls: [...existing, ...fresh],
          lastImported: new Date().toISOString(),
        });
        return fresh.length;
      },

      clear: () => set({ pulls: [], lastImported: null, manualPity: {} }),
    }),
    { name: "wuwa-convene-v1" },
  ),
);
