import Link from "next/link";

export const metadata = {
  title: "404 — Halaman tidak ditemukan — WebKalcer",
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-soft flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-10 text-center shadow-sm">
        <div
          aria-hidden="true"
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-soft"
        >
          <svg viewBox="0 0 24 24" className="h-10 w-10 text-mute" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <line x1="5" y1="1" x2="19" y2="1" />
            <line x1="5" y1="23" x2="19" y2="23" />
            <line x1="9" y1="9" x2="15" y2="15" />
            <line x1="15" y1="9" x2="9" y2="15" />
          </svg>
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue">Error 404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm leading-6 text-mute">
          Maaf, halaman yang Anda cari tidak ada atau sudah dipindahkan. Periksa kembali URL-nya.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Kembali ke Beranda
          </Link>
          <Link href="/kontak" className="text-sm font-semibold text-blue hover:underline">
            Hubungi Kami
          </Link>
        </div>
      </div>
    </main>
  );
}
