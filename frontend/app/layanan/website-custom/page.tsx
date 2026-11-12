import type { Metadata } from "next";
import Link from "next/link";
import ServiceShell, { ServiceCta } from "@/components/landing/service-shell";
import { PortofolioIllustration } from "@/components/ilustrasi";

export const metadata: Metadata = {
  title: "Website Custom — WebKalcer",
  description:
    "Website custom mulai Rp999.999: struktur & fitur fleksibel, konsultasi perencanaan, desain sesuai identitas brand, cloud hosting premium, gratis domain .com, support sampai rilis.",
};

export default function WebsiteCustomPage() {
  return (
    <ServiceShell
      current="Website Custom"
      label="Layanan · Website Custom"
      color="bg-red"
      title={
        <>
          Website yang dibangun{" "}
          <span className="text-red">untuk bisnis Anda.</span>
        </>
      }
      intro="Bukan template — struktur halaman, fitur, dan tampilan disesuaikan dengan cara bisnis Anda bekerja. Dari company profile hingga katalog produk yang lengkap."
      illustration={<PortofolioIllustration />}
    >
      {/* Fakta singkat */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: "fa-solid fa-tag", label: "Harga", value: "Mulai Rp999.999" },
          { icon: "fa-solid fa-layer-group", label: "Halaman", value: "Fleksibel" },
          { icon: "fa-solid fa-earth-asia", label: "Domain", value: "Gratis .com" },
          { icon: "fa-solid fa-headset", label: "Support", value: "Sampai rilis" },
        ].map((f) => (
          <div
            key={f.label}
            className="rounded-3xl border border-line bg-soft p-5"
          >
            <i className={`${f.icon} text-xl text-red`} aria-hidden="true" />
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
          Apa itu Website Custom?
        </h2>
        <div className="mt-4 max-w-3xl space-y-4 text-lg leading-relaxed text-mute">
          <p>
            Website Custom adalah paket pembuatan website{" "}
            <b className="text-ink">multi-halaman tanpa batasan 5 halaman</b>,
            dikerjakan dari nol mengikuti karakter bisnis Anda: struktur menu,
            urutan konten, gaya visual, hingga tone of voice.
          </p>
          <p>
            Prosesnya selalu dimulai dari{" "}
            <b className="text-ink">sesi konsultasi &amp; perencanaan</b> —
            kami pelajari apa yang Anda jual, siapa targetnya, dan bagaimana
            pengunjung ideal akan bergerak dari beranda sampai menghubungi
            Anda. Baru setelah itu desain dibuat.
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
              "Halaman & fitur fleksibel sesuai kebutuhan",
              "Konsultasi & perencanaan struktur website",
              "Desain khusus sesuai identitas brand",
              "Cloud hosting premium (bukan hosting gratis)",
              "Gratis domain .com",
              "Support penuh sampai situs rilis",
              "Revisi desain sesuai kesepakatan paket",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-mute">
                <span className="font-bold text-red">✓</span>
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
              "Company profile perusahaan & agency",
              "Toko dengan katalog produk besar",
              "Sekolah, organisasi, dan lembaga",
              "Jasa profesional (klinik, konsultan, notaris, dll.)",
              "Bisnis yang butuh banyak halaman & portofolio",
              "Brand yang ingin tampil beda dari kompetitor",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-mute">
                <span className="font-bold text-orange">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Perbandingan singkat */}
      <section className="mt-8 rounded-3xl border border-line bg-soft p-6 sm:p-8">
        <h2 className="text-xl font-medium tracking-tight text-ink">
          Landing Page vs Website Custom?
        </h2>
        <p className="mt-2 text-base leading-relaxed text-mute">
          Butuh satu penawaran yang fokus dan cepat tayang?{" "}
          <Link href="/layanan/landing-page-statis" className="text-blue hover:underline">
            Landing Page Statis
          </Link>{" "}
          cukup. Butuh banyak halaman, struktur kompleks, dan desain yang
          sepenuhnya milik brand Anda? Website Custom jawabannya. Ragu? Chat
          kami — kami akan jujur merekomendasikan yang paling masuk akal
          untuk budget Anda.
        </p>
      </section>

      <ServiceCta
        kicker="Mulai Rp999.999"
        title="Ceritakan proyek Anda"
        desc="Isi form diskusi — kami balas dengan estimasi biaya dan timeline yang masuk akal, bukan angka asal tembak."
        primary={{
          href: "/pesan-dan-diskusi?paket=website-custom",
          label: "Diskusikan proyek",
        }}
        secondary={{ href: "/kontak", label: "Tanya dulu" }}
      />
    </ServiceShell>
  );
}
