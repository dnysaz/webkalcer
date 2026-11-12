/**
 * Logo WebKalcer (CDN).
 *
 * File asli 1366×500 RGBA dengan padding transparan tebal — glyph kata
 * "WebKalcer" hanya menempati kotak y=116..304 (tinggi 188) dan x=26..1333
 * (lebar 1307). Wrapper `.site-logo` (overflow-hidden) memotong padding itu
 * sehingga tinggi visual logo = prop `height` (px).
 *
 * Ukuran responsif diatur lewat variabel CSS `--sl-h` (desktop) dan
 * `--sl-mh` (< 640px). Aturannya di-inline lewat <style> di komponen ini
 * agar tidak bergantung pada cache/rebuild globals.css.
 */
import type { CSSProperties } from "react";

const LOGO_CSS = `
.site-logo {
  --sl-h: 36px;
  --sl-mh: var(--sl-h);
  position: relative;
  display: inline-block;
  flex-shrink: 0;
  overflow: hidden;
  vertical-align: middle;
  height: var(--sl-mh);
  width: calc(var(--sl-mh) * 6.949);
}
.site-logo > img {
  position: absolute;
  max-width: none;
  height: calc(var(--sl-mh) * 2.6596);
  width: calc(var(--sl-mh) * 7.2659);
  top: calc(var(--sl-mh) * -0.617);
  left: calc(var(--sl-mh) * -0.1383);
}
@media (min-width: 640px) {
  .site-logo {
    height: var(--sl-h);
    width: calc(var(--sl-h) * 6.949);
  }
  .site-logo > img {
    height: calc(var(--sl-h) * 2.6596);
    width: calc(var(--sl-h) * 7.2659);
    top: calc(var(--sl-h) * -0.617);
    left: calc(var(--sl-h) * -0.1383);
  }
}
`;

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
      <style>{LOGO_CSS}</style>
      <img
        src="https://cdn.webkalcer.com/images-web/webkalcer-logo.png"
        alt="WebKalcer"
      />
    </span>
  );
}
