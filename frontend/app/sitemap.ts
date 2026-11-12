import type { MetadataRoute } from "next";

const BASE = "https://webkalcer.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: Array<{
    path: string;
    changeFrequency: "weekly" | "monthly" | "yearly";
    priority: number;
  }> = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/layanan", changeFrequency: "monthly", priority: 0.9 },
    { path: "/layanan/landing-page-statis", changeFrequency: "monthly", priority: 0.9 },
    { path: "/layanan/website-custom", changeFrequency: "monthly", priority: 0.9 },
    { path: "/layanan/hosting-statis-gratis", changeFrequency: "monthly", priority: 0.8 },
    { path: "/layanan/proses-pembuatan", changeFrequency: "monthly", priority: 0.7 },
    { path: "/pesan-dan-diskusi", changeFrequency: "monthly", priority: 0.8 },
    { path: "/kontak", changeFrequency: "monthly", priority: 0.8 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  ];

  return pages.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
