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
    <main className="min-h-screen bg-soft flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-10 text-center shadow-sm">
        <div
          aria-hidden="true"
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-soft"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-10 w-10 text-red"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-red">Error 500</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Terjadi kesalahan</h1>
        <p className="mt-3 text-sm leading-6 text-mute">
          Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi, atau kembali ke beranda.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center rounded-lg bg-orange px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Coba Lagi
          </button>
          <Link href="/" className="text-sm font-semibold text-blue hover:underline">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
