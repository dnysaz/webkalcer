import type { ReactNode } from "react";
import Link from "next/link";
import LandingNavbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";

export type LegalSection = {
  id: string;
  heading: string;
  body: ReactNode;
};

export default function LegalDoc({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <LandingNavbar />
      <main id="main-content" className="flex-1 bg-white">
        <div className="wrap py-10 sm:py-16">
          {/* Breadcrumb sederhana, gaya Google */}
          <p className="text-base text-mute">
            <Link href="/" className="hover:text-blue">
              Beranda
            </Link>
            <span className="mx-2 text-line" aria-hidden="true">
              ›
            </span>
            <span className="text-ink">{title}</span>
          </p>

          {/* Kepala dokumen */}
          <h1 className="mt-4 text-3xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-base text-mute sm:text-base">
            Terakhir diperbarui: {updated}
          </p>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink">
            {intro}
          </p>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {/* Daftar isi — gaya Google, menempel di kolom kiri pada desktop */}
            <aside className="lg:col-span-1">
              <nav
                aria-label="Daftar isi"
                className="rounded-3xl border border-line bg-soft p-5 sm:p-6 lg:sticky lg:top-28"
              >
                <p className="text-sm font-medium uppercase tracking-wide text-mute">
                  Daftar isi
                </p>
                <ol className="mt-3 space-y-2.5 text-base">
                  {sections.map((section, i) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="flex items-start gap-2.5 text-mute transition-colors hover:text-blue"
                      >
                        <span className="font-mono text-sm leading-6 text-mute/70">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="leading-6">{section.heading}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>

            {/* Isi dokumen */}
            <article className="lg:col-span-2">
              <div className="space-y-10">
                {sections.map((section, i) => (
                  <section
                    key={section.id}
                    id={section.id}
                    aria-labelledby={`${section.id}-heading`}
                    className="scroll-mt-28"
                  >
                    <h2
                      id={`${section.id}-heading`}
                      className="text-xl font-medium tracking-tight text-ink sm:text-2xl"
                    >
                      <span className="mr-2 font-mono text-mute/60">
                        {i + 1}.
                      </span>
                      {section.heading}
                    </h2>
                    <div className="mt-3 space-y-4 text-base leading-relaxed text-mute">
                      {section.body}
                    </div>
                  </section>
                ))}
              </div>

              {/* Kartu kontak di bawah dokumen */}
              <div className="mt-12 rounded-3xl border border-line bg-soft p-6 sm:p-8">
                <h2 className="text-xl font-medium tracking-tight text-ink">
                  Ada pertanyaan tentang dokumen ini?
                </h2>
                <p className="mt-2 text-base leading-relaxed text-mute">
                  Tim WebKalcer siap membantu. Hubungi kami lewat salah satu
                  kanal di bawah — kami usahakan membalas pada jam kerja.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="https://wa.me/6285805566344"
                    target="_blank"
                    rel="noreferrer"
                    className="btn inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-base font-medium text-white"
                  >
                    <i
                      className="fa-brands fa-whatsapp text-xl text-[#25D366]"
                      aria-hidden="true"
                    />
                    WhatsApp 0858-0556-6344
                  </a>
                  <a
                    href="mailto:halo@webkalcer.com"
                    className="btn inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-base font-medium text-ink hover:bg-white/60"
                  >
                    <i
                      className="fa-regular fa-envelope text-xl text-blue"
                      aria-hidden="true"
                    />
                    halo@webkalcer.com
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
