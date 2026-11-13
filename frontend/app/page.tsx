import Link from "next/link";
import {
  FlowIllustration,
  HeroIllustration,
  HostingIllustration,
  KafeIllustration,
  PortofolioIllustration,
  ProdukIllustration,
} from "@/components/ilustrasi";
import LandingNavbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";

const SITE_DOMAIN = "webkalcer.com";

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://webkalcer.com/#organization",
      name: "WebKalcer",
      url: "https://webkalcer.com",
      logo: "https://cdn.webkalcer.com/images-web/webkalcer-logo.png",
      description:
        "Jasa pembuatan website profesional dan hosting statis gratis untuk UMKM & kreator di Indonesia.",
      areaServed: { "@type": "Country", name: "Indonesia" },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+62-858-0556-6344",
        contactType: "customer support",
        availableLanguage: ["Indonesian", "English"],
      },
      sameAs: [
        "https://instagram.com/webkalcer",
        "https://twitter.com/webkalcer",
        "https://github.com/webkalcer",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://webkalcer.com/#website",
      url: "https://webkalcer.com",
      name: "WebKalcer",
      description:
        "Jasa pembuatan website profesional untuk UMKM & kreator Indonesia: Landing Page Statis mulai Rp450.000 & hosting statis gratis di webkalcer.com.",
      inLanguage: "id-ID",
      publisher: { "@id": "https://webkalcer.com/#organization" },
    },
  ],
};

function SectionLabel({ color, children }: { color: string; children: string }) {
  return (
    <p className="flex items-center gap-2 text-base font-medium">
      <i className={`h-3 w-3 rounded-full ${color}`} />
      {children}
    </p>
  );
}

