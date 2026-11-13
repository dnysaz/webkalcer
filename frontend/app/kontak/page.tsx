import type { Metadata } from "next";
import Link from "next/link";
import LandingNavbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { pageSocial } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Kontak Kami — WebKalcer",
  description:
    "Hubungi tim WebKalcer untuk konsultasi pembuatan website, hosting statis gratis, custom domain, dan dukungan teknis — lewat WhatsApp, email, atau media sosial.",
  ...pageSocial(
    "Kontak Kami — WebKalcer",
    "Hubungi tim WebKalcer untuk konsultasi pembuatan website, hosting statis gratis, custom domain, dan dukungan teknis — lewat WhatsApp, email, atau media sosial.",
    "/kontak",
  ),
};

const WA_LINK =
  "https://wa.me/6285805566344?text=Halo%20WebKalcer%2C%20saya%20ingin%20konsultasi%20website";

type Channel = {
  key: string;
  icon: string;
  tint: string;
  color: string;
  title: string;
  desc: string;
  action: string;
  href?: string | null;
  external?: boolean;
};

const CHANNELS: Channel[] = [
  {
    key: "email",
    icon: "fa-regular fa-envelope",
    tint: "bg-blue/10",
    color: "text-blue",
    title: "Email",
    desc: "Untuk penawaran formal, invoice, atau lampiran berkas besar. Sertakan nama dan kebutuhan Anda agar cepat ditindaklanjuti.",
    action: "webkalcer@gmail.com",
    href: "mailto:webkalcer@gmail.com",
  },
  {
    key: "hours",
    icon: "fa-regular fa-clock",
    tint: "bg-orange/10",
    color: "text-orange",
    title: "Jam layanan",
    desc: "Senin–Sabtu, 09.00–17.00 WIB. Pesan di luar jam kerja tetap kami baca dan dibalas pada hari kerja berikutnya.",
    action: "Senin–Sabtu · 09.00–17.00 WIB",
    href: null,
  },
  {
    key: "address",
    icon: "fa-solid fa-location-dot",
    tint: "bg-red/10",
    color: "text-red",
    title: "Alamat",
    desc: "Kami bekerja secara remote — konsultasi hingga situs tayang bisa dilakukan sepenuhnya online.",
    action: "Denpasar, Bali — Indonesia",
    href: null,
  },
];

const SOCIALS = [
  {
    href: "https://instagram.com/webkalcer",
    icon: "fa-brands fa-instagram",
    label: "Instagram",
  },
  {
    href: "https://twitter.com/webkalcer",
    icon: "fa-brands fa-x-twitter",
    label: "Twitter / X",
  },
  {
    href: "https://github.com/webkalcer",
    icon: "fa-brands fa-github",
    label: "GitHub",
  },
];

const DOCS = [
  {
    href: "/terms",
    icon: "fa-solid fa-file-lines",
    label: "Syarat & Ketentuan",
    desc: "Ketentuan layanan, pembayaran, dan hak penggunaan.",
  },
  {
    href: "/privacy",
    icon: "fa-solid fa-shield-halved",
    label: "Kebijakan Privasi",
    desc: "Cara kami mengumpulkan, memakai, dan melindungi data Anda.",
  },
  {
    href: "/#harga",
    icon: "fa-solid fa-tags",
    label: "Paket & Harga",
    desc: "Landing page statis, website custom, dan hosting gratis.",
  },
];

