import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, RefreshCw, X, CheckCircle2, AlertCircle } from "lucide-react";
import { useUpdaterStore } from "@/stores/updaterStore";

/**
 * Floating update toast. Auto-checks GitHub Releases on launch and also reacts
 * to manual checks triggered from the header. Self-installs + relaunches on
 * confirm. No-ops in the browser/dev preview (handled in the store).
 */
export function UpdateBanner() {
  const { phase, version, progress, manual, check, install, dismiss } =
    useUpdaterStore();

  // Auto-check once on launch.
  useEffect(() => {
    check(false);
  }, [check]);

  // Nothing to show in these states.
  if (phase === "idle" || phase === "checking") return null;
  // The silent launch check shouldn't surface "up to date" / errors — only
  // manual checks do.
  if ((phase === "uptodate" || phase === "error") && !manual) return null;

  const accent =
    phase === "error"
      ? "var(--color-fusion)"
      : phase === "uptodate"
        ? "var(--color-aero)"
        : "var(--color-accent)";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        className="fixed left-1/2 top-3 z-[100] w-[min(92vw,420px)] -translate-x-1/2"
      >
        <div
          className="tech flex items-center gap-3 border bg-[#12100b]/95 px-4 py-3 shadow-2xl backdrop-blur"
          style={{ borderColor: `${accent}66` }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ background: `${accent}26`, color: accent }}
          >
            {phase === "downloading" ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : phase === "uptodate" ? (
              <CheckCircle2 size={18} />
            ) : phase === "error" ? (
              <AlertCircle size={18} />
            ) : (
              <Download size={18} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            {phase === "available" && (
              <>
                <p className="text-sm font-semibold" style={{ color: accent }}>
                  Có bản cập nhật v{version}
                </p>
                <p className="truncate text-xs text-white/60">
                  Nhấn để tải về và cài tự động.
                </p>
              </>
            )}
            {phase === "downloading" && (
              <>
                <p className="text-sm font-semibold" style={{ color: accent }}>
                  Đang tải v{version}… {progress}%
                </p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progress}%`, background: accent }}
                  />
                </div>
              </>
            )}
            {phase === "ready" && (
              <p className="text-sm font-semibold" style={{ color: accent }}>
                Đã cài xong — đang khởi động lại…
              </p>
            )}
            {phase === "uptodate" && (
              <p className="text-sm font-semibold" style={{ color: accent }}>
                Bạn đang dùng bản mới nhất 🎉
              </p>
            )}
            {phase === "error" && (
              <p className="text-sm font-semibold" style={{ color: accent }}>
                Không kiểm tra được cập nhật. Thử lại sau nhé.
              </p>
            )}
          </div>

          {phase === "available" && (
            <button
              onClick={install}
              className="shrink-0 rounded-md px-3 py-1.5 text-xs font-bold text-black transition hover:brightness-110"
              style={{ background: accent }}
            >
              Cập nhật
            </button>
          )}
          {(phase === "available" || phase === "error" || phase === "uptodate") && (
            <button
              onClick={dismiss}
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
