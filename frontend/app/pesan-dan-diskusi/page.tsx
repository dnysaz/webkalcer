import type { Metadata } from "next";
import { pageSocial } from "@/lib/seo";
import PaketForm from "@/components/pesan/paket-form";
import { PAKET, type PaketKey } from "@/components/pesan/paket-data";
import LandingNavbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Pesan & Diskusi — WebKalcer",
  description:
    "Pesan Landing Page Statis atau diskusikan kebutuhan Website Custom Anda dengan tim WebKalcer.",
  ...pageSocial("Pesan & Diskusi — WebKalcer", "Pesan Landing Page Statis atau diskusikan kebutuhan Website Custom Anda dengan tim WebKalcer.", "/pesan-dan-diskusi"),
};

export default async function PesanDanDiskusiPage({
  searchParams,
}: {
  searchParams: Promise<{ paket?: string | string[] }>;
}) {
  const { paket: raw } = await searchParams;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const paket: PaketKey = value === "website-custom" ? "website-custom" : "landing-page";
  const current = PAKET[paket];
  const accentText = current.accent === "blue" ? "text-blue" : "text-red";
  const accentBg = current.accent === "blue" ? "bg-blue" : "bg-red";

  return (
    <>
      <LandingNavbar />
      <main className="flex flex-1 flex-col bg-soft">
        <div className="wrap grid flex-1 gap-8 py-8 sm:py-14 lg:grid-cols-5 lg:gap-12">
        {/* ===== Ringkasan paket ===== */}
        <aside className="order-2 lg:order-1 lg:col-span-2">
          <p className="flex items-center gap-2 text-base font-medium text-ink">
            <i className={`h-3 w-3 rounded-full ${accentBg}`} />
            Ringkasan pilihan Anda
          </p>
          <h2 className="mt-3 text-4xl leading-[1.12] font-medium tracking-tight sm:text-5xl">
            {current.name}
          </h2>
          <p className={`mt-4 text-4xl font-medium sm:text-5xl ${accentText}`}>
            {current.harga}
          </p>
          <p className="mt-2 text-lg text-mute">{current.hargaSub}</p>

          <div className="mt-8 rounded-3xl border border-line bg-white p-6 sm:p-8">
            <p className="text-sm font-medium tracking-wide text-mute uppercase">
              Yang Anda dapatkan
            </p>
            <ul className="mt-4 space-y-4">
              {current.fitur.map((fitur) => (
                <li key={fitur} className="flex items-start gap-3 text-lg text-ink">
                  <span className={`font-mono font-bold ${accentText}`}>✓</span>
                  {fitur}
                </li>
              ))}
            </ul>
          </div>

          {/* Jaminan & kontak langsung */}
          <div className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-8">
            <p className="flex items-center gap-2 font-medium text-ink">
              <i className="fa-solid fa-shield-halved text-blue" aria-hidden="true" />
              Tanpa komitmen, tanpa bayar dulu
            </p>
            <p className="mt-2 text-base leading-relaxed text-mute">
              Isi formulir dulu — tim WebKalcer menghubungi Anda untuk
              konfirmasi kebutuhan &amp; estimasi, baru mulai pengerjaan
              setelah Anda setuju.
            </p>
            <a
              href="https://wa.me/6285805566344"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-base font-medium text-blue hover:underline"
            >
              <i className="fa-brands fa-whatsapp" aria-hidden="true" />
              Atau chat langsung: 0858-0556-6344
            </a>
          </div>
        </aside>

        {/* ===== Form ===== */}
        <div className="order-1 lg:order-2 lg:col-span-3">
          <PaketForm paket={paket} />
        </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
