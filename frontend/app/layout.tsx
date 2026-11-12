import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "@fortawesome/fontawesome-free/css/all.min.css";
import FloatingWhatsApp from "@/components/floating-wa";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://webkalcer.com"),
  title: "WebKalcer — Jasa Pembuatan Website & Hosting Statis Gratis di Indonesia",
  description:
    "Jasa pembuatan website profesional mulai Rp450.000 dan hosting statis gratis di Indonesia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${roboto.variable} ${robotoMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col font-sans text-lg text-ink"
        suppressHydrationWarning
      >
        {children}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