const PROCESS_STEPS = [
  {
    number: "1",
    title: "Konsultasi",
    desc: "Ceritakan usaha, target, dan referensi tampilan.",
    icon: "fa-regular fa-comments",
    dot: "bg-blue text-white",
    bar: "bg-blue",
    iconColor: "text-blue",
  },
  {
    number: "2",
    title: "Desain",
    desc: "Kami siapkan rancangan untuk Anda setujui.",
    icon: "fa-regular fa-pen-to-square",
    dot: "bg-red text-white",
    bar: "bg-red",
    iconColor: "text-red",
  },
  {
    number: "3",
    title: "Pembangunan",
    desc: "Desain diubah menjadi website yang cepat dan rapi.",
    icon: "fa-solid fa-code",
    dot: "bg-orange text-ink",
    bar: "bg-orange",
    iconColor: "text-orange",
  },
  {
    number: "4",
    title: "Online",
    desc: "Website tayang di hosting WebKalcer.",
    icon: "fa-solid fa-globe",
    dot: "bg-[#34A853] text-white",
    bar: "bg-[#34A853]",
    iconColor: "text-[#34A853]",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* NAV */}
      <LandingNavbar />

      <main className="flex-1">
        {/* 1. HERO */}
        <section className="wrap pt-12 pb-16 sm:pt-16 sm:pb-24 xl:pt-24">
          <div className="mx-auto max-w-6xl text-center">
            <h1 className="text-4xl leading-[1.08] font-medium sm:text-6xl xl:text-8xl">
              Website profesional untuk <span className="text-blue">bisnis</span> di Indonesia
            </h1>
            <p className="mx-auto mt-8 max-w-3xl text-xl leading-relaxed text-mute xl:text-2xl">
              Jasa pembuatan landing page dan website custom, mulai Rp450.000. Hosting statis gratis
              sudah termasuk.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="#harga"
                className="btn w-full rounded-full bg-blue px-8 py-4 text-center text-lg font-medium text-white sm:w-auto"
              >
                Lihat paket &amp; harga
              </a>
              <a
                href="#hosting"
                className="btn w-full rounded-full border border-line px-8 py-4 text-center text-lg font-medium text-blue hover:bg-soft sm:w-auto"
              >
                Deploy gratis
              </a>
            </div>
          </div>
          <div className="mt-16 mx-auto max-w-3xl">
            <div
              className="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
              role="img"
              aria-label="Ilustrasi pembuat website sedang bekerja di laptop"
            >
              <HeroIllustration />
            </div>
          </div>
        </section>

        {/* 2. LAYANAN */}
        <section id="layanan" className="wrap pb-16 sm:pb-24 xl:pb-32">
          <SectionLabel color="bg-blue">Layanan</SectionLabel>
          <h2 className="mt-3 max-w-none text-4xl leading-[1.12] font-medium sm:text-5xl xl:text-6xl">
            Pilih paket yang pas dengan skala usaha Anda.
          </h2>
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <article className="flex flex-col rounded-3xl bg-soft p-8 sm:p-12">
              <h3 className="text-3xl font-medium sm:text-4xl">Landing Page Statis</h3>
              <p className="mt-4 max-w-md text-xl text-mute">
                Profil usaha, promo, atau portofolio. Maksimal 5 halaman, tampil cepat dan mudah
                ditemukan.
              </p>
              <p className="mt-auto pt-12 text-5xl font-medium text-blue">
                <span className="text-xl text-mute">hanya </span>Rp450.000
              </p>
              <a
                href="/layanan/landing-page-statis"
                className="mt-6 inline-flex items-center gap-2 text-lg font-medium text-blue hover:underline"
              >
                Pelajari lebih lanjut
                <i className="fa-solid fa-arrow-up-right" aria-hidden="true" />
              </a>
            </article>
            <article className="flex flex-col rounded-3xl bg-soft p-8 sm:p-12">
              <h3 className="text-3xl font-medium sm:text-4xl">Website Custom</h3>
              <p className="mt-4 max-w-md text-xl text-mute">
                Fitur, halaman, dan alur dirancang khusus untuk bisnis Anda, dari konsultasi sampai
                rilis.
              </p>
              <p className="mt-auto pt-12 text-5xl font-medium text-red">
                <span className="text-xl text-mute">mulai </span>Rp999.999
              </p>
              <a
                href="/layanan/website-custom"
                className="mt-6 inline-flex items-center gap-2 text-lg font-medium text-red hover:underline"
              >
                Pelajari lebih lanjut
                <i className="fa-solid fa-arrow-up-right" aria-hidden="true" />
              </a>
            </article>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-6 sm:gap-10 xl:grid-cols-4">
            <div>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="12" rx="2" />
                <path d="M8 20h8M12 16v4" />
              </svg>
              <h4 className="mt-4 text-xl font-medium sm:mt-5 sm:text-2xl">Desain modern</h4>
              <p className="mt-2 text-mute">Bersih dan sesuai identitas brand Anda.</p>
            </div>
            <div>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D93025" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <rect x="7" y="2" width="10" height="20" rx="2" />
                <path d="M11 18h2" />
              </svg>
              <h4 className="mt-4 text-xl font-medium sm:mt-5 sm:text-2xl">Responsif</h4>
              <p className="mt-2 text-mute">Nyaman di HP, tablet, dan laptop.</p>
            </div>
            <div>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#EA6A12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
              </svg>
              <h4 className="mt-4 text-xl font-medium sm:mt-5 sm:text-2xl">Ringan &amp; cepat</h4>
              <p className="mt-2 text-mute">Dibangun statis agar loading singkat.</p>
            </div>
            <div>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="7" rx="2" />
                <rect x="3" y="14" width="18" height="7" rx="2" />
                <path d="M7 6.5h.01M7 17.5h.01" />
              </svg>
              <h4 className="mt-4 text-xl font-medium sm:mt-5 sm:text-2xl">Hosting termasuk</h4>
              <p className="mt-2 text-mute">Langsung online di WebKalcer, gratis.</p>
            </div>
          </div>
        </section>

        {/* 3. CONTOH */}
        <section id="contoh" className="bg-soft py-16 sm:py-24 xl:py-32">
          <div className="wrap">
            <SectionLabel color="bg-red">Contoh tampilan</SectionLabel>
            <h2 className="mt-3 max-w-none text-4xl leading-[1.12] font-medium sm:text-5xl xl:text-6xl">
              Satu standar kualitas untuk semua jenis usaha.
            </h2>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              <figure className="rounded-3xl bg-white p-4">
                <div
                  className="overflow-hidden rounded-2xl [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
                  role="img"
                  aria-label="Ilustrasi toko kopi"
                >
                  <KafeIllustration />
                </div>
                <figcaption className="px-3 pt-5 pb-2 text-xl font-medium">
                  Kafe &amp; restoran
                </figcaption>
              </figure>
              <figure className="rounded-3xl bg-white p-4">
                <div
                  className="overflow-hidden rounded-2xl [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
                  role="img"
                  aria-label="Ilustrasi portofolio kreatif"
                >
                  <PortofolioIllustration />
                </div>
                <figcaption className="px-3 pt-5 pb-2 text-xl font-medium">
                  Portofolio &amp; personal brand
                </figcaption>
              </figure>
              <figure className="rounded-3xl bg-white p-4">
                <div
                  className="overflow-hidden rounded-2xl [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
                  role="img"
                  aria-label="Ilustrasi toko online produk"
                >
                  <ProdukIllustration />
                </div>
                <figcaption className="px-3 pt-5 pb-2 text-xl font-medium">
                  Landing page produk
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 4. HARGA */}
        <section id="harga" className="wrap py-16 sm:py-24 xl:py-32">
          <SectionLabel color="bg-orange">Harga</SectionLabel>
          <h2 className="mt-3 max-w-none text-4xl leading-[1.12] font-medium sm:text-5xl xl:text-6xl">
            Harga terbuka dari awal, tanpa kejutan.
          </h2>
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <article className="flex flex-col rounded-3xl border-2 border-blue p-8 sm:p-12">
              <h3 className="text-3xl font-medium">Landing Page Statis</h3>
              <p className="mt-1 text-mute">Maksimal 5 halaman</p>
              <p className="mt-6 text-5xl font-medium text-blue sm:text-6xl">
                <span className="text-xl text-mute">hanya </span>Rp450.000
              </p>
              <ul className="mt-9 flex-1 space-y-4 text-lg sm:text-xl">
                <li><span className="mr-3 font-bold text-blue">✓</span>Desain modern &amp; responsif</li>
                <li><span className="mr-3 font-bold text-blue">✓</span>Hingga 5 halaman</li>
                <li><span className="mr-3 font-bold text-blue">✓</span>Tombol WhatsApp &amp; form kontak</li>
                <li><span className="mr-3 font-bold text-blue">✓</span>Hosting gratis di WebKalcer</li>
                <li><span className="mr-3 font-bold text-blue">✓</span>Gratis domain .my.id atau .web.id</li>
              </ul>
              <Link
                href="/pesan-dan-diskusi?paket=landing-page"
                className="btn mt-10 block rounded-full bg-blue py-4 text-center text-lg font-medium text-white"
              >
                Pesan paket ini
              </Link>
            </article>
            <article className="flex flex-col rounded-3xl border-2 border-red p-8 sm:p-12">
              <h3 className="text-3xl font-medium">Website Custom</h3>
              <p className="mt-1 text-mute">Sesuai kebutuhan bisnis</p>
              <p className="mt-6 text-5xl font-medium text-red sm:text-6xl">
                <span className="text-xl text-mute">mulai </span>Rp999.999
              </p>
              <ul className="mt-9 flex-1 space-y-4 text-lg sm:text-xl">
                <li><span className="mr-3 font-bold text-red">✓</span>Halaman &amp; fitur fleksibel</li>
                <li><span className="mr-3 font-bold text-red">✓</span>Konsultasi &amp; perencanaan struktur</li>
                <li><span className="mr-3 font-bold text-red">✓</span>Desain khusus identitas brand</li>
                <li><span className="mr-3 font-bold text-red">✓</span>Cloud hosting premium</li>
                <li><span className="mr-3 font-bold text-red">✓</span>Gratis domain .com</li>
                <li><span className="mr-3 font-bold text-red">✓</span>Support sampai rilis</li>
              </ul>
              <Link
                href="/pesan-dan-diskusi?paket=website-custom"
                className="btn mt-10 block rounded-full bg-red py-4 text-center text-lg font-medium text-white"
              >
                Diskusikan proyek
              </Link>
            </article>
          </div>
        </section>

        {/* 5. PROSES */}
        <section id="proses" className="bg-soft py-16 sm:py-24 xl:py-32">
          <div className="wrap">
            <SectionLabel color="bg-blue">Proses</SectionLabel>
            <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="max-w-2xl text-4xl leading-[1.12] font-medium sm:text-5xl xl:text-6xl">
                Dari obrolan sampai online, tanpa ribet.
              </h2>
              <p className="max-w-sm text-lg leading-relaxed text-mute">
                Empat langkah jelas — dari konsultasi awal sampai website Anda
                tayang.
              </p>
            </div>

            <div className="relative mt-14">
              <p className="mb-1 flex items-center justify-end gap-2 text-sm text-mute sm:hidden">
                Geser
                <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </p>
              <ol className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pt-8 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:p-0 xl:grid-cols-4">
                {PROCESS_STEPS.map((step, index) => (
                  <li
                    key={step.title}
                    className="relative w-[85%] shrink-0 snap-start sm:w-auto sm:shrink"
                  >
                    {index < PROCESS_STEPS.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute left-12 top-0 hidden h-px w-[calc(100%+1.5rem)] bg-line xl:block"
                      />
                    )}
                    <div className="relative flex h-full flex-col rounded-2xl border border-line bg-white p-6 pt-10 transition-all hover:border-blue/40 hover:shadow-[0_1px_2px_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] sm:p-7 sm:pt-10">
                      <span
                        className={`absolute -top-6 left-6 grid h-12 w-12 place-items-center rounded-full text-lg font-medium ring-4 ring-soft ${step.dot}`}
                      >
                        {step.number}
                      </span>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-mute">
                            Langkah 0{index + 1}
                          </p>
                          <h3 className="mt-1.5 text-xl font-medium tracking-tight text-ink">
                            {step.title}
                          </h3>
                        </div>
                        <i
                          className={`${step.icon} ${step.iconColor} mt-1 text-lg`}
                          aria-hidden="true"
                        />
                      </div>
                      <p className="mt-2 flex-1 text-[15px] leading-relaxed text-mute">
                        {step.desc}
                      </p>
                      <div
                        className="mt-6 flex items-center gap-2"
                        aria-hidden="true"
                      >
                        <span className={`h-1 w-9 rounded-full ${step.bar}`} />
                        <span className="h-1 flex-1 rounded-full bg-soft" />
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* 6. HOSTING GRATIS */}
        <section id="hosting" className="wrap py-16 sm:py-24 xl:py-32">
          <div className="grid items-center gap-14 rounded-[2rem] bg-soft p-8 sm:p-14 lg:grid-cols-2">
            <div>
              <SectionLabel color="bg-orange">Hosting gratis</SectionLabel>
              <h2 className="mt-3 text-4xl leading-[1.12] font-medium sm:text-5xl xl:text-6xl">
                Sudah punya website? Hosting statisnya gratis.
              </h2>
              <p className="mt-5 max-w-xl text-xl text-mute">
                Deploy tanpa biaya dan dapatkan subdomain{" "}
                <b className="font-mono text-base font-medium text-ink">nama.{SITE_DOMAIN}</b>.
              </p>
              <ul className="mt-9 divide-line border-y border-line divide-y">
                <li className="flex gap-5 py-5">
                  <span className="font-mono text-blue">01</span>
                  <div>
                    <b className="text-xl font-medium">Upload ZIP</b>
                    <p className="text-base text-mute">Unggah folder website, langsung online.</p>
                  </div>
                </li>
                <li className="flex gap-5 py-5">
                  <span className="font-mono text-red">02</span>
                  <div>
                    <b className="text-xl font-medium">Tempel link Git</b>
                    <p className="text-base text-mute">Paste URL repository, kami yang deploy.</p>
                  </div>
                </li>
                <li className="flex gap-5 py-5">
                  <span className="font-mono text-orange">03</span>
                  <div>
                    <b className="text-xl font-medium">Login GitHub</b>
                    <p className="text-base text-mute">Sinkron otomatis setiap kali Anda push.</p>
                  </div>
                </li>
              </ul>
              <Link
                href="/login"
                className="btn mt-9 inline-block rounded-full bg-blue px-8 py-4 text-lg font-medium text-white"
              >
                Deploy gratis
              </Link>
            </div>
            <div className="relative">
              <div
                className="overflow-hidden rounded-3xl bg-white [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
                role="img"
                aria-label="Ilustrasi upload ZIP dan repository ke cloud hosting"
              >
                <HostingIllustration />
              </div>
              <div className="absolute bottom-[-1.25rem] left-4 flex items-center gap-3 rounded-xl border border-line bg-white px-5 py-3 shadow-lg sm:left-8">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-blue font-bold text-white">✓</span>
                <div>
                  <div className="text-base font-medium">Deploy selesai</div>
                  <div className="font-mono text-xs text-mute">tokokopi.{SITE_DOMAIN}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== Keamanan & performa ===== */}
          <div className="mt-10 grid items-center gap-10 rounded-[2rem] border border-line bg-white p-8 sm:p-12 lg:grid-cols-2">
            <div>
              <SectionLabel color="bg-blue">Keamanan &amp; performa</SectionLabel>
              <h3 className="mt-3 text-3xl leading-[1.15] font-medium sm:text-4xl xl:text-5xl">
                SSL gratis &amp; anti-DDoS, otomatis.
              </h3>
              <p className="mt-4 max-w-md text-lg text-mute">
                Setiap situs Anda melewati Cloudflare sebelum menyentuh server —
                aman, terenkripsi, dan cepat diakses dari mana pun.
              </p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                <li className="flex gap-3">
                  <span className="font-mono font-bold text-blue">✓</span>
                  <div>
                    <b className="font-medium">SSL gratis</b>
                    <p className="text-base text-mute">HTTPS otomatis untuk semua situs via Cloudflare, tanpa biaya tambahan.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono font-bold text-red">✓</span>
                  <div>
                    <b className="font-medium">Anti-DDoS</b>
                    <p className="text-base text-mute">Serangan tersaring di edge Cloudflare sebelum mencapai situs Anda.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono font-bold text-orange">✓</span>
                  <div>
                    <b className="font-medium">Backend Go</b>
                    <p className="text-base text-mute">Dibangun dengan Go — proses build &amp; serving super cepat, performa maksimal.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono font-bold text-blue">✓</span>
                  <div>
                    <b className="font-medium">Server Singapura</b>
                    <p className="text-base text-mute">Origin di Singapura — latensi rendah untuk pengunjung Indonesia.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <div className="rounded-3xl bg-soft p-6 sm:p-8 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full">
                <FlowIllustration />
              </div>
              <p className="mt-4 text-center font-mono text-sm text-mute">
                Pengunjung → Cloudflare →{" "}
                <span className="text-ink">*.{SITE_DOMAIN}</span>
              </p>
            </div>
          </div>
        </section>

        {/* 7. CTA */}
        <section id="kontak" className="bg-blue py-16 text-center text-white sm:py-24">
          <div className="wrap">
            <h2 className="mx-auto max-w-none text-4xl leading-[1.1] font-medium sm:text-6xl xl:text-7xl">
              Yuk, bikin website bisnis Anda.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-xl">
              Deploy website Anda sendiri gratis, atau ceritakan kebutuhan Anda untuk jasa
              pembuatan.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/login"
                className="btn inline-block w-full rounded-full bg-white px-9 py-4 text-lg font-medium text-blue sm:w-auto"
              >
                Mulai deploy gratis
              </Link>
              <a
                href="https://wa.me/6285805566344"
                className="btn inline-block w-full rounded-full border border-white/60 px-9 py-4 text-lg font-medium text-white sm:w-auto"
              >
                Chat via WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
    </>
  );
}
