import { create } from "zustand";

/**
 * Shared updater state used by both the launch auto-check (UpdateBanner) and the
 * manual "check for updates" button in the header. Wraps the Tauri updater +
 * process plugins; no-ops gracefully in the browser/dev preview.
 */

export type UpdatePhase =
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "ready"
  | "uptodate"
  | "error";

interface TauriUpdate {
  version: string;
  body?: string;
  downloadAndInstall: (
    onEvent: (e: {
      event: string;
      data?: { contentLength?: number; chunkLength?: number };
    }) => void,
  ) => Promise<void>;
}

interface UpdaterState {
  phase: UpdatePhase;
  version?: string;
  notes?: string;
  progress: number;
  /** set when the manual button triggered the current check */
  manual: boolean;
  update: TauriUpdate | null;
  check: (manual?: boolean) => Promise<void>;
  install: () => Promise<void>;
  dismiss: () => void;
}

const isTauri = () =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export const useUpdaterStore = create<UpdaterState>((set, get) => ({
  phase: "idle",
  progress: 0,
  manual: false,
  update: null,

  async check(manual = false) {
    // Don't restart a check that's mid-flight.
    const p = get().phase;
    if (p === "checking" || p === "downloading") return;

    if (!isTauri()) {
      if (manual) {
        set({ phase: "error", manual });
        setTimeout(() => get().phase === "error" && set({ phase: "idle" }), 4000);
      }
      return;
    }

    set({ phase: "checking", manual, progress: 0 });
    try {
      const { check } = await import("@tauri-apps/plugin-updater");
      const update = (await check()) as TauriUpdate | null;
      if (update) {
        set({
          phase: "available",
          update,
          version: update.version,
          notes: update.body,
        });
      } else {
        set({ phase: "uptodate", update: null });
        // Auto-clear the "up to date" toast after a few seconds.
        setTimeout(
          () => get().phase === "uptodate" && set({ phase: "idle" }),
          3500,
        );
      }
    } catch (err) {
      console.warn("Update check failed:", err);
      set({ phase: manual ? "error" : "idle" });
      if (manual)
        setTimeout(() => get().phase === "error" && set({ phase: "idle" }), 4000);
    }
  },

  async install() {
    const update = get().update;
    if (!update) return;
    try {
      set({ phase: "downloading", progress: 0 });
      let downloaded = 0;
      let total = 0;
      await update.downloadAndInstall((e) => {
        if (e.event === "Started") total = e.data?.contentLength ?? 0;
        else if (e.event === "Progress") {
          downloaded += e.data?.chunkLength ?? 0;
          if (total > 0) set({ progress: Math.round((downloaded / total) * 100) });
        } else if (e.event === "Finished") set({ progress: 100 });
      });
      set({ phase: "ready" });
      const { relaunch } = await import("@tauri-apps/plugin-process");
      await relaunch();
    } catch (err) {
      console.error("Update install failed:", err);
      set({ phase: "error" });
    }
  },

  dismiss() {
    set({ phase: "idle" });
  },
}));
