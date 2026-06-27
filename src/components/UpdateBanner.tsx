import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, RefreshCw, X } from "lucide-react";

/**
 * Checks GitHub Releases for a newer signed build on launch (via the Tauri
 * updater plugin) and offers a one-click download + install + relaunch.
 * No-ops silently in the browser / dev preview where the Tauri APIs are absent.
 */

type Phase = "idle" | "available" | "downloading" | "ready" | "error";

interface UpdateInfo {
  version: string;
  notes?: string;
}

export function UpdateBanner() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [info, setInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  // Hold the resolved Update object across renders without re-rendering.
  const [pendingUpdate, setPendingUpdate] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    // Only the packaged desktop app exposes the Tauri IPC bridge.
    if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) {
      return;
    }
    (async () => {
      try {
        const { check } = await import("@tauri-apps/plugin-updater");
        const update = await check();
        if (cancelled || !update) return;
        setPendingUpdate(update);
        setInfo({ version: update.version, notes: update.body });
        setPhase("available");
      } catch (err) {
        // Network down / no release yet — stay quiet, this is best-effort.
        console.warn("Update check failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function install() {
    if (!pendingUpdate) return;
    try {
      setPhase("downloading");
      const update = pendingUpdate as {
        downloadAndInstall: (
          onEvent: (e: { event: string; data?: { contentLength?: number; chunkLength?: number } }) => void,
        ) => Promise<void>;
      };
      let downloaded = 0;
      let total = 0;
      await update.downloadAndInstall((e) => {
        if (e.event === "Started") {
          total = e.data?.contentLength ?? 0;
        } else if (e.event === "Progress") {
          downloaded += e.data?.chunkLength ?? 0;
          if (total > 0) setProgress(Math.round((downloaded / total) * 100));
        } else if (e.event === "Finished") {
          setProgress(100);
        }
      });
      setPhase("ready");
      const { relaunch } = await import("@tauri-apps/plugin-process");
      await relaunch();
    } catch (err) {
      console.error("Update install failed:", err);
      setPhase("error");
    }
  }

  if (phase === "idle" || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        className="fixed left-1/2 top-3 z-[100] w-[min(92vw,420px)] -translate-x-1/2"
      >
        <div className="tech flex items-center gap-3 border border-[var(--color-accent)]/40 bg-[#12100b]/95 px-4 py-3 shadow-2xl backdrop-blur">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
            {phase === "downloading" ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            {phase === "available" && (
              <>
                <p className="text-sm font-semibold text-[var(--color-accent)]">
                  Có bản cập nhật v{info?.version}
                </p>
                <p className="truncate text-xs text-white/60">
                  Nhấn để tải về và cài tự động.
                </p>
              </>
            )}
            {phase === "downloading" && (
              <>
                <p className="text-sm font-semibold text-[var(--color-accent)]">
                  Đang tải v{info?.version}… {progress}%
                </p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            )}
            {phase === "ready" && (
              <p className="text-sm font-semibold text-[var(--color-accent)]">
                Đã cài xong — đang khởi động lại…
              </p>
            )}
            {phase === "error" && (
              <p className="text-sm font-semibold text-red-400">
                Cập nhật thất bại. Thử lại sau nhé.
              </p>
            )}
          </div>
          {phase === "available" && (
            <button
              onClick={install}
              className="shrink-0 rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-xs font-bold text-black transition hover:brightness-110"
            >
              Cập nhật
            </button>
          )}
          {(phase === "available" || phase === "error") && (
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 text-white/40 transition hover:text-white"
              aria-label="Đóng"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
