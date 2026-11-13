import type { Metadata, Viewport } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import "@fortawesome/fontawesome-free/css/brands.min.css";
import FloatingWhatsApp from "@/components/floating-wa";
import { pageSocial, SITE_DESCRIPTION } from "@/lib/seo";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["500"],
});

const HOME_TITLE =
  "WebKalcer — Jasa Pembuatan Website & Hosting Statis Gratis di Indonesia";

export const metadata: Metadata = {
  metadataBase: new URL("https://webkalcer.com"),
  applicationName: "WebKalcer",
  title: HOME_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    "jasa pembuatan website",
    "jasa website profesional",
    "landing page statis",
    "landing page mulai Rp450.000",
    "website custom",
    "hosting statis gratis",
    "hosting gratis indonesia",
    "jasa website UMKM",
    "bikin website murah",
    "deploy website gratis",
    "WebKalcer",
  ],
  authors: [{ name: "WebKalcer", url: "https://webkalcer.com" }],
  creator: "WebKalcer",
  publisher: "WebKalcer",
  category: "technology",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  ...pageSocial(HOME_TITLE, SITE_DESCRIPTION, "/"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${roboto.variable} ${robotoMono.variable} h-full antialiased`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body
        className="flex min-h-full flex-col font-sans text-lg text-ink"
        suppressHydrationWarning
      >
        {/* React 19 mengangkat <link> ini ke <head>. Menghemat DNS+TLS
            handshake saat request API pertama (api.webkalcer.com). */}
        <link rel="preconnect" href="https://api.webkalcer.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.webkalcer.com" />
        {children}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
