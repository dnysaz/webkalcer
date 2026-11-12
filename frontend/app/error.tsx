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
    <main className="relative min-h-screen w-full overflow-hidden bg-[#f8fafb] font-sans">
      <div className="absolute left-0 top-0 p-6 sm:p-8">
        <Link href="/" className="flex h-8 w-auto items-center text-xl font-bold tracking-tight">
          <span className="text-blue">Web</span>
          <span className="text-red">Kal</span>
          <span className="text-orange">cer</span>
        </Link>
      </div>

      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="select-none text-[8rem] leading-none tracking-[-0.08em] sm:text-[11rem]">
          <span className="text-red">5</span>
          <span className="text-orange">0</span>
          <span className="text-ink">0</span>
        </h1>
        <p className="mt-2 text-xl font-medium text-ink">Terjadi kesalahan</p>
        <p className="mt-3 max-w-md text-sm leading-6 text-mute sm:text-base">
          Server mengalami gangguan saat memuat halaman ini. Tim kami sudah diberitahu.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="inline-flex h-11 items-center justify-center rounded-full border border-transparent bg-orange px-8 text-sm font-medium text-white shadow-sm transition hover:brightness-95 active:translate-y-[1px]"
          >
            Coba Lagi
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-white px-8 text-sm font-medium text-blue transition hover:bg-[#f8f9fa]"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
