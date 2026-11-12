"use client";

import { useEffect } from "react";
import Link from "next/link";
import LandingNavbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <LandingNavbar />

      <main className="relative flex flex-1 flex-col overflow-hidden font-sans">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-16 text-center font-sans sm:py-20">
          <h1
            aria-hidden="true"
            className="select-none text-[8rem] font-medium leading-none tracking-[-0.08em] text-red sm:text-[11rem]"
          >
            500
          </h1>
          <p className="mt-2 text-2xl font-medium text-ink sm:text-3xl">Terjadi kesalahan</p>
          <p className="mt-3 max-w-md text-lg leading-7 text-mute sm:text-xl sm:leading-8">
            Server mengalami gangguan saat memuat halaman ini.
            <br />
            Tim kami sudah diberitahu.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:mt-12 sm:flex-row">
            <button
              onClick={reset}
              className="inline-flex h-12 items-center justify-center rounded-full border border-transparent bg-red px-8 text-base font-medium text-white shadow-sm transition hover:brightness-95 active:translate-y-[1px]"
            >
              Coba Lagi
            </button>
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-full border border-line bg-white px-8 text-base font-medium text-blue transition hover:bg-[#f8f9fa]"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
