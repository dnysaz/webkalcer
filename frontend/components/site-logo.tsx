/**
 * Logo WebKalcer (CDN).
 *
 * File asli 1366×500 RGBA dengan padding transparan tebal — glyph kata
 * "WebKalcer" hanya menempati kotak y=116..304 (tinggi 188) dan x=26..1333
 * (lebar 1307). Wrapper `overflow-hidden` memotong padding itu sehingga
 * tinggi visual logo = prop `height` (px).
 *
 * `mobileHeight` (opsional) dipakai di layar < sm (640px);
 * default = `height` (sama di semua breakpoint).
 */
export default function SiteLogo({
  height = 36,
  mobileHeight,
  className = "",
}: {
  height?: number;
  mobileHeight?: number;
  className?: string;
}) {
  const render = (h: number, visibleClass: string) => {
    const scale = h / 188;
    const imgW = 1366 * scale;
    const imgH = 500 * scale;
    const width = 1307 * scale;

    return (
      <span
        className={`relative inline-block shrink-0 overflow-hidden align-middle ${visibleClass} ${className}`}
        style={{ width, height: h }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://cdn.webkalcer.com/images-web/webkalcer-logo.png"
          alt="WebKalcer"
          width={Math.round(imgW)}
          height={Math.round(imgH)}
          className="absolute max-w-none"
          style={{
            width: imgW,
            height: imgH,
            maxWidth: "none",
            top: -116 * scale,
            left: -26 * scale,
          }}
        />
      </span>
    );
  };

  const mobile = mobileHeight ?? height;

  if (mobile === height) {
    return render(height, "");
  }

  return (
    <>
      {render(mobile, "sm:hidden")}
      {render(height, "hidden sm:inline-block")}
    </>
  );
}
