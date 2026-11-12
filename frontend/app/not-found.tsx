import Link from "next/link";
import LandingNavbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";

export const metadata = {
  title: "404 — Halaman tidak ditemukan — WebKalcer",
};

export default function NotFound() {
  return (
    <>
      <LandingNavbar />

      <main className="relative flex flex-1 flex-col overflow-hidden font-sans">
        {/* Decorative dots (top-right corner) */}
        <div className="pointer-events-none absolute right-4 top-4 opacity-60 sm:right-12 sm:top-12" aria-hidden="true">
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none" className="hidden sm:block">
            <circle cx="155" cy="18" r="8" fill="#1A73E8" />
            <circle cx="125" cy="35" r="5.5" fill="#D93025" />
            <circle cx="92" cy="12" r="4.5" fill="#F9AB00" />
            <circle cx="160" cy="52" r="4" fill="#34A853" />
          </svg>
        </div>

        {/* Content — same font stack as homepage (Roboto) */}
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-16 text-center font-sans sm:py-20">
          <div className="relative z-10 select-none">
            <h1
              aria-hidden="true"
              className="text-[9rem] font-medium leading-none tracking-[-0.08em] text-red sm:text-[12rem] md:text-[14rem]"
            >
              404
            </h1>
            <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full" aria-hidden="true">
              <defs>
                <radialGradient id="soft-glow" cx="50%" cy="50%" r="70%">
                  <stop offset="0%" stopColor="#D93025" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#D93025" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="50%" cy="60%" rx="60%" ry="40%" fill="url(#soft-glow)" />
            </svg>
          </div>

          <div className="mt-2 flex flex-col items-center sm:mt-4">
            <p className="text-2xl font-medium text-ink sm:text-3xl">Halaman tidak ditemukan</p>
            <p className="mt-3 max-w-md text-lg leading-7 text-mute sm:text-xl sm:leading-8">
              URL tidak ada atau mungkin sudah dipindahkan.
              <br />
              Periksa kembali alamatnya.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 sm:mt-12 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-full border border-transparent bg-blue px-8 text-base font-medium text-white shadow-sm transition hover:bg-[#1557b0] active:translate-y-[1px]"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/kontak"
              className="inline-flex h-12 items-center justify-center rounded-full border border-line bg-white px-8 text-base font-medium text-blue transition hover:bg-[#f8f9fa]"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
