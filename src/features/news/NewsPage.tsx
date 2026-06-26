import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Loading } from "@/components/Loading";
import { useAsync } from "@/lib/useAsync";
import { fetchNewsList, ARTICLE_TYPE_LABEL } from "./api";

const ACCENT = "var(--color-spectro)";

export function NewsPage() {
  const { data, loading, error } = useAsync(fetchNewsList, []);

  return (
    <>
      <PageHeader
        title="Tin tức"
        subtitle="Tin tức & thông báo chính thức từ Kuro Games (cập nhật trực tiếp)."
        accent={ACCENT}
      />

      {loading && <Loading />}

      {error && (
        <div className="glass flex items-center gap-3 px-5 py-6 text-sm">
          <AlertCircle size={18} className="text-[var(--color-fusion)]" />
          <div>
            <div className="font-medium">Không tải được tin tức.</div>
            <div className="text-[var(--color-fg-muted)]">
              Kiểm tra kết nối mạng. ({error})
            </div>
          </div>
        </div>
      )}

      {data && (
        <div className="flex flex-col gap-2">
          {data.map((item, i) => (
            <motion.div
              key={item.articleId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
            >
              <Link
                to={`/news/${item.articleId}`}
                className="glass glass-hover group flex items-center gap-4 px-5 py-3.5"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {item.top ? (
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                        style={{ background: `${ACCENT}22`, color: ACCENT }}
                      >
                        GHIM
                      </span>
                    ) : null}
                    <span className="text-[11px] uppercase tracking-wide text-[var(--color-fg-faint)]">
                      {ARTICLE_TYPE_LABEL[item.articleType] ?? "Bài viết"}
                    </span>
                    <span className="text-[11px] text-[var(--color-fg-faint)]">
                      · {item.createTime?.slice(0, 10)}
                    </span>
                  </div>
                  <div className="mt-0.5 font-medium leading-snug">
                    {item.articleTitle}
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="shrink-0 text-[var(--color-fg-faint)] transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
