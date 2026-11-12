"use client";

function Logo() {
  return (
    <span className="text-2xl font-medium tracking-tight">
      <span className="text-blue">Web</span>
      <span className="text-red">Kal</span>
      <span className="text-orange">cer</span>
    </span>
  );
}

function FooterHeading({ children }: { children: string }) {
  return (
    <h3 className="mb-3 text-base font-medium text-ink">{children}</h3>
  );
}

function FooterLink({
  children,
  href,
  onClick,
}: {
  children: string;
  href?: string;
  onClick?: () => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };
  return (
    <a
      href={href ?? "#"}
      onClick={handleClick}
      className="text-base text-mute hover:text-blue transition-colors"
    >
      {children}
    </a>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-soft border-t border-line">
      <div className="wrap py-16 sm:py-20">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Kolom 1: Tentang */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Logo />
            </div>
            <p className="text-base text-mute leading-relaxed max-w-sm">
              Jasa pembuatan website profesional dan hosting statis gratis di
              Indonesia. Membantu bisnis Anda online dengan cepat, ringan, dan
              tanpa biaya hosting.
            </p>
            <p className="mt-4 text-sm text-mute">
              &copy; {year} WebKalcer. Hak cipta dilindungi undang-undang.
            </p>
          </div>

          {/* Kolom 2: Layanan & Produk */}
          <div>
            <FooterHeading>Layanan</FooterHeading>
            <ul className="space-y-2">
              <li>
                <FooterLink href="/layanan/landing-page-statis">Landing Page Statis</FooterLink>
              </li>
              <li>
                <FooterLink href="/layanan/website-custom">Website Custom</FooterLink>
              </li>
              <li>
                <FooterLink href="/layanan/hosting-statis-gratis">Hosting Statis Gratis</FooterLink>
              </li>
              <li>
                <FooterLink href="/layanan/proses-pembuatan">Proses Pembuatan</FooterLink>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Hukum */}
          <div>
            <FooterHeading>Hukum</FooterHeading>
            <ul className="space-y-2">
              <li>
                <FooterLink href="/terms">Syarat &amp; Ketentuan</FooterLink>
              </li>
              <li>
                <FooterLink href="/privacy">Kebijakan Privasi</FooterLink>
              </li>
              <li>
                <FooterLink href="/kontak">Kontak Kami</FooterLink>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Ikuti kami */}
          <div>
            <FooterHeading>Ikuti kami</FooterHeading>
            <p className="mb-3 text-sm text-mute max-w-sm">
              Dapatkan update terbaru, tips website, dan promo dari WebKalcer.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/webkalcer"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full bg-white border border-line text-ink hover:bg-blue hover:text-white transition-all"
                aria-label="Instagram"
              >
                <i className="fa-brands fa-instagram fa-lg" aria-hidden="true" />
              </a>
              <a
                href="https://twitter.com/webkalcer"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full bg-white border border-line text-ink hover:bg-blue hover:text-white transition-all"
                aria-label="Twitter / X"
              >
                <i className="fa-brands fa-x-twitter fa-lg" aria-hidden="true" />
              </a>
              <a
                href="https://github.com/webkalcer"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full bg-white border border-line text-ink hover:bg-blue hover:text-white transition-all"
                aria-label="GitHub"
              >
                <i className="fa-brands fa-github fa-lg" aria-hidden="true" />
              </a>
              <a
                href="https://wa.me/6285805566344"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full bg-white border border-line text-ink hover:bg-blue hover:text-white transition-all"
                aria-label="WhatsApp"
              >
                <i className="fa-brands fa-whatsapp fa-lg" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Garis pemisah + bar bawah */}
        <div className="mt-12 border-t border-line pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm text-mute">
            Hosting statis gratis di Indonesia ·{" "}
            <span className="font-mono text-ink">webkalcer.com</span>
          </p>
          <div className="flex items-center gap-6 text-sm text-mute">
            <FooterLink href="/terms">Syarat &amp; Ketentuan</FooterLink>
            <span className="h-3 w-3 rounded-full bg-line" />
            <FooterLink href="/privacy">Kebijakan Privasi</FooterLink>
            <span className="h-3 w-3 rounded-full bg-line" />
            <FooterLink href="/kontak">Kontak</FooterLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
