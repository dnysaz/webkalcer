import type { Metadata } from "next";
import Link from "next/link";
import LandingNavbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { ServiceCta } from "@/components/landing/service-shell";
import {
  KafeIllustration,
  PersonalBrandingIllustration,
  PerusahaanIllustration,
  WebsiteCustomIllustration,
  BeritaIllustration,
  DashboardIllustration,
  TokoOnlineIllustration,
  SaasIllustration,
  BaasIllustration,
  UmkmIllustration,
  RetailIllustration,
  InstansiIllustration,
  TechStackIllustration,
  AiIllustration,
  ServerIllustration,
} from "@/components/ilustrasi";

export const metadata: Metadata = {
  title: "Layanan — WebKalcer",
  description:
    "WebKalcer untuk personal branding, landing page perusahaan, website custom, berita, dashboard, toko online, SaaS, BaaS, UMKM, retail, instansi, tech stack modern, AI, dan server berkualitas.",
};

type UseCase = {
  title: string;
  desc: string;
  points: string[];
  service: { href: string; label: string };
  Illustration: () => React.JSX.Element;
};

const USE_CASES: UseCase[] = [
  {
    title: "Landing page personal branding",
    desc: "Profil yang meyakinkan dalam satu halaman — tentang siapa Anda, karya terbaik, dan cara menghubungi. Cocok untuk freelancer, kreator, konsultan, dan profesional yang ingin tampil serius.",
    points: [
      "Halaman profil, keahlian, dan pencapaian",
      "Galeri karya/proyek + tautan media sosial",
      "Tombol kontak & WhatsApp langsung",
    ],
    service: { href: "/layanan/landing-page-statis", label: "Landing Page Statis" },
    Illustration: PersonalBrandingIllustration,
  },
  {
    title: "Landing page perusahaan",
    desc: "Company profile yang menjelaskan bisnis Anda secara profesional — bukan sekadar daftar layanan. Membangun kepercayaan calon klien sebelum mereka menghubungi.",
    points: [
      "Struktur profil, layanan, dan tim",
      "Kredibilitas: klien, sertifikasi, pencapaian",
      "Form kontak & info lokasi",
    ],
    service: { href: "/layanan/landing-page-statis", label: "Landing Page Statis" },
    Illustration: PerusahaanIllustration,
  },
  {
    title: "Website custom",
    desc: "Struktur, konten, dan fitur dirancang mengikuti alur bisnis Anda — bukan template yang dipaksa cocok. Dari kebutuhan multi-halaman sampai tata letak khusus.",
    points: [
      "Halaman & fitur sesuai kebutuhan",
      "Konsultasi struktur sebelum desain",
      "Desain khusus identitas brand",
    ],
    service: { href: "/layanan/website-custom", label: "Website Custom" },
    Illustration: WebsiteCustomIllustration,
  },
  {
    title: "Website berita",
    desc: "Portal berita atau konten dengan hierarki yang jelas: headline utama, kategori, dan halaman artikel yang nyaman dibaca di HP maupun desktop.",
    points: [
      "Beranda headline + daftar artikel",
      "Kategori dan halaman detail berita",
      "Struktur SEO dasar (judul, meta, sitemap)",
    ],
    service: { href: "/layanan/website-custom", label: "Website Custom" },
    Illustration: BeritaIllustration,
  },
  {
    title: "Dashboard aplikasi",
    desc: "Antarmuka dashboard untuk produk atau operasional internal — data, status, dan kontrol dalam satu layar. Statis untuk tampilan; data dinamis menyusul lewat integrasi.",
    points: [
      "Layout sidebar + area data",
      "Kartu statistik & grafik",
      "Tabel, filter, dan status monitoring",
    ],
    service: { href: "/layanan/website-custom", label: "Website Custom" },
    Illustration: DashboardIllustration,
  },
  {
    title: "Toko online",
    desc: "Katalog produk yang rapi dengan jalur pemesanan langsung ke WhatsApp. Jujur sejak awal: ini bukan keranjang belanja dengan pembayaran otomatis — cocok untuk UMKM yang mengutamakan obrolan dulu.",
    points: [
      "Katalog & kategori produk",
      "Halaman detail produk + foto",
      "Pemesanan via WhatsApp",
    ],
    service: { href: "/layanan/landing-page-statis", label: "Landing Page Statis" },
    Illustration: TokoOnlineIllustration,
  },
  {
    title: "SaaS",
    desc: "Website untuk produk SaaS: jelaskan fitur, harga, dan alasan memilih Anda — lalu arahkan pengunjung ke pendaftaran. Halaman marketing yang ringan dan cepat.",
    points: [
      "Halaman fitur & paket harga",
      "Dokumentasi/FAQ statis",
      "Halaman status & changelog",
    ],
    service: { href: "/layanan/website-custom", label: "Website Custom" },
    Illustration: SaasIllustration,
  },
  {
    title: "BaaS",
    desc: "Butuh backend (autentikasi, database, API) di balik situs statis? Kami bantu integrasi dengan layanan backend-as-a-service lewat konsultasi — situs tetap ringan, data tetap aman di penyedia terpercaya.",
    points: [
      "Rekomendasi arsitektur BaaS",
      "Integrasi auth & database dari situs statis",
      "Halaman statis + API pihak ketiga",
    ],
    service: { href: "/layanan/website-custom", label: "Website Custom" },
    Illustration: BaasIllustration,
  },
  {
    title: "UMKM",
    desc: "Paket paling terjangkau untuk usaha kecil yang ingin segera online dengan tampilan yang tidak murahan. Prosesnya sederhana dan hasilnya bisa langsung dibagikan.",
    points: [
      "Landing page hingga 5 halaman",
      "Hosting gratis di webkalcer.com",
      "Gratis domain .my.id / .web.id",
    ],
    service: { href: "/layanan/landing-page-statis", label: "Landing Page Statis" },
    Illustration: UmkmIllustration,
  },
  {
    title: "Toko retail",
    desc: "Informasi toko, katalog, dan promo — membantu pelanggan menemukan produk sebelum datang atau memesan. Cocok untuk toko fisik yang ingin jangkauan lebih luas.",
    points: [
      "Profil toko & jam operasional",
      "Katalog produk & harga",
      "Promo dan info cabang",
    ],
    service: { href: "/layanan/website-custom", label: "Website Custom" },
    Illustration: RetailIllustration,
  },
  {
    title: "Instansi menengah, perusahaan & daerah",
    desc: "Situs resmi instansi: profil, program, pengumuman, dan informasi publik yang mudah diakses semua kalangan — termasuk pengunjung dengan koneksi lambat.",
    points: [
      "Profil & struktur organisasi",
      "Berita, pengumuman, agenda",
      "Informasi publik & kontak layanan",
    ],
    service: { href: "/layanan/website-custom", label: "Website Custom" },
    Illustration: InstansiIllustration,
  },
  {
    title: "Tech stack modern",
    desc: "Dibangun dengan tools yang relevan — React/Next.js, Vite, dan Tailwind — lalu diekspor statis agar ringan. Kode rapi, mudah dikembangkan, dan tidak terikat vendor.",
    points: [
      "Framework modern & komponen rapi",
      "Static export, loading cepat",
      "Mudah dirawat & dikembangkan",
    ],
    service: { href: "/layanan/hosting-statis-gratis", label: "Hosting Statis Gratis" },
    Illustration: TechStackIllustration,
  },
  {
    title: "AI adoption",
    desc: "Kami memakai alat AI untuk mempercepat draf konten, riset, dan eksplorasi desain — tapi hasil akhir tetap diperiksa manusia. AI mempercepat proses, bukan menggantikan tanggung jawab.",
    points: [
      "Draf konten & variasi copy lebih cepat",
      "Riset struktur & referensi desain",
      "Review manual sebelum tayang",
    ],
    service: { href: "/layanan/proses-pembuatan", label: "Proses Pembuatan" },
    Illustration: AiIllustration,
  },
  {
    title: "Server berkualitas",
    desc: "Semua situs melewati Cloudflare dengan SSL gratis dan proteksi DDoS; origin di Singapura untuk latensi rendah ke Indonesia. Infrastruktur yang sama dipakai situs gratis maupun berbayar.",
    points: [
      "SSL/HTTPS otomatis",
      "Anti-DDoS di edge Cloudflare",
      "Origin Singapura, backend Go",
    ],
    service: { href: "/layanan/hosting-statis-gratis", label: "Hosting Statis Gratis" },
    Illustration: ServerIllustration,
  },
];

