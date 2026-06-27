/**
 * Route remote game-art URLs through the wsrv.nl image proxy (Cloudflare-backed)
 * to resize + re-encode as WebP. The source CDN (files.wuthery.com) serves the
 * full-size splash art (~800KB each) which chokes when a grid loads dozens at
 * once — especially on slower connections. Proxied thumbnails are ~30-70KB and
 * served from a fast global edge, which is what fixes the "images don't load"
 * problem. Bundled/local assets and data URIs are passed through untouched.
 */
export function cdnImg(
  url: string | null | undefined,
  width: number,
): string | undefined {
  if (!url) return undefined;
  if (!/^https?:\/\//i.test(url)) return url; // bundled/local — leave as-is
  const u = url.replace(/^https?:\/\//i, "");
  return `https://wsrv.nl/?url=${encodeURIComponent(u)}&w=${width}&output=webp&q=80&we`;
}
