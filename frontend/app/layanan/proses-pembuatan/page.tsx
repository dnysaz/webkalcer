import type { Metadata } from "next";
import { pageSocial } from "@/lib/seo";
import Link from "next/link";
import ServiceShell, { ServiceCta } from "@/components/landing/service-shell";
import { ProsesIllustration } from "@/components/ilustrasi";

export const metadata: Metadata = {
  title: "Proses Pembuatan — WebKalcer",
  description:
    "Cara kerja WebKalcer dari konsultasi sampai situs online: tahapan, estimasi waktu, apa yang perlu Anda siapkan, revisi, dan skema pembayaran yang transparan.",
  ...pageSocial("Proses Pembuatan — WebKalcer", "Cara kerja WebKalcer dari konsultasi sampai situs online: tahapan, estimasi waktu, apa yang perlu Anda siapkan, revisi, dan skema pembayaran yang transparan.", "/layanan/proses-pembuatan"),
};

const STEPS = [
  {
    n: "1",
    color: "bg-blue",
    text: "text-white",
    title: "Konsultasi",
    desc: "Ceritakan usaha, target, dan referensi tampilan yang Anda suka. Kami dengarkan dulu — bukan menjual paket yang tidak cocok.",
    details: [
      "Via WhatsApp atau form pesan di situs",
      "Kami tanya soal tujuan, target, dan budget",
      "Keluar dengan rekomendasi paket yang jujur",
      "Estimasi biaya & waktu tertulis sebelum mulai",
    ],
    eta: "± 1 hari",
  },
  {
    n: "2",
    color: "bg-red",
    text: "text-white",
    title: "Desain",
    desc: "Kami siapkan rancangan tampilan untuk Anda setujui — sebelum satu baris kode pun ditulis.",
    details: [
      "Wireframe/struktur konten dulu, lalu visual",
      "Mengikuti identitas brand Anda (warna, font, logo)",
      "2–3 ronde revisi sesuai paket",
      "Deal dulu, baru lanjut ke pembangunan",
    ],
    eta: "± 1–3 hari kerja",
  },
  {
    n: "3",
    color: "bg-orange",
    text: "text-ink",
    title: "Pembangunan",
    desc: "Desain diubah menjadi website yang cepat, rapi, dan responsif di semua perangkat.",
    details: [
      "Dibangun statis — ringan dan loading singkat",
      "Tombol WhatsApp, form kontak, SEO dasar",
      "Preview link untuk Anda cek sebelum rilis",
      "Revisi minor di tahap ini tetap dilayani",
    ],
    eta: "± 2–5 hari kerja",
  },
  {
    n: "4",
    color: "bg-blue",
    text: "text-white",
    title: "Online",
    desc: "Website tayang di hosting WebKalcer atau domain Anda sendiri — dan Anda pegang kontrolnya.",
    details: [
      "Tayang di nama.webkalcer.com (gratis) atau domain Anda",
      "HTTPS aktif otomatis via Cloudflare",
      "Serah terima: akses, panduan update konten",
      "Pelunasan sebelum/ saat situs rilis",
    ],
    eta: "Hari yang sama",
  },
];

export default function ProsesPage() {
  return (
    <ServiceShell
      current="Proses Pembuatan"
      label="Layanan · Proses Pembuatan"
      color="bg-blue"
      title={
        <>
          Dari obrolan sampai online,{" "}
          <span className="text-blue">tanpa ribet.</span>
        </>
      }
      intro="Empat tahap yang selalu sama untuk setiap proyek — karena keterbukaan dari awal adalah cara terbaik menghindari salah paham di akhir."
      illustration={<ProsesIllustration />}
    >
      {/* Langkah-langkah */}
      <ol className="grid gap-5 md:grid-cols-2">
        {STEPS.map((s) => (
          <li
            key={s.n}
            className="rounded-3xl border border-line bg-white p-6 sm:p-8"
          >
            <div className="flex items-center justify-between gap-4">
              <span
                className={`grid h-12 w-12 place-items-center rounded-full text-xl font-medium ${s.color} ${s.text}`}
              >
                {s.n}
              </span>
              <span className="rounded-full bg-soft px-4 py-1.5 font-mono text-xs text-mute">
                {s.eta}
              </span>
            </div>
            <h2 className="mt-5 text-2xl font-medium tracking-tight text-ink">
              {s.title}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-mute">
              {s.desc}
            </p>
            <ul className="mt-4 space-y-2 border-t border-line pt-4 text-base leading-relaxed">
              {s.details.map((d) => (
                <li key={d} className="flex gap-3 text-mute">
                  <span className="font-bold text-blue">✓</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Yang perlu disiapkan */}
        <section className="rounded-3xl border border-line bg-soft p-6 sm:p-8">
          <h2 className="text-xl font-medium tracking-tight text-ink">
            Yang perlu Anda siapkan
          </h2>
          <ul className="mt-4 space-y-3 text-base leading-relaxed">
            {[
              "Konten: teks, foto produk/usaha, logo",
              "Minimal 1–2 referensi tampilan yang Anda suka",
              "Akses domain (bila sudah punya) — atau pakai .my.id/.web.id gratis",
              "Kontak yang aktif untuk feedback (WhatsApp paling cepat)",
              "Keputusan cepat di tiap tahap — makin cepat Anda approve, makin cepat rilis",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-mute">
                <span className="font-bold text-orange">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Pembayaran & revisi */}
        <section className="rounded-3xl border border-line bg-soft p-6 sm:p-8">
          <h2 className="text-xl font-medium tracking-tight text-ink">
            Pembayaran &amp; revisi
          </h2>
          <ul className="mt-4 space-y-3 text-base leading-relaxed">
            {[
              "DP di awal sebagai tanda jadi — pengerjaan dimulai setelah DP",
              "Pelunasan sebelum situs rilis / serah terima akses",
              "Revisi 2–3 ronde per tahap sesuai paket yang dipilih",
              "Revisi besar (ganti arah desain) dihitung sebagai pekerjaan tambahan",
              "DP hangus bila pembatalan dari sisi Anda setelah desain dimulai",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-mute">
                <span className="font-bold text-blue">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-mute">
            Detail lengkap ada di{" "}
            <Link href="/terms" className="text-blue hover:underline">
              Syarat &amp; Ketentuan
            </Link>
            . Pertanyaan spesifik? Chat kami — jawaban selalu gratis.
          </p>
        </section>
      </div>

      <ServiceCta
        kicker="Mulai dari konsultasi"
        title="Ceritakan usaha Anda"
        desc="Tidak perlu siapkan apa pun dulu — chat saja. Kami bantu tentukan paket yang pas, gratis."
        primary={{
          href: "https://wa.me/6285805566344?text=Halo%20WebKalcer%2C%20saya%20ingin%20konsultasi%20pembuatan%20website",
          label: "Chat WhatsApp",
          external: true,
        }}
        secondary={{ href: "/layanan", label: "Lihat layanan" }}
      />
    </ServiceShell>
  );
}
