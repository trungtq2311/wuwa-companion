/**
 * Official Wuthering Waves news feed (Kuro CDN, G152 = global/EN).
 * CORS is open (`*`), so the webview can fetch it directly.
 */
const BASE =
  "https://hw-media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/json/G152/en";

export interface NewsItem {
  articleId: number;
  articleTitle: string;
  articleType: number;
  createTime: string;
  articleDesc?: string;
  top?: number;
}

export interface Article extends NewsItem {
  articleContent: string; // HTML
}

const cacheBust = () => `?t=${Date.now()}`;

export async function fetchNewsList(): Promise<NewsItem[]> {
  const r = await fetch(`${BASE}/ArticleMenu.json${cacheBust()}`);
  if (!r.ok) throw new Error(`News feed ${r.status}`);
  const data = await r.json();
  const arr: NewsItem[] = Array.isArray(data) ? data : (data.list ?? []);
  return arr
    .filter((a) => a.articleId && a.articleTitle)
    .sort((a, b) => (b.createTime > a.createTime ? 1 : -1));
}

export async function fetchArticle(id: number): Promise<Article> {
  const r = await fetch(`${BASE}/article/${id}.json${cacheBust()}`);
  if (!r.ok) throw new Error(`Article ${id} -> ${r.status}`);
  return r.json();
}

/** Public detail URL on the official site. */
export const articleWebUrl = (id: number) =>
  `https://wutheringwaves.kurogames.com/en/main/news/detail/${id}`;

export const ARTICLE_TYPE_LABEL: Record<number, string> = {
  58: "Tin tức",
  59: "Thông báo",
  60: "Sự kiện",
};
