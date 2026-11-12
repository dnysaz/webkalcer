/**
 * Logo WebKalcer (CDN).
 *
 * File asli 1366×500 RGBA dengan padding transparan tebal — glyph kata
 * "WebKalcer" hanya menempati kotak y=116..304 (tinggi 188) dan x=26..1333
 * (lebar 1307). Wrapper `.site-logo` (overflow-hidden) memotong padding itu
 * sehingga tinggi visual logo = prop `height` (px). Ukuran responsif
 * sepenuhnya diatur di CSS (globals.css) lewat variabel `--sl-h` (desktop)
 * dan `--sl-mh` (< 640px) — hanya satu elemen <img> yang dirender.
 */
import type { CSSProperties } from "react";

export default function SiteLogo({
  height = 36,
  mobileHeight,
  className = "",
}: {
  height?: number;
  mobileHeight?: number;
  className?: string;
}) {
  const style = {
    "--sl-h": `${height}px`,
    "--sl-mh": `${mobileHeight ?? height}px`,
  } as CSSProperties;

  return (
    <span className={`site-logo ${className}`} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://cdn.webkalcer.com/images-web/webkalcer-logo.png"
        alt="WebKalcer"
      />
    </span>
  );
}