const CORE = [
  { href: "/layanan/landing-page-statis", label: "Landing Page Statis" },
  { href: "/layanan/website-custom", label: "Website Custom" },
  { href: "/layanan/hosting-statis-gratis", label: "Hosting Statis Gratis" },
  { href: "/layanan/proses-pembuatan", label: "Proses Pembuatan" },
];

export default function LayananPage() {
  return (
    <>
      <LandingNavbar />
      <main id="main-content" className="flex-1 bg-white">
        {/* Hero */}
        <section className="wrap pt-10 pb-12 sm:pt-16 sm:pb-16">
          <p className="text-base text-mute">
            <Link href="/" className="hover:text-blue">
              Beranda
            </Link>
            <span className="mx-2 text-line" aria-hidden="true">
              ›
            </span>
            <span className="text-ink">Layanan</span>
          </p>
          <div className="mt-6 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="flex items-center gap-2 text-base font-medium text-mute">
                <i className="h-3 w-3 rounded-full bg-blue" aria-hidden="true" />
                Layanan
              </p>
              <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl xl:text-6xl">
                Semua yang kami kerjakan,{" "}
                <span className="text-blue">dijelaskan.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-mute sm:text-xl">
                Bukan cuma untuk satu jenis usaha. Berikut jenis proyek yang
                paling sering kami kerjakan — dari personal branding sampai
                infrastruktur server.
              </p>
              <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-base">
                <span className="font-medium text-ink">Layanan inti:</span>
                {CORE.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="text-blue hover:underline"
                  >
                    {c.label}
                  </Link>
                ))}
              </p>
            </div>
            <div className="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full">
              <KafeIllustration />
            </div>
          </div>
        </section>

        {/* Section per use-case: 1 section = 1 ilustrasi */}
        {USE_CASES.map((u, i) => (
          <section
            key={u.title}
            className={`border-t border-line ${i % 2 === 1 ? "bg-soft" : "bg-white"}`}
          >
            <div className="wrap py-12 sm:py-16">
              <div className="grid items-center gap-9 lg:grid-cols-2 lg:gap-16">
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <p className="flex items-center gap-3 text-sm text-mute">
                    <span className="font-mono text-blue">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="h-px w-8 bg-line" aria-hidden="true" />
                    <span className="font-medium uppercase tracking-wide">
                      Cocok untuk
                    </span>
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                    {u.title}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-mute sm:text-lg">
                    {u.desc}
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {u.points.map((p) => (
                      <li key={p} className="flex gap-3 text-base text-mute">
                        <span className="font-bold text-blue">✓</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={u.service.href}
                    className="mt-6 inline-flex items-center gap-2 font-medium text-blue hover:underline"
                  >
                    Lihat layanan {u.service.label}
                    <i className="fa-solid fa-arrow-right text-sm" aria-hidden="true" />
                  </Link>
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full">
                    <u.Illustration />
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="wrap py-14 sm:py-20">
          <ServiceCta
            kicker="Tidak melihat jenis usaha Anda?"
            title="Ceritakan proyek Anda"
            desc="Daftar di atas bukan batasan. Selama situsnya bisa dibangun statis, kami bisa bantu — dan kalau tidak bisa, kami bilang terus terang."
            primary={{
              href: "https://wa.me/6285805566344?text=Halo%20WebKalcer%2C%20saya%20ingin%20konsultasi%20website",
              label: "Chat WhatsApp",
              external: true,
            }}
            secondary={{ href: "/kontak", label: "Kanal kontak lain" }}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
