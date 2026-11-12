import type { Metadata } from "next";
import { pageSocial } from "@/lib/seo";
import Link from "next/link";
import ServiceShell, { ServiceCta } from "@/components/landing/service-shell";
import { ProdukIllustration } from "@/components/ilustrasi";

export const metadata: Metadata = {
  title: "Landing Page Statis — WebKalcer",
  description:
    "Landing page statis mulai Rp450.000: desain modern responsif, hingga 5 halaman, tombol WhatsApp & form kontak, hosting gratis di webkalcer.com, gratis domain .my.id/.web.id.",
  ...pageSocial("Landing Page Statis — WebKalcer", "Landing page statis mulai Rp450.000: desain modern responsif, hingga 5 halaman, tombol WhatsApp & form kontak, hosting gratis di webkalcer.com, gratis domain .my.id/.web.id.", "/layanan/landing-page-statis"),
};

export default function LandingPageStatisPage() {
  return (
    <ServiceShell
      current="Landing Page Statis"
      label="Layanan · Landing Page Statis"
      color="bg-blue"
      title={
        <>
          Satu halaman, <span className="text-blue">fokus menjual.</span>
        </>
      }
      intro="Landing page statis adalah halaman web satu tujuan — mengenalkan penawaran Anda dan mengarahkan pengunjung untuk bertindak (chat, pesan, atau daftar). Dibangun statis agar ringan dan loading singkat."
      illustration={<ProdukIllustration />}
    >
      {/* Fakta singkat */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: "fa-solid fa-tag", label: "Harga", value: "Rp450.000" },
          { icon: "fa-solid fa-file", label: "Maksimal", value: "5 halaman" },
          { icon: "fa-solid fa-clock", label: "Estimasi", value: "3–7 hari kerja*" },
          { icon: "fa-solid fa-server", label: "Hosting", value: "Gratis" },
        ].map((f) => (
          <div
            key={f.label}
            className="rounded-3xl border border-line bg-soft p-5"
          >
            <i className={`${f.icon} text-xl text-blue`} aria-hidden="true" />
            <p className="mt-3 text-sm font-medium uppercase tracking-wide text-mute">
              {f.label}
            </p>
            <p className="mt-1 text-lg font-medium text-ink">{f.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-mute">
        * Estimasi setelah materi (teks, foto, logo) lengkap dan desain
        disetujui. Tenggat pasti disepakati saat konsultasi.
      </p>

      {/* Apa itu */}
      <section className="mt-12">
        <h2 className="text-2xl font-medium tracking-tight text-ink sm:text-3xl">
          Apa itu landing page statis?
        </h2>
        <div className="mt-4 max-w-3xl space-y-4 text-lg leading-relaxed text-mute">
          <p>
            “Statis” berarti halaman dibangun dari HTML, CSS, dan JavaScript
            tanpa database atau server-side rendering — hasilnya{" "}
            <b className="text-ink">ringan, aman, dan sangat cepat</b>. Cocok
            untuk penawaran tunggal: produk, jasa, event, atau kampanye iklan.
          </p>
          <p>
            Berbeda dengan website multi-halaman biasa, landing page dirancang
            dengan <b className="text-ink">satu alur</b>: menarik perhatian →
            membangun minat → mengajak bertindak. Tidak ada menu yang
            membingungkan; semua jalan mengarah ke satu tombol — biasanya
            WhatsApp atau formulir pemesanan.
          </p>
        </div>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Yang termasuk */}
        <section className="rounded-3xl border border-line bg-white p-6 sm:p-8">
          <h2 className="text-xl font-medium tracking-tight text-ink">
            Yang termasuk
          </h2>
          <ul className="mt-4 space-y-3 text-base leading-relaxed">
            {[
              "Desain modern & responsif (HP, tablet, laptop)",
              "Hingga 5 halaman statis",
              "Tombol WhatsApp & form kontak",
              "Hosting gratis di WebKalcer (*.webkalcer.com)",
              "Gratis domain .my.id atau .web.id",
              "Revisi 2–3 ronde sesuai paket",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-mute">
                <span className="font-bold text-blue">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Cocok untuk */}
        <section className="rounded-3xl border border-line bg-white p-6 sm:p-8">
          <h2 className="text-xl font-medium tracking-tight text-ink">
            Cocok untuk
          </h2>
          <ul className="mt-4 space-y-3 text-base leading-relaxed">
            {[
              "UMKM & bisnis kuliner, salon, laundry, dll.",
              "Personal brand & portofolio",
              "Peluncuran produk atau jasa baru",
              "Kampanye iklan (Meta/Google Ads)",
              "Wedding organizer, event, atau kelas",
              "Toko online sederhana (katalog + WhatsApp)",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-mute">
                <span className="font-bold text-orange">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Yang tidak termasuk */}
      <section className="mt-8 rounded-3xl border border-line bg-soft p-6 sm:p-8">
        <h2 className="text-xl font-medium tracking-tight text-ink">
          Yang tidak termasuk
        </h2>
        <p className="mt-2 text-base leading-relaxed text-mute">
          Jujur biar tidak salah ekspektasi: landing page statis{" "}
          <b className="text-ink">bukan</b> untuk sistem yang butuh login,
          keranjang belanja yang kompleks, atau database — itu masuk paket{" "}
          <Link href="/layanan/website-custom" className="text-blue hover:underline">
            Website Custom
          </Link>{" "}
          atau perlu diskusi lebih dulu. Konten (teks, foto, logo) dari Anda;
          kami bantu rapikan strukturnya.
        </p>
      </section>

      <ServiceCta
        kicker="Mulai Rp450.000"
        title="Siap bikin landing page Anda?"
        desc="Klik tombol di bawah untuk mengisi form pemesanan, atau chat dulu kalau masih ragu. Konsultasi awal tidak dipungut biaya."
        primary={{
          href: "/pesan-dan-diskusi?paket=landing-page",
          label: "Pesan paket ini",
        }}
        secondary={{ href: "/kontak", label: "Tanya dulu" }}
      />
    </ServiceShell>
  );
}
