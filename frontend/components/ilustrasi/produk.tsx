/* Ilustrasi halaman Landing Page Statis: produk & tombol beli. */
export default function ProdukIllustration() {
  return (
    <svg viewBox="0 0 360 240" aria-hidden="true">
      <circle cx="180" cy="122" r="100" fill="#FCE8E6" />

      {/* Kartu produk */}
      <rect x="112" y="42" width="136" height="156" rx="22" fill="#fff" stroke="#DADCE0" strokeWidth="2" />
      <rect x="128" y="58" width="104" height="74" rx="16" fill="#D93025" />
      <path d="M162 58v-8a18 18 0 0 1 36 0v8" fill="none" stroke="#202124" strokeWidth="6" strokeLinecap="round" />
      <circle cx="180" cy="94" r="10" fill="#fff" />
      <rect x="128" y="146" width="66" height="9" rx="4.5" fill="#202124" />
      <rect x="128" y="162" width="44" height="7" rx="3.5" fill="#DADCE0" />
      <rect x="128" y="176" width="72" height="16" rx="8" fill="#1A73E8" />
      <rect x="146" y="181" width="36" height="6" rx="3" fill="#fff" />

      {/* Label harga */}
      <rect x="248" y="58" width="66" height="36" rx="14" fill="#fff" stroke="#DADCE0" strokeWidth="2" transform="rotate(8 281 76)" />
      <rect x="262" y="70" width="38" height="8" rx="4" fill="#EA6A12" transform="rotate(8 281 76)" />

      {/* Bintang & aksen */}
      <circle cx="64" cy="174" r="18" fill="#EA6A12" />
      <path d="M64 164l3 7 7 .9-5.2 5 1.4 7-6.2-3.5-6.2 3.5 1.4-7-5.2-5 7-.9z" fill="#fff" />
      <circle cx="300" cy="152" r="12" fill="#1A73E8" opacity=".16" />
    </svg>
  );
}