function ChannelCard({ channel }: { channel: Channel }) {
  const body = (
    <>
      <span
        className={`grid h-11 w-11 place-items-center rounded-full ${channel.tint}`}
      >
        <i
          className={`${channel.icon} ${channel.color} text-lg`}
          aria-hidden="true"
        />
      </span>
      <h2 className="mt-5 text-lg font-medium tracking-tight text-ink">
        {channel.title}
      </h2>
      <p className="mt-2 flex-1 text-[15px] leading-relaxed text-mute">
        {channel.desc}
      </p>
      <span
        className={`mt-5 inline-flex items-center gap-2 text-base font-medium ${
          channel.href ? "text-blue group-hover:underline" : "text-ink"
        }`}
      >
        {channel.action}
        {channel.href && (
          <i
            className="fa-solid fa-arrow-right text-xs"
            aria-hidden="true"
          />
        )}
      </span>
    </>
  );

  const className =
    "group flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition-all hover:border-blue/40 hover:shadow-[0_1px_2px_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] sm:p-7";

  if (!channel.href) {
    return <div className={className}>{body}</div>;
  }

  return (
    <a
      href={channel.href}
      className={className}
      {...(channel.external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {body}
    </a>
  );
}

export default function KontakPage() {
  return (
    <>
      <LandingNavbar />
      <main id="main-content" className="flex-1 bg-white">
        <div className="wrap py-10 sm:py-16">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-mute">
            <Link href="/" className="hover:text-blue">
              Beranda
            </Link>
            <span className="text-line" aria-hidden="true">
              ›
            </span>
            <span className="text-ink">Kontak</span>
          </nav>

          {/* Header */}
          <header className="mt-6 max-w-2xl">
            <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight text-ink sm:text-5xl">
              Hubungi <span className="text-blue">WebKalcer</span>
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-mute">
              Ada pertanyaan seputar pembuatan website, hosting statis gratis,
              atau ingin berdiskusi soal kebutuhan digital bisnis Anda? Pilih
              kanal yang paling nyaman — kami senang membantu.
            </p>
          </header>

          {/* Kartu utama: WhatsApp */}
          <a
            href={WA_LINK}
            target="_blank"
            rel="noreferrer"
            className="group mt-10 flex flex-col gap-5 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/5 p-6 transition-all hover:border-[#25D366]/60 hover:shadow-[0_1px_2px_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] sm:flex-row sm:items-center sm:justify-between sm:p-7"
          >
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#25D366]/15">
                <i
                  className="fa-brands fa-whatsapp text-2xl text-[#25D366]"
                  aria-hidden="true"
                />
              </span>
              <div>
                <p className="text-lg font-medium tracking-tight text-ink">
                  Butuh jawaban cepat?
                </p>
                <p className="mt-1 text-[15px] leading-relaxed text-mute">
                  Chat tim kami di WhatsApp — biasanya dibalas dalam hitungan
                  menit pada jam kerja.
                </p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-base font-medium text-[#075E54] transition-transform group-hover:scale-[1.02]">
              <i className="fa-brands fa-whatsapp text-lg" aria-hidden="true" />
              Chat sekarang
            </span>
          </a>

          {/* Kartu kanal lain */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CHANNELS.map((channel) => (
              <ChannelCard key={channel.key} channel={channel} />
            ))}
          </div>

          {/* Ikuti kami + Dokumen */}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-line bg-white p-6 sm:p-7">
              <h2 className="text-lg font-medium tracking-tight text-ink">
                Ikuti kami
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-mute">
                Tips website, update fitur hosting gratis, dan promo — ikuti
                kanal resmi WebKalcer.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {SOCIALS.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-blue/40 hover:bg-blue/5 hover:text-blue"
                  >
                    <i className={`${s.icon} text-base`} aria-hidden="true" />
                    {s.label}
                  </a>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-white p-6 sm:p-7">
              <h2 className="text-lg font-medium tracking-tight text-ink">
                Dokumen terkait
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-mute">
                Mungkin jawaban Anda sudah tersedia di dokumen resmi kami.
              </p>
              <ul className="mt-4 divide-y divide-line">
                {DOCS.map((doc) => (
                  <li key={doc.href}>
                    <Link
                      href={doc.href}
                      className="group flex items-start gap-3 py-3.5"
                    >
                      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-soft">
                        <i
                          className={`${doc.icon} text-sm text-mute`}
                          aria-hidden="true"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-medium text-ink group-hover:text-blue">
                          {doc.label}
                        </span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-mute">
                          {doc.desc}
                        </span>
                      </span>
                      <i
                        className="fa-solid fa-chevron-right mt-3 text-xs text-line transition-colors group-hover:text-blue"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
