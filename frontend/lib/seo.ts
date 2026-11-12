/**
 * Helper SEO terpusat — dipakai semua halaman agar openGraph, twitter
 * card, dan canonical selalu konsisten.
 *
 * OG image sementara memakai logo CDN (belum ada banner 1200×630).
 */
export const SITE_URL = "https://webkalcer.com";
export const SITE_NAME = "WebKalcer";
export const SITE_LOGO =
  "https://cdn.webkalcer.com/images-web/webkalcer-logo.png";
export const SITE_DESCRIPTION =
  "Jasa website profesional untuk UMKM Indonesia: Landing Page Statis mulai Rp450.000, Website Custom & hosting statis gratis di webkalcer.com. SSL & auto-deploy GitHub.";

export const OG_IMAGE = {
  url: SITE_LOGO,
  width: 1366,
  height: 500,
  alt: "WebKalcer — Jasa Pembuatan Website & Hosting Statis Gratis di Indonesia",
};

/** Blok metadata sosial + canonical untuk satu halaman. */
export function pageSocial(title: string, description: string, path: string) {
  return {
    alternates: { canonical: path },
    openGraph: {
      type: "website" as const,
      locale: "id_ID",
      url: path,
      siteName: SITE_NAME,
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
