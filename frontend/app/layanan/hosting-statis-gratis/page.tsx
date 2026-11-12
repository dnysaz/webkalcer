import type { Metadata } from "next";
import Link from "next/link";
import ServiceShell, { ServiceCta } from "@/components/landing/service-shell";
import { HostingIllustration } from "@/components/ilustrasi";

export const metadata: Metadata = {
  title: "Hosting Statis Gratis — WebKalcer",
  description:
    "Hosting statis gratis di subdomain Anda.webkalcer.com: upload ZIP atau hubungkan GitHub, deploy otomatis setiap push, SSL & anti-DDoS via Cloudflare, rollback 3 rilis terakhir.",
};

export default function HostingStatisPage() {
  return (
    <ServiceShell
      current="Hosting Statis Gratis"
      label="Layanan · Hosting Statis Gratis"
      color="bg-orange"
      title={
        <>
          Sudah punya website?{" "}
          <span className="text-orange">Hosting-nya gratis.</span>
        </>
      }
      intro="Upload hasil build website statis Anda — langsung online di subdomain Anda.webkalcer.com. Tanpa biaya, tanpa kartu kredit, tanpa batas waktu."
      illustration={<HostingIllustration />}
    >
      {/* Fakta singkat */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: "fa-solid fa-gift", label: "Biaya", value: "Gratis" },
          { icon: "fa-solid fa-globe", label: "Alamat", value: "Anda.webkalcer.com" },
          { icon: "fa-solid fa-lock", label: "SSL", value: "Otomatis (HTTPS)" },
          { icon: "fa-solid fa-gauge-high", label: "Kecepatan", value: "Via Cloudflare" },
        ].map((f) => (
          <div
            key={f.label}
            className="rounded-3xl border border-line bg-soft p-5"
          >
            <i className={`${f.icon} text-xl text-orange`} aria-hidden="true" />
            <p className="mt-3 text-sm font-medium uppercase tracking-wide text-mute">
              {f.label}
            </p>
            <p className="mt-1 text-lg font-medium text-ink">{f.value}</p>
          </div>
        ))}
      </div>

      {/* Apa itu */}
      <section className="mt-12">
        <h2 className="text-2xl font-medium tracking-tight text-ink sm:text-3xl">
          Apa itu Hosting Statis Gratis?
        </h2>
        <div className="mt-4 max-w-3xl space-y-4 text-lg leading-relaxed text-mute">
          <p>
            Hosting statis adalah tempat menayangkan website yang terdiri
            dari HTML, CSS, dan JavaScript — tanpa server dan database. Hasil
            build dari framework apa pun (React, Vue, Vite, Next.js static
            export, Hugo, dll.) bisa langsung di-upload dan langsung
            tayang.
          </p>
          <p>
            Sama seperti layanan berbayar, setiap situs melewati{" "}
            <b className="text-ink">Cloudflare</b> sebelum sampai ke
            pengunjung: SSL gratis, proteksi DDoS, dan akses cepat dari mana
            pun — termasuk Indonesia (origin server di Singapura).
          </p>
        </div>
      </section>

      {/* Cara deploy */}
      <section className="mt-12">
        <h2 className="text-2xl font-medium tracking-tight text-ink sm:text-3xl">
          Tiga cara deploy
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              n: "01",
              title: "Upload ZIP",
              desc: "Unggah folder website (.zip, maks 100 MB, index.html di root). Langsung online dalam hitungan detik.",
            },
            {
              n: "02",
              title: "Tempel link GitHub",
              desc: "Paste URL repository publik — kami clone, build, dan tayangkan. Cocok untuk proyek yang tidak di GitHub Anda.",
            },
            {
              n: "03",
              title: "Hubungkan GitHub",
              desc: "Login dengan GitHub, pilih repository — setiap push memicu build & deploy otomatis. Plus webhook untuk kontrol penuh.",
            },
          ].map((s) => (
            <li key={s.n} className="rounded-3xl border border-line bg-white p-6">
              <span className="font-mono text-blue">{s.n}</span>
              <h3 className="mt-2 text-xl font-medium text-ink">{s.title}</h3>
              <p className="mt-1.5 text-base leading-relaxed text-mute">
                {s.desc}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Yang didapat */}
        <section className="rounded-3xl border border-line bg-white p-6 sm:p-8">
          <h2 className="text-xl font-medium tracking-tight text-ink">
            Yang Anda dapatkan
          </h2>
          <ul className="mt-4 space-y-3 text-base leading-relaxed">
            {[
              "Subdomain Anda.webkalcer.com",
              "SSL & anti-DDoS via Cloudflare",
              "Deploy otomatis setiap push (GitHub)",
              "Rollback 3 rilis sukses terakhir",
              "Environment variables rahasia per project",
              "Custom domain sendiri + SSL otomatis",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-mute">
                <span className="font-bold text-orange">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Batasan */}
        <section className="rounded-3xl border border-line bg-white p-6 sm:p-8">
          <h2 className="text-xl font-medium tracking-tight text-ink">
            Batasan (jujur)
          </h2>
          <ul className="mt-4 space-y-3 text-base leading-relaxed">
            {[
              "Khusus situs statis — tanpa backend & database",
              "Arsip ZIP maksimal 100 MB per deploy",
              "index.html di root atau satu folder pembungkus",
              "Subdomain 3–30 karakter (huruf kecil, angka, strip)",
              "Upload ZIP tidak bisa re-deploy; update = project baru",
              "Bukan SLA berbayar — untuk bisnis kritis, tanya kami dulu",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-mute">
                <span className="font-bold text-red">×</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Link terkait */}
      <p className="mt-8 text-base leading-relaxed text-mute">
        Belum punya website? Kami bisa buatkan — lihat{" "}
        <Link href="/layanan/landing-page-statis" className="text-blue hover:underline">
          Landing Page Statis
        </Link>{" "}
        atau{" "}
        <Link href="/layanan/website-custom" className="text-blue hover:underline">
          Website Custom
        </Link>{" "}
        — hosting-nya tetap gratis.
      </p>

      <ServiceCta
        kicker="Gratis, selamanya"
        title="Deploy situs pertama Anda sekarang"
        desc="Daftar dengan GitHub atau Google — upload ZIP atau pilih repository, dan situs Anda tayang di webkalcer.com dalam hitungan menit."
        primary={{ href: "/login", label: "Deploy gratis" }}
        secondary={{ href: "/kontak", label: "Tanya dulu" }}
      />
    </ServiceShell>
  );
}
