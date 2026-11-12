/* Data paket bersama — diimpor oleh client component (form) & server page.
   Jangan diberi directive "use client" agar nilainya bisa dibaca di server. */

export type PaketKey = "landing-page" | "website-custom";

export interface PaketData {
  name: string;
  harga: string;
  hargaSub: string;
  eyebrow: string;
  headline: string;
  description: string;
  pesanLabel: string;
  placeholder: string;
  fitur: string[];
  accent: "blue" | "red";
}

export const PAKET: Record<PaketKey, PaketData> = {
  "landing-page": {
    name: "Landing Page Statis",
    harga: "hanya Rp450.000",
    hargaSub: "Sekali bayar, termasuk hosting statis gratis",
    eyebrow: "Checkout paket",
    headline: "Pesan Landing Page Statis",
    description:
      "Isi formulir di bawah ini. Tim WebKalcer akan menghubungi Anda untuk konfirmasi dan mulai pengerjaan.",
    pesanLabel: "Ceritakan kebutuhan Anda",
    placeholder:
      "Mis. saya butuh landing page untuk bisnis kopi saya — 3 halaman (beranda, menu, kontak), warna hangat, tombol WhatsApp...",
    fitur: [
      "Desain modern & responsif",
      "Hingga 5 halaman",
      "Tombol WhatsApp & form kontak",
      "Hosting gratis di WebKalcer",
      "Gratis domain .my.id atau .web.id",
    ],
    accent: "blue",
  },
  "website-custom": {
    name: "Website Custom",
    harga: "mulai Rp999.999",
    hargaSub: "Disesuaikan dengan ruang lingkup proyek",
    eyebrow: "Konsultasi proyek",
    headline: "Diskusikan Proyek Anda",
    description:
      "Ceritakan kebutuhan website bisnis Anda — fitur, jumlah halaman, dan desain. Kami akan kirim penawaran.",
    pesanLabel: "Detail proyek Anda",
    placeholder:
      "Mis. saya butuh website perusahaan dengan profil, layanan, blog, dan form multi-step. Target rilis bulan depan...",
    fitur: [
      "Halaman & fitur fleksibel",
      "Konsultasi & perencanaan struktur",
      "Desain khusus identitas brand",
      "Cloud hosting premium",
      "Gratis domain .com",
      "Support sampai rilis",
    ],
    accent: "red",
  },
};
