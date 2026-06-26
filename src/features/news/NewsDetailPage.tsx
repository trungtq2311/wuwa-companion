import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, AlertCircle } from "lucide-react";
import { Loading } from "@/components/Loading";
import { useAsync } from "@/lib/useAsync";
import { fetchArticle, articleWebUrl } from "./api";

export function NewsDetailPage() {
  const { id } = useParams();
  const articleId = Number(id);
  const { data, loading, error } = useAsync(
    () => fetchArticle(articleId),
    [articleId],
  );

  return (
    <div className="flex flex-col gap-5">
      <Link
        to="/news"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
      >
        <ArrowLeft size={15} /> Tin tức
      </Link>

      {loading && <Loading />}

      {error && (
        <div className="glass flex items-center gap-3 px-5 py-6 text-sm">
          <AlertCircle size={18} className="text-[var(--color-fusion)]" />
          Không tải được bài viết. ({error})
        </div>
      )}

      {data && (
        <article className="glass overflow-hidden">
          <div className="border-b border-[var(--color-border-soft)] px-6 py-5">
            <h1 className="text-2xl font-semibold leading-tight">
              {data.articleTitle}
            </h1>
            <div className="mt-2 flex items-center gap-3 text-xs text-[var(--color-fg-faint)]">
              <span>{data.createTime?.slice(0, 10)}</span>
              <a
                href={articleWebUrl(articleId)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[var(--color-accent)] hover:underline"
              >
                Mở trên web chính thức <ExternalLink size={12} />
              </a>
            </div>
          </div>
          <div
            className="news-content px-6 py-5"
            dangerouslySetInnerHTML={{ __html: data.articleContent }}
          />
        </article>
      )}
    </div>
  );
}
