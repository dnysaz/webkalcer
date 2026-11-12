import type { Metadata } from "next";
import LegalDoc, { type LegalSection } from "@/components/landing/legal-doc";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan — WebKalcer",
  description:
    "Syarat dan ketentuan penggunaan layanan WebKalcer: pembuatan website, hosting statis gratis di webkalcer.com, pemesanan, pembayaran, dan batasan tanggung jawab.",
};

const sections: LegalSection[] = [
  {
    id: "penerimaan",
    heading: "Penerimaan Perjanjian",
    body: (
      <>
        <p>
          Selamat datang di WebKalcer. Dengan mengakses, mendaftar, memesan,
          atau menggunakan layanan WebKalcer — situs utama dan layanan kami
          berada di{" "}
          <span className="font-mono text-ink">webkalcer.com</span>, sedangkan
          hosting statis gratis tayang di subdomain{" "}
          <span className="font-mono text-ink">webkalcer.com</span> — Anda
          menyatakan telah membaca, memahami, dan menyetujui untuk terikat
          pada Syarat &amp; Ketentuan ini beserta kebijakan lain yang
          berlaku, termasuk Kebijakan Privasi kami.
        </p>
        <p>
          Perjanjian ini merupakan perjanjian yang mengikat secara hukum
          antara Anda (“Pengguna”, “Pelanggan”, atau “Anda”) dan WebKalcer
          (“kami”, “kita”). Jika Anda tidak menyetujui salah satu bagian
          dari dokumen ini, mohon untuk tidak menggunakan layanan kami.
        </p>
        <p>
          Jika Anda menggunakan layanan atas nama badan usaha atau
          organisasi, Anda menyatakan memiliki kewenangan untuk mengikat
          badan usaha atau organisasi tersebut pada Perjanjian ini, dan kata
          “Anda” dalam dokumen ini mencakup badan usaha atau organisasi yang
          bersangkutan.
        </p>
      </>
    ),
  },
  {
    id: "deskripsi-layanan",
    heading: "Deskripsi Layanan",
    body: (
      <>
        <p>
          WebKalcer menyediakan layanan pembuatan website profesional —
          antara lain landing page statis, website perusahaan, dan website
          kustom sesuai kebutuhan bisnis Anda — serta layanan hosting statis
          gratis yang memungkinkan Anda menerbitkan situs statis (HTML, CSS,
          dan JavaScript hasil build) pada subdomain{" "}
          <span className="font-mono text-ink">namaanda.webkalcer.com</span>.
        </p>
        <p>Layanan kami pada garis besar terdiri dari:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <span className="font-medium text-ink">Pembuatan website</span> —
            desain dan pengembangan landing page atau website kustom oleh tim
            WebKalcer, dari konsultasi kebutuhan, desain, revisi, hingga
            situs tayang (live).
          </li>
          <li>
            <span className="font-medium text-ink">Hosting statis gratis</span>{" "}
            — penerbitan situs statis hasil build framework apa pun (React,
            Vue, Next.js static export, Vite, dan lainnya) melalui dashboard,
            baik dengan mengunggah arsip ZIP maupun dengan menghubungkan
            repositori GitHub.
          </li>
          <li>
            <span className="font-medium text-ink">Layanan tambahan</span> —
            antara lain pendaftaran domain kustom, integrasi formulir, dan
            konsultasi teknis, yang dapat dikenakan biaya sesuai kesepakatan.
          </li>
        </ul>
        <p>
          Kami berhak mengubah, menambah, mengurangi, atau menghentikan
          sebagian atau seluruh fitur layanan sewaktu-waktu dengan
          pemberitahuan yang wajar. Perubahan yang material akan kami
          umumkan melalui situs, email, atau kanal komunikasi resmi lainnya.
        </p>
      </>
    ),
  },
  {
    id: "akun",
    heading: "Akun dan Pendaftaran",
    body: (
      <>
        <p>
          Sebagian fitur — termasuk dashboard, deployment, manajemen domain,
          dan environment variables — memerlukan akun. Pendaftaran dapat
          dilakukan melalui autentikasi pihak ketiga (GitHub atau Google).
          Anda bertanggung jawab penuh atas kerahasiaan kredensial akun Anda
          dan atas seluruh aktivitas yang terjadi melalui akun tersebut.
        </p>
        <p>Dengan mendaftar, Anda setuju bahwa:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Informasi yang Anda berikan saat pendaftaran adalah akurat,
            terkini, dan lengkap, serta Anda akan memperbaruinya apabila
            terjadi perubahan;
          </li>
          <li>
            Anda tidak akan meminjamkan, menjual, atau memindahtangankan
            akun kepada pihak lain tanpa izin tertulis dari WebKalcer;
          </li>
          <li>
            Anda akan segera memberi tahu kami apabila mengetahui adanya
            akses tidak sah ke akun Anda;
          </li>
          <li>
            Satu akun diperuntukkan bagi satu individu atau satu entitas
            usaha; penyalahgunaan akun massal dapat berujung pada
            penangguhan.
          </li>
        </ul>
        <p>
          Kami berhak menolak pendaftaran, menangguhkan, atau menghapus
          akun yang kami duga melanggar Perjanjian ini atau yang membahayakan
          layanan dan pengguna lain.
        </p>
      </>
    ),
  },
  {
    id: "pemesanan-pembayaran",
    heading: "Pemesanan, Harga, dan Pembayaran",
    body: (
      <>
        <p>
          Harga paket pembuatan website tercantum di halaman harga pada
          situs kami dan dapat berubah sewaktu-waktu. Harga yang berlaku
          adalah harga pada saat Anda melakukan pemesanan dan menerima
          penawaran resmi dari kami — bukan harga yang tercantum pada
          arsip atau tangkapan layar lama.
        </p>
        <p>Ketentuan pemesanan dan pembayaran:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Pemesanan dianggap mengikat setelah DP atau pelunasan diterima —
            kami tidak memulai pengerjaan sebelum ada kesepakatan tertulis
            (minimal melalui percakapan WhatsApp atau email resmi).
          </li>
          <li>
            Besaran DP, jadwal pelunasan, dan tenggat pengerjaan disepakati
            secara individual sesuai kompleksitas proyek dan tercantum pada
            penawaran/invoice.
          </li>
          <li>
            Pembayaran dilakukan melalui transfer bank atau metode lain yang
            kami sediakan. Bukti pembayaran disimpan sebagai rekaman transaksi.
          </li>
          <li>
            Keterlambatan pembayaran dapat mengakibatkan penghentian
            sementara pengerjaan atau penayangan situs, tanpa mengurangi
            kewajiban Anda untuk melunasi sisa tagihan.
          </li>
          <li>
            Layanan hosting statis di{" "}
            <span className="font-mono text-ink">webkalcer.com</span> gratis dan
            tidak memerlukan pembayaran; ketentuan khusus hosting gratis
            diatur pada bagian “Kebijakan Hosting Statis Gratis” di bawah.
          </li>
        </ul>
        <p>
          Apabila terjadi pembatalan oleh pelanggan setelah pengerjaan
          dimulai, DP tidak dapat dikembalikan karena telah digunakan untuk
          biaya konsultasi, riset, dan desain awal — kecuali disepakati lain
          secara tertulis.
        </p>
      </>
    ),
  },
  {
    id: "pembuatan-revisi",
    heading: "Pembuatan Website dan Revisi",
    body: (
      <>
        <p>
          Proses pembuatan website umumnya meliputi: konsultasi kebutuhan →
          penyusunan struktur &amp; konten → desain → pengembangan → revisi →
          tayang. Tenggat pengerjaan bersifat estimasi dan sangat dipengaruhi
          oleh kecepatan pelanggan dalam memberikan konten (teks, foto, logo,
          dan materi lain) serta feedback pada setiap tahap.
        </p>
        <p>Ketentuan revisi:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Jumlah ronde revisi mengikuti paket yang dipilih (misalnya 2–3
            ronde untuk paket standar). Revisi di luar jatah paket dihitung
            sebagai pekerjaan tambahan dengan biaya yang disepakati lebih
            dahulu.
          </li>
          <li>
            Revisi mencakup perubahan pada tampilan dan konten yang belum
            tayang. Perubahan total arah desain setelah disetujui dianggap
            sebagai proyek baru.
          </li>
          <li>
            Materi yang Anda serahkan (logo, foto, teks) harus merupakan hak
            Anda atau Anda memiliki izin penggunaannya. Kami tidak
            bertanggung jawab atas sengketa hak cipta atas materi yang Anda
            berikan.
          </li>
          <li>
            Setelah situs tayang dan pembayaran lunas, source code dan aset
            diserahkan sesuai kesepakatan paket; lisensi penggunaan diatur
            pada bagian Hak Kekayaan Intelektual.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "kebijakan-hosting",
    heading: "Kebijakan Hosting Statis Gratis",
    body: (
      <>
        <p>
          Hosting statis gratis di{" "}
          <span className="font-mono text-ink">webkalcer.com</span> adalah
          fasilitas yang disediakan sebagai bagian dari layanan WebKalcer,
          dan bukan merupakan garansi SLA berbayar. Dengan menggunakan
          fasilitas ini, Anda tunduk pada ketentuan berikut:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Hanya situs statis (HTML/CSS/JS tanpa server dinamis dan tanpa
            database) yang didukung. Aplikasi dengan backend sendiri tidak
            dapat dijalankan di hosting gratis.
          </li>
          <li>
            Arsip ZIP dibatasi maksimal 100 MB per deployment, dengan
            struktur <span className="font-mono text-ink">index.html</span>{" "}
            di root arsip atau di dalam tepat satu folder pembungkus.
          </li>
          <li>
            Nama subdomain harus 3–30 karakter, huruf kecil, angka, dan
            tanda hubung, serta tidak boleh memuat kata-kata yang diblokir
            sistem. Nama yang sudah dipakai tidak dapat diperebutkan.
          </li>
          <li>
            Kami berhak menghapus atau menangguhkan situs yang melanggar
            hukum, memuat konten berbahaya/phishing/malware, melakukan spam,
            atau melanggar hak pihak ketiga — tanpa pemberitahuan bila
            keadaan mengharuskan.
          </li>
          <li>
            Kami dapat memberlakukan batas penyimpanan, bandwidth, atau
            jumlah deployment yang wajar untuk menjaga stabilitas layanan
            bagi seluruh pengguna, dan dapat mengubahnya sewaktu-waktu.
          </li>
          <li>
            Rollback hanya tersedia untuk 3 rilis sukses terakhir. Situs
            hasil unggahan ZIP tidak dapat di-redeploy; pembaruan dilakukan
            dengan membuat project baru.
          </li>
        </ul>
        <p>
          Layanan hosting gratis disediakan “sebagaimana adanya” tanpa jaminan
          ketersediaan 100%. Untuk kebutuhan bisnis-kritis, kami sarankan
          berkonsultasi mengenai paket berbayar atau solusi VPS/cloud.
        </p>
      </>
    ),
  },
  {
    id: "kekayaan-intelektual",
    heading: "Hak Kekayaan Intelektual",
    body: (
      <>
        <p>
          WebKalcer, logo WebKalcer, tampilan situs ini, dan dokumentasi kami
          adalah kekayaan intelektual WebKalcer dan dilindungi hukum hak
          cipta dan merek. Anda tidak diperkenankan menyalin, memodifikasi,
          atau mendistribusikan aset tersebut tanpa izin tertulis.
        </p>
        <p>Untuk hasil pengerjaan website pesanan Anda:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Setelah pelunasan penuh, hak penggunaan akhir atas desain dan
            source code untuk situs yang dipesan beralih kepada Anda.
          </li>
          <li>
            WebKalcer berhak menampilkan situs yang telah dibuat sebagai
            portofolio publik, kecuali Anda meminta pengecualian secara
            tertulis sebelum pengerjaan dimulai.
          </li>
          <li>
            Komponen, template, dan toolkit yang kami kembangkan secara
            umum (bukan spesifik untuk proyek Anda) tetap menjadi milik kami;
            Anda menerima lisensi pakai yang bersifat non-eksklusif dan
            tidak dapat dialihkan.
          </li>
          <li>
            Atribusi “Dibuat oleh WebKalcer” pada footer bersifat opsional;
            penghapusannya memerlukan persetujuan sesuai paket yang dipilih.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "konten-pengguna",
    heading: "Konten Unggahan Pengguna",
    body: (
      <>
        <p>
          Anda bertanggung jawab penuh atas seluruh konten yang Anda unggah
          atau tayangkan melalui layanan kami — termasuk melalui deployment
          ZIP, repositori GitHub yang terhubung, environment variables, dan
          materi yang diserahkan untuk pembuatan website.
        </p>
        <p>Dengan mengunggah konten, Anda menyatakan bahwa:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Anda memiliki hak, lisensi, dan izin atas konten tersebut;</li>
          <li>
            Konten tidak melanggar hukum yang berlaku di Republik Indonesia
            maupun hak pihak ketiga (privasi, merek, hak cipta, dan lainnya);
          </li>
          <li>
            Konten tidak mengandung kode berbahaya, skrip penambangan
            kripto tersembunyi, atau fungsionalitas yang merugikan pengunjung;
          </li>
          <li>
            Data pribadi yang Anda proses melalui situs Anda tunduk pada
            kewajiban Anda sendiri selaku pengendali data, termasuk
            kepatuhan pada UU Pelindungan Data Pribadi (UU No. 27 Tahun 2022).
          </li>
        </ul>
        <p>
          Kami tidak meninjau isi konten secara proaktif, namun kami dapat
          menghapus konten yang melanggar setelah menerima laporan atau
          menemukan pelanggaran, dan dapat melaporkannya kepada pihak berwenang.
        </p>
      </>
    ),
  },
  {
    id: "larangan",
    heading: "Perilaku yang Dilarang",
    body: (
      <>
        <p>Anda dilarang menggunakan layanan WebKalcer untuk:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Menayangkan konten ilegal: penipuan, phishing, perjudian ilegal,
            pornografi, ujaran kebencian, atau konten yang mengancam keamanan
            nasional;
          </li>
          <li>
            Menyebarkan malware, melakukan pemindaian kerentanan tanpa izin,
            atau menyerang infrastruktur kami maupun pengguna lain;
          </li>
          <li>
            Menyalahgunakan subdomain untuk menyamar sebagai pihak lain
            (impersonation) atau mengaburkan asal-usul situs;
          </li>
          <li>
            Mengakali batasan teknis layanan (rate limit, kuota, filter kata)
            dengan cara otomatis maupun manual;
          </li>
          <li>
            Menambang kripto, menjalankan proxy terbuka, atau menyalahgunakan
            bandwidth untuk aktivitas di luar situs statis biasa;
          </li>
          <li>
            Mengumpulkan data pribadi pengunjung tanpa dasar yang sah
            atau tanpa pemberitahuan yang memadai.
          </li>
        </ul>
        <p>
          Pelanggaran atas bagian ini memberi kami hak — dan kami akan —
          menangguhkan atau menghapus akun dan situs terkait, serta dapat
          melaporkannya kepada penegak hukum bila diperlukan.
        </p>
      </>
    ),
  },
  {
    id: "tanggung-jawab",
    heading: "Batas Tanggung Jawab",
    body: (
      <>
        <p>
          Layanan WebKalcer disediakan “sebagaimana adanya” (as is) dan
          “sebagaimana tersedia” (as available). Sejauh diizinkan oleh hukum,
          kami menafikan seluruh jaminan tersurat maupun tersirat, termasuk
          jaminan daya jual dan kesesuaian untuk tujuan tertentu.
        </p>
        <p>WebKalcer tidak bertanggung jawab atas:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Kerugian tidak langsung, kehilangan keuntungan, kehilangan data,
            atau rusaknya reputasi yang timbul dari penggunaan layanan;
          </li>
          <li>
            Downtime, kegagalan build, atau kehilangan deployment akibat
            konten Anda, kesalahan konfigurasi Anda, atau gangguan pihak
            ketiga (termasuk GitHub, Cloudflare, dan penyedia autentikasi);
          </li>
          <li>
            Kebocoran environment variables yang disebabkan oleh tindakan
            Anda sendiri (misalnya membagikan token akses kepada pihak lain);
          </li>
          <li>
            Tindakan pengunjung situs Anda atau sengketa antara Anda dan
            pihak ketiga terkait konten situs tersebut.
          </li>
        </ul>
        <p>
          Total tanggung jawab kami atas seluruh klaim terkait layanan tidak
          akan melebihi jumlah yang Anda bayarkan kepada kami dalam 12
          (dua belas) bulan terakhir — atau Rp0 untuk layanan hosting gratis.
        </p>
      </>
    ),
  },
  {
    id: "penghentian",
    heading: "Penangguhan dan Penghentian Layanan",
    body: (
      <>
        <p>
          Anda dapat berhenti menggunakan layanan kapan pun — akun dapat
          dihapus melalui menu Pengaturan di dashboard atau dengan
          menghubungi kami. Penghapusan akun tidak menghapus kewajiban
          pembayaran yang telah timbul.
        </p>
        <p>Kami dapat menangguhkan atau menghentikan layanan Anda bila:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Anda melanggar Perjanjian ini atau hukum yang berlaku;</li>
          <li>
            Anda menunggak pembayaran melebihi tenggat yang disepakati dan
            tidak merespons somasi;
          </li>
          <li>
            Kami diwajibkan oleh perintah pengadilan atau peraturan
            perundang-undangan;
          </li>
          <li>
            Kelangsungan layanan dianggap membahayakan keamanan atau
            ketersediaan sistem bagi pengguna lain.
          </li>
        </ul>
        <p>
          Penghentian tidak menghapus hak dan kewajiban yang menurut sifatnya
          tetap berlaku, seperti pembayaran, kerahasiaan, dan kepemilikan
          kekayaan intelektual.
        </p>
      </>
    ),
  },
  {
    id: "perubahan-syarat",
    heading: "Perubahan atas Syarat & Ketentuan",
    body: (
      <>
        <p>
          Kami dapat mengubah dokumen ini sewaktu-waktu agar selalu relevan
          dengan layanan yang berkembang. Perubahan material akan kami
          umumkan minimal 14 (empat belas) hari sebelum berlaku efektif,
          melalui situs, email terdaftar, atau notifikasi di dashboard.
        </p>
        <p>
          Penggunaan layanan setelah tanggal berlaku efektif merupakan
          persetujuan Anda atas versi terbaru. Jika Anda tidak setuju, Anda
          wajib berhenti menggunakan layanan dan, bila perlu, menghapus akun
          Anda sebelum tanggal tersebut.
        </p>
        <p>
          Versi yang berlaku adalah versi yang tercantum pada halaman ini
          dengan tanggal “Terakhir diperbarui” terbaru. Tanggal tersebut
          merupakan bagian integral dari Perjanjian ini.
        </p>
      </>
    ),
  },
  {
    id: "hukum-yang-berlaku",
    heading: "Hukum yang Berlaku dan Penyelesaian Sengketa",
    body: (
      <>
        <p>
          Perjanjian ini tunduk pada dan ditafsirkan menurut hukum Republik
          Indonesia, termasuk — namun tidak terbatas pada — Kitab Undang-Undang
          Hukum Perdata, Undang-Undang Informasi dan Transaksi Elektronik,
          Undang-Undang Perlindungan Konsumen, dan Undang-Undang Pelindungan
          Data Pribadi.
        </p>
        <p>
          Apabila terjadi perselisihan, para pihak sepakat untuk menyelesaikannya
          terlebih dahulu melalui musyawarah mufakat dalam waktu 30 (tiga puluh)
          hari kalender sejak pemberitahuan tertulis dari salah satu pihak.
        </p>
        <p>
          Apabila musyawarah tidak mencapai mufakat, perselisihan diselesaikan
          melalui Pengadilan Negeri yang berwenang sesuai domisili hukum
          WebKalcer, dengan mengesampingkan ketentuan mengenai yurisdiksi lain
          sepanjang tidak bertentangan dengan hukum yang berlaku.
        </p>
      </>
    ),
  },
  {
    id: "kontak",
    heading: "Kontak",
    body: (
      <>
        <p>
          Pertanyaan, somasi, atau pemberitahuan resmi terkait Perjanjian ini
          dapat dikirimkan kepada kami melalui:
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
          <li>Alamat korespondensi: Jakarta, Indonesia (detail menyusul)</li>
        </ul>
        <p>
          Kami berusaha merespons seluruh korespondensi pada jam kerja,
          Senin–Sabtu 09.00–17.00 WIB. Pemberitahuan yang memerlukan respons
          resmi akan kami tandai secara eksplisit.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDoc
      title="Syarat & Ketentuan"
      updated="11 November 2026"
      intro="Syarat dan ketentuan ini mengatur penggunaan layanan WebKalcer — pembuatan website, hosting statis gratis di webkalcer.com, dan layanan terkait. Dengan menggunakan layanan kami, Anda menyetujui Perjanjian ini secara keseluruhan."
      sections={sections}
    />
  );
}
