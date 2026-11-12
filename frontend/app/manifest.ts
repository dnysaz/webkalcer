import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WebKalcer — Jasa Pembuatan Website & Hosting Statis Gratis di Indonesia",
    short_name: "WebKalcer",
    description:
      "Jasa pembuatan website profesional untuk UMKM & kreator Indonesia: Landing Page Statis mulai Rp450.000, Website Custom, dan hosting statis gratis di webkalcer.com.",
    lang: "id",
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}
