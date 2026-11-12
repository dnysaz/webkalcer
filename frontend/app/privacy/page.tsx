import type { Metadata } from "next";
import { pageSocial } from "@/lib/seo";
import LegalDoc, { type LegalSection } from "@/components/landing/legal-doc";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — WebKalcer",
  description:
    "Bagaimana WebKalcer mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda — termasuk data akun, deployment, environment variables, dan cookie.",
  ...pageSocial("Kebijakan Privasi — WebKalcer", "Bagaimana WebKalcer mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda — termasuk data akun, deployment, environment variables, dan cookie.", "/privacy"),
};

const sections: LegalSection[] = [
  {
    id: "pendahuluan",
    heading: "Pendahuluan",
    body: (
      <>
        <p>
          Kebijakan Privasi ini menjelaskan bagaimana WebKalcer (“kami”)
          mengumpulkan, menggunakan, menyimpan, membagikan, dan melindungi
          informasi pribadi Anda ketika Anda mengakses situs, dashboard,
          atau layanan kami lainnya.
        </p>
        <p>
          Kami menyusun kebijakan ini dengan mengacu pada praktik terbaik
          industri dan peraturan perundang-undangan Republik Indonesia,
          khususnya Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data
          Pribadi (“UU PDP”) serta Undang-Undang No. 11 Tahun 2008 tentang
          Informasi dan Transaksi Elektronik sebagaimana telah diubah.
        </p>
        <p>
          Dokumen ini merupakan bagian tak terpisahkan dari Syarat &amp;
          Ketentuan WebKalcer. Dengan menggunakan layanan kami, Anda
          menyetujui pengumpulan dan penggunaan informasi sebagaimana
          dijelaskan di sini.
        </p>
      </>
    ),
  },
  {
    id: "informasi-dikumpulkan",
    heading: "Informasi yang Kami Kumpulkan",
    body: (
      <>
        <p>Kami mengumpulkan beberapa kategori informasi berikut:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <span className="font-medium text-ink">Data akun</span> — nama,
            alamat email, username, dan foto profil yang Anda berikan melalui
            autentikasi pihak ketiga (GitHub atau Google). Kami tidak pernah
            menerima atau menyimpan kata sandi Anda.
          </li>
          <li>
            <span className="font-medium text-ink">Data teknis</span> —
            alamat IP, jenis peramban, sistem operasi, halaman yang diakses,
            dan waktu akses, yang tercatat dalam log server untuk keamanan
            dan diagnosis.
          </li>
          <li>
            <span className="font-medium text-ink">Data project</span> —
            nama project, nama subdomain, konfigurasi deployment, riwayat
            build, dan statistik kunjungan agregat situs Anda.
          </li>
          <li>
            <span className="font-medium text-ink">Environment variables</span>{" "}
            — nama dan nilai variabel yang Anda masukkan untuk keperluan
            build. Nilai disimpan terenkripsi di server kami dan tidak pernah
            dikirim ke peramban; dashboard hanya menampilkan nama key.
          </li>
          <li>
            <span className="font-medium text-ink">Data komunikasi</span> —
            isi percakapan WhatsApp, email, atau formulir yang Anda kirimkan
            kepada kami, beserta metadata nomor kontak Anda.
          </li>
        </ul>
        <p>
          Kami tidak secara sadar mengumpulkan data sensitif seperti
          informasi kesehatan, biometrik, atau data anak di bawah usia 13
          tahun.
        </p>
      </>
    ),
  },
  {
    id: "penggunaan-informasi",
    heading: "Cara Kami Menggunakan Informasi",
    body: (
      <>
        <p>Informasi yang kami kumpulkan digunakan untuk:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Menyediakan, mengoperasikan, dan memelihara layanan — termasuk
            autentikasi, deployment, rollback, dan manajemen domain;
          </li>
          <li>
            Memproses pemesanan, invoice, dan komunikasi seputar pembuatan
            website;
          </li>
          <li>
            Mengirimkan notifikasi penting terkait layanan (misalnya
            keberhasilan/kegagalan build) melalui email atau kanal lain;
          </li>
          <li>
            Menegakkan keamanan: mendeteksi penyalahgunaan, serangan, dan
            pelanggaran ketentuan layanan;
          </li>
          <li>
            Memahami pola penggunaan agregat (misalnya jumlah kunjungan
            situs Anda) untuk pengembangan produk;
          </li>
          <li>
            Memenuhi kewajiban hukum, seperti permintaan resmi dari
            penegak hukum yang sah.
          </li>
        </ul>
        <p>
          Kami tidak menjual data pribadi Anda, dan tidak menggunakan data
          Anda untuk iklan pihak ketiga.
        </p>
      </>
    ),
  },
  {
    id: "cookie",
    heading: "Cookie dan Teknologi Serupa",
    body: (
      <>
        <p>
          Kami menggunakan cookie dan penyimpanan lokal secara terbatas.
          Kategori yang kami pakai:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <span className="font-medium text-ink">Cookie esensial</span> —
            sesi login dan preferensi keamanan. Tanpa ini, dashboard tidak
            dapat berfungsi; Anda tidak dapat menonaktifkannya tanpa
            kehilangan akses.
          </li>
          <li>
            <span className="font-medium text-ink">Penyimpanan lokal</span> —
            status antarmuka (misalnya tab terakhir yang dibuka) agar
            pengalaman Anda konsisten antar-kunjungan.
          </li>
        </ul>
        <p>
          Kami tidak menggunakan cookie pelacakan iklan. Peramban Anda dapat
          dikonfigurasi untuk menolak cookie, namun sebagian fitur login
          mungkin tidak tersedia.
        </p>
      </>
    ),
  },
  {
    id: "pihak-ketiga",
    heading: "Berbagi dengan Pihak Ketiga",
    body: (
      <>
        <p>
          Kami hanya membagikan informasi kepada pihak ketiga sebatas yang
          diperlukan untuk memberikan layanan:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <span className="font-medium text-ink">Penyedia autentikasi</span>{" "}
            — GitHub dan Google memproses login Anda; kami hanya menerima
            profil yang Anda setujui untuk dibagikan.
          </li>
          <li>
            <span className="font-medium text-ink">GitHub</span> — untuk
            membaca daftar repositori dan menerima webhook push apabila Anda
            menghubungkan repository untuk deployment otomatis.
          </li>
          <li>
            <span className="font-medium text-ink">Cloudflare</span> — DNS,
            SSL, dan proteksi situs yang di-hosting di{" "}
            <span className="font-mono text-ink">webkalcer.com</span> serta
            custom domain Anda.
          </li>
          <li>
            <span className="font-medium text-ink">Penyedia infrastruktur</span>{" "}
            — server dan penyimpanan yang kami gunakan untuk menjalankan
            layanan, terikat perjanjian kerahasiaan dan pemrosesan data.
          </li>
          <li>
            <span className="font-medium text-ink">Penegak hukum</span> —
            apabila diwajibkan oleh perintah pengadilan atau peraturan
            perundang-undangan yang berlaku.
          </li>
        </ul>
        <p>
          Kami tidak menjual, menyewakan, atau memperdagangkan data pribadi
          Anda kepada pihak mana pun untuk kepentingan pemasaran mereka.
        </p>
      </>
    ),
  },
  {
    id: "penyimpanan-keamanan",
    heading: "Penyimpanan dan Keamanan Data",
    body: (
      <>
        <p>
          Data disimpan di server yang kami kendalikan dengan langkah
          perlindungan yang wajar: enkripsi in-transit (HTTPS/TLS),
          pembatasan akses berbasis peran, dan pemisahan data antar-project.
        </p>
        <p>
          Environment variables dienkripsi at-rest dan hanya dapat diakses
          oleh proses build yang berwenang; nilai tidak pernah tampil di
          dashboard, log, atau halaman project.
        </p>
        <p>
          Log teknis disimpan maksimal 12 bulan, kecuali diwajibkan lebih
          lama oleh hukum. Data akun dihapus dalam 30 hari setelah permintaan
          penghapusan disetujui, kecuali data yang wajib disimpan untuk
          kepatuhan hukum atau penyelesaian sengketa.
        </p>
        <p>
          Tidak ada sistem yang 100% aman. Apabila terjadi pelanggaran data
          yang berdampak pada Anda, kami akan memberitahukan Anda dan
          otoritas terkait sesuai tenggat yang diwajibkan UU PDP, beserta
          langkah mitigasi yang kami ambil.
        </p>
      </>
    ),
  },
  {
    id: "env-deployment",
    heading: "Environment Variables dan Data Deployment",
    body: (
      <>
        <p>
          Fitur environment variables tersedia untuk deployment GitHub maupun
          ZIP. Ketentuan khusus:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Nilai env hanya disimpan di server WebKalcer dan tidak pernah
            dikirim ke peramban. Yang tampil di dashboard hanya nama key
            (misalnya <span className="font-mono text-ink">API_KEY</span>).
          </li>
          <li>
            Pada deployment GitHub, nilai env disuntikkan pada saat proses
            build di server kami; pada upload ZIP, nilai env disimpan setelah
            upload dan berlaku untuk rilis berikutnya.
          </li>
          <li>
            Env terisolasi per project. Project lain — milik Anda maupun
            milik pengguna lain — tidak dapat membaca env Anda.
          </li>
          <li>
            Mengosongkan value sebuah key menghapus key tersebut dari
            penyimpanan kami.
          </li>
          <li>
            Anda bertanggung jawab atas kerahasiaan kode Anda sendiri: jangan
            menaruh kredensial di repositori publik atau di dalam arsip ZIP
            yang diunggah.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "hak-anda",
    heading: "Hak Anda atas Data Pribadi",
    body: (
      <>
        <p>
          Berdasarkan UU PDP, Anda memiliki hak-hak berikut atas data pribadi
          Anda yang kami proses:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <span className="font-medium text-ink">Hak akses</span> — meminta
            salinan data pribadi yang kami simpan tentang Anda;
          </li>
          <li>
            <span className="font-medium text-ink">Hak perbaikan</span> —
            memperbarui atau mengoreksi data yang tidak akurat;
          </li>
          <li>
            <span className="font-medium text-ink">Hak penghapusan</span> —
            meminta penghapusan akun dan data terkait;
          </li>
          <li>
            <span className="font-medium text-ink">Hak pembatasan</span> —
            menolak atau membatasi pemrosesan tertentu;
          </li>
          <li>
            <span className="font-medium text-ink">Hak portabilitas</span> —
            meminta data Anda dalam format yang dapat dibaca mesin;
          </li>
          <li>
            <span className="font-medium text-ink">Hak keberatan</span> —
            menolak pemrosesan untuk tujuan pemasaran langsung.
          </li>
        </ul>
        <p>
          Untuk menggunakan hak-hak tersebut, hubungi kami di{" "}
          <a href="mailto:halo@webkalcer.com" className="text-blue hover:underline">
            halo@webkalcer.com
          </a>
          . Kami akan merespons dalam waktu paling lambat 30 hari,
          sebagaimana diwajibkan hukum. Kami dapat meminta verifikasi
          identitas sebelum memproses permintaan.
        </p>
      </>
    ),
  },
  {
    id: "anak",
    heading: "Privasi Anak di Bawah Umur",
    body: (
      <>
        <p>
          Layanan WebKalcer tidak ditujukan bagi anak di bawah usia 13 tahun
          dan kami tidak secara sadar mengumpulkan data pribadi dari mereka.
        </p>
        <p>
          Apabila Anda orang tua atau wali dan mengetahui bahwa anak Anda
          telah memberikan data pribadi kepada kami, hubungi kami — kami
          akan menghapus data tersebut dari sistem kami dalam waktu wajar.
        </p>
      </>
    ),
  },
  {
    id: "perubahan-kebijakan",
    heading: "Perubahan atas Kebijakan Ini",
    body: (
      <>
        <p>
          Kebijakan ini dapat diperbarui sewaktu-waktu untuk mencerminkan
          perkembangan layanan atau perubahan regulasi. Perubahan material
          akan kami umumkan minimal 14 hari sebelum berlaku, melalui situs,
          email terdaftar, atau notifikasi dashboard.
        </p>
        <p>
          Penggunaan layanan setelah tanggal efektif merupakan persetujuan
          Anda atas kebijakan terbaru. Tanggal “Terakhir diperbarui” di
          bagian atas dokumen ini menunjukkan versi yang berlaku.
        </p>
      </>
    ),
  },
  {
    id: "hukum",
    heading: "Hukum yang Berlaku",
    body: (
      <>
        <p>
          Kebijakan ini tunduk pada hukum Republik Indonesia. Sengketa yang
          timbul diselesaikan sesuai ketentuan pada bagian Penyelesaian
          Sengketa dalam Syarat &amp; Ketentuan WebKalcer.
        </p>
        <p>
          Apabila terdapat ketidaksesuaian antara dokumen ini dengan Syarat
          &amp; Ketentuan, maka untuk hal-hal yang berkaitan dengan data
          pribadi dokumen ini yang berlaku.
        </p>
      </>
    ),
  },
  {
    id: "kontak-privasi",
    heading: "Hubungi Kami",
    body: (
      <>
        <p>
          Pertanyaan atau keberatan terkait Kebijakan Privasi ini dapat
          disampaikan melalui:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Email:{" "}
            <a
              href="mailto:halo@webkalcer.com"
              className="text-blue hover:underline"
            >
              halo@webkalcer.com
            </a>
          </li>
          <li>
            WhatsApp:{" "}
            <a
              href="https://wa.me/6285805566344"
              className="text-blue hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              0858-0556-6344
            </a>
          </li>
        </ul>
        <p>
          Kami memandang serius setiap laporan pelanggaran privasi. Laporan
          keamanan (misalnya temuan celah pada layanan kami) dapat dikirim
          ke email yang sama dengan subjek “Security Report”.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Kebijakan Privasi"
      updated="11 November 2026"
      intro="Kebijakan ini menjelaskan informasi apa yang kami kumpulkan, mengapa, dan bagaimana kami melindunginya — dari data akun hingga environment variables dan cookie."
      sections={sections}
    />
  );
}
