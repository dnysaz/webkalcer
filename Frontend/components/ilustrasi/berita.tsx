/* Ilustrasi use-case: website berita. */
export default function BeritaIllustration() {
  return (
    <svg viewBox="0 0 360 240" aria-hidden="true">
      <circle cx="300" cy="186" r="24" fill="#FCE8E6" />

      {/* Halaman berita */}
      <rect x="46" y="30" width="268" height="180" rx="22" fill="#fff" stroke="#DADCE0" strokeWidth="2" />
      <rect x="68" y="50" width="96" height="14" rx="7" fill="#D93025" />
      <rect x="68" y="74" width="150" height="9" rx="4.5" fill="#202124" />
      <rect x="68" y="90" width="110" height="7" rx="3.5" fill="#DADCE0" />

      {/* Foto utama */}
      <rect x="68" y="110" width="140" height="80" rx="14" fill="#1A73E8" />
      <path d="M80 182l34-38 26 27 16-16 32 27z" fill="#fff" opacity=".9" />
      <circle cx="186" cy="128" r="9" fill="#FEF7E0" />

      {/* Daftar artikel */}
      <rect x="222" y="110" width="72" height="22" rx="11" fill="#FEF7E0" />
      <rect x="234" y="118" width="48" height="6" rx="3" fill="#EA6A12" />
      <rect x="222" y="140" width="72" height="7" rx="3.5" fill="#202124" />
      <rect x="222" y="152" width="54" height="6" rx="3" fill="#DADCE0" />
      <rect x="222" y="168" width="72" height="22" rx="11" fill="#FCE8E6" />
      <rect x="234" y="176" width="48" height="6" rx="3" fill="#D93025" />
    </svg>
  );
}
