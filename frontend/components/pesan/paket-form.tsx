"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, sendOrder } from "@/lib/api";
import { PAKET, type PaketKey } from "./paket-data";

export type { PaketKey };

export default function PaketForm({ paket }: { paket: PaketKey }) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nama, setNama] = useState("");
  const [kontak, setKontak] = useState("");
  const [bisnis, setBisnis] = useState("");
  const [pesan, setPesan] = useState("");

  const current = PAKET[paket];
  const accentBg =
    current.accent === "blue" ? "bg-blue" : "bg-red";

  const switchPaket = (key: PaketKey) => {
    setSubmitted(false);
    setError(null);
    router.replace(`/pesan-dan-diskusi?paket=${key}`, { scroll: false });
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);
    try {
      await sendOrder({
        nama: nama.trim(),
        kontak: kontak.trim(),
        bisnis: bisnis.trim(),
        pesan: pesan.trim(),
        paket,
      });
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 429
            ? "Terlalu banyak percobaan. Tunggu satu menit lalu coba lagi."
            : err.message,
        );
      } else {
        setError(
          "Tidak dapat menghubungi server. Periksa koneksi Anda lalu coba lagi.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-3xl border border-line bg-white p-8 text-center sm:p-12">
        <span
          className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${accentBg} font-bold text-3xl text-white`}
        >
          ✓
        </span>
        <h2 className="mt-6 text-3xl font-medium tracking-tight">
          Pesanan diterima!
        </h2>
        <p className="mx-auto mt-3 max-w-md text-lg text-mute">
          Terima kasih, <b className="text-ink">{nama}</b>. Tim WebKalcer akan
          menghubungi Anda lewat <b className="text-ink">{kontak}</b> dalam
          1×24 jam untuk melanjutkan pemesanan paket{" "}
          <b className="text-ink">{current.name}</b>.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="btn mt-8 rounded-full border border-line px-7 py-3 text-lg font-medium text-ink hover:bg-soft"
        >
          Kembali ke beranda
        </button>
      </div>
    );
  }

  return (
    <form
      className="rounded-3xl border border-line bg-white p-8 sm:p-10"
      onSubmit={submit}
      aria-busy={submitting}
    >
      {/* Pilih paket */}
      <div
        role="tablist"
        aria-label="Pilih paket"
        className="grid grid-cols-2 gap-1.5 rounded-3xl bg-soft p-1.5 sm:gap-2 sm:rounded-full"
      >
        {(Object.keys(PAKET) as PaketKey[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={paket === key}
            onClick={() => switchPaket(key)}
            className={`rounded-2xl px-3 py-3 text-center text-sm leading-snug font-medium text-balance transition-colors sm:rounded-full sm:px-4 sm:py-2.5 sm:text-base ${
              paket === key
                ? "bg-white text-ink shadow"
                : "text-mute hover:text-ink"
            }`}
          >
            {PAKET[key].name}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm font-medium tracking-wide text-mute uppercase">
        {current.eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
        {current.headline}
      </h1>
      <p className="mt-2 text-lg text-mute">{current.description}</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <label className="block text-base font-medium text-ink">
          Nama lengkap *
          <input
            type="text"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            disabled={submitting}
            placeholder="Budi Santoso"
            className="mt-2 w-full rounded-2xl border border-line px-4 py-3 text-lg outline-none placeholder:text-mute focus:border-blue disabled:bg-soft"
          />
        </label>
        <label className="block text-base font-medium text-ink">
          WhatsApp / Email *
          <input
            type="text"
            required
            value={kontak}
            onChange={(e) => setKontak(e.target.value)}
            disabled={submitting}
            placeholder="0812-xxxx-xxxx"
            className="mt-2 w-full rounded-2xl border border-line px-4 py-3 text-lg outline-none placeholder:text-mute focus:border-blue disabled:bg-soft"
          />
        </label>
      </div>

      <label className="mt-5 block text-base font-medium text-ink">
        Nama bisnis <span className="font-normal text-mute">(opsional)</span>
        <input
          type="text"
          value={bisnis}
          onChange={(e) => setBisnis(e.target.value)}
          disabled={submitting}
          placeholder="Toko Kopi Pak Budi"
          className="mt-2 w-full rounded-2xl border border-line px-4 py-3 text-lg outline-none placeholder:text-mute focus:border-blue disabled:bg-soft"
        />
      </label>

      <label className="mt-5 block text-base font-medium text-ink">
        {current.pesanLabel} *
        <textarea
          required
          value={pesan}
          onChange={(e) => setPesan(e.target.value)}
          disabled={submitting}
          rows={5}
          placeholder={current.placeholder}
          className="mt-2 w-full rounded-2xl border border-line px-4 py-3 text-lg outline-none placeholder:text-mute focus:border-blue disabled:bg-soft"
        />
      </label>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-red/30 bg-red/5 p-4 text-base text-red"
        >
          <i
            className="fa-solid fa-circle-exclamation mt-0.5"
            aria-hidden="true"
          />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={`btn mt-6 w-full rounded-full ${accentBg} py-4 text-lg font-medium text-white disabled:cursor-not-allowed disabled:opacity-70`}
      >
        {submitting ? "Mengirim pesanan…" : "Mulai Pesanan"}
      </button>
      <p className="mt-3 text-center text-sm text-mute">
        Tanpa komitmen — tim kami akan menghubungi Anda dulu untuk konfirmasi.
      </p>
    </form>
  );
}
