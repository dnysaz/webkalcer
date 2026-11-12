import type { Metadata } from "next";
import Link from "next/link";
import LandingNavbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Kontak Kami — WebKalcer",
  description:
    "Hubungi tim WebKalcer untuk konsultasi pembuatan website, hosting statis gratis, custom domain, dan dukungan teknis — lewat WhatsApp, email, atau media sosial.",
};

const CHANNELS = [
  {
    icon: "fa-brands fa-whatsapp",
    iconColor: "text-[#25D366]",
    title: "WhatsApp",
    desc: "Kanal tercepat — hampir selalu dibalas pada jam kerja. Sempurna untuk konsultasi singkat, cek progres, dan penawaran.",
    action: "Chat 0858-0556-6344",
    href: "https://wa.me/6285805566344?text=Halo%20WebKalcer%2C%20saya%20ingin%20konsultasi%20website",
    external: true,
  },
  {
    icon: "fa-regular fa-envelope",
    iconColor: "text-blue",
    title: "Email",
    desc: "Untuk penawaran formal, invoice, somasi, atau lampiran berkas besar. Sertakan nama dan kebutuhan Anda agar cepat ditindaklanjuti.",
    action: "halo@webkalcer.com",
    href: "mailto:halo@webkalcer.com",
    external: false,
  },
  {
    icon: "fa-solid fa-clock",
    iconColor: "text-orange",
    title: "Jam layanan",
    desc: "Senin–Sabtu, 09.00–17.00 WIB. Pesan di luar jam tersebut tetap kami baca dan dibalas pada hari kerja berikutnya.",
    action: "Senin–Sabtu · 09.00–17.00",
    href: null as string | null,
    external: false,
  },
  {
    icon: "fa-solid fa-location-dot",
    iconColor: "text-red",
    title: "Alamat",
    desc: "Jakarta, Indonesia. Kami bekerja secara remote — seluruh proses dari konsultasi hingga situs tayang bisa dilakukan via online.",
    action: "Jakarta, Indonesia",
    href: null as string | null,
    external: false,
  },
];

const SOCIALS = [
  { href: "https://instagram.com/webkalcer", icon: "fa-brands fa-instagram", label: "Instagram" },
  { href: "https://twitter.com/webkalcer", icon: "fa-brands fa-x-twitter", label: "Twitter / X" },
  { href: "https://github.com/webkalcer", icon: "fa-brands fa-github", label: "GitHub" },
];

export default function KontakPage() {
  return (
    <>
      <LandingNavbar />
      <main id="main-content" className="flex-1 bg-white">
        <div className="wrap py-10 sm:py-16">
          {/* Breadcrumb */}
          <p className="text-base text-mute">
            <Link href="/" className="hover:text-blue">
              Beranda
            </Link>
            <span className="mx-2 text-line" aria-hidden="true">
              ›
            </span>
            <span className="text-ink">Kontak Kami</span>
          </p>

          <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
            Kontak <span className="text-blue">Kami</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-mute">
            Ada pertanyaan seputar pembuatan website, hosting statis gratis,
            atau ingin diskusi kebutuhan digital bisnis Anda? Pilih kanal yang
            paling nyaman — kami senang membantu.
          </p>

          {/* Kartu kanal kontak */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {CHANNELS.map((c) => {
              const inner = (
                <>
                  <i
                    className={`${c.icon} ${c.iconColor} text-3xl`}
                    aria-hidden="true"
                  />
                  <h2 className="mt-4 text-xl font-medium tracking-tight text-ink">
                    {c.title}
                  </h2>
                  <p className="mt-2 text-base leading-relaxed text-mute">
                    {c.desc}
                  </p>
                  <p className="mt-4 text-base font-medium text-blue">
                    {c.action}
                    {c.href && (
                      <i
                        className="fa-solid fa-arrow-right ml-2 text-sm"
                        aria-hidden="true"
                      />
                    )}
                  </p>
                </>
              );
              return c.href ? (
                <a
                  key={c.title}
                  href={c.href}
                  {...(c.external
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                  className="btn rounded-3xl border border-line bg-white p-6 sm:p-7"
                >
                  {inner}
                </a>
              ) : (
                <div
                  key={c.title}
                  className="rounded-3xl border border-line bg-soft p-6 sm:p-7"
                >
                  {inner}
                </div>
              );
            })}
          </div>

          {/* Kanal tercepat — CTA besar */}
          <div className="mt-8 rounded-3xl bg-ink p-6 sm:p-10">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div className="max-w-xl">
                <p className="text-sm font-medium uppercase tracking-wide text-white/60">
                  Paling cepat
                </p>
                <h2 className="mt-1 text-2xl font-medium tracking-tight text-white sm:text-3xl">
                  Tanya langsung lewat WhatsApp
                </h2>
                <p className="mt-2 text-base leading-relaxed text-white/80">
                  Ceritakan kebutuhan Anda — kami bantu estimasi biaya, waktu
                  pengerjaan, dan apakah hosting gratis cocok untuk Anda.
                </p>
              </div>
              <a
                href="https://wa.me/6285805566344?text=Halo%20WebKalcer%2C%20saya%20ingin%20konsultasi%20website"
                target="_blank"
                rel="noreferrer"
                className="btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-4 text-lg font-medium text-[#075E54] sm:w-auto"
              >
                <i className="fa-brands fa-whatsapp text-2xl" aria-hidden="true" />
                Chat sekarang
              </a>
            </div>
          </div>

          {/* Media sosial + dokumen terkait */}
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-line bg-soft p-6 sm:p-8">
              <h2 className="text-xl font-medium tracking-tight text-ink">
                Ikuti kami
              </h2>
              <p className="mt-2 text-base leading-relaxed text-mute">
                Tips website, update fitur hosting gratis, dan promo — ikuti
                kanal resmi WebKalcer.
              </p>
              <div className="mt-5 flex gap-3">
                {SOCIALS.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="grid h-12 w-12 place-items-center rounded-full border border-line bg-white text-ink transition-all hover:bg-blue hover:text-white"
                  >
                    <i className={`${s.icon} fa-lg`} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-line bg-soft p-6 sm:p-8">
              <h2 className="text-xl font-medium tracking-tight text-ink">
                Dokumen terkait
              </h2>
              <p className="mt-2 text-base leading-relaxed text-mute">
                Sebelum menghubungi, mungkin jawaban sudah tersedia di dokumen
                resmi kami.
              </p>
              <ul className="mt-5 space-y-3 text-base">
                <li>
                  <Link href="/terms" className="flex items-center gap-3 text-ink hover:text-blue">
                    <i className="fa-solid fa-file-lines w-5 text-center text-mute" aria-hidden="true" />
                    Syarat &amp; Ketentuan
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="flex items-center gap-3 text-ink hover:text-blue">
                    <i className="fa-solid fa-shield-halved w-5 text-center text-mute" aria-hidden="true" />
                    Kebijakan Privasi
                  </Link>
                </li>
                <li>
                  <Link href="/#harga" className="flex items-center gap-3 text-ink hover:text-blue">
                    <i className="fa-solid fa-tags w-5 text-center text-mute" aria-hidden="true" />
                    Paket &amp; Harga WebKalcer
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
