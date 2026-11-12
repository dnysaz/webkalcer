"use client";

import { useEffect } from "react";
import Link from "next/link";

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
    <main className="relative min-h-screen w-full overflow-hidden font-sans">
      <div className="absolute left-0 top-0 p-6 sm:p-8">
        <Link href="/" className="flex h-8 w-auto items-center text-xl font-bold tracking-tight">
          <span className="text-blue">Web</span>
          <span className="text-red">Kal</span>
          <span className="text-orange">cer</span>
        </Link>
      </div>

      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-20 text-center font-sans">
        <h1 className="select-none text-[8rem] font-medium leading-none tracking-[-0.08em] text-red sm:text-[11rem]">500</h1>
        <p className="mt-2 text-2xl font-medium text-ink sm:text-3xl">Terjadi kesalahan</p>
        <p className="mt-3 max-w-md text-lg leading-7 text-mute sm:text-xl sm:leading-8">
          Server mengalami gangguan saat memuat halaman ini.
          <br />
          Tim kami sudah diberitahu.
        </p>

        <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="inline-flex h-12 items-center justify-center rounded-full border border-transparent bg-orange px-8 text-base font-medium text-white shadow-sm transition hover:brightness-95 active:translate-y-[1px]"
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
  );
}
