import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Area auth / member-only — tidak diindex mesin pencari
        disallow: ["/dashboard", "/projects", "/login"],
      },
    ],
    sitemap: "https://webkalcer.com/sitemap.xml",
    host: "https://webkalcer.com",
  };
}
