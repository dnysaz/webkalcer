/* Ilustrasi use-case: toko retail. */
export default function RetailIllustration() {
  return (
    <svg viewBox="0 0 360 240" aria-hidden="true">
      <circle cx="180" cy="120" r="102" fill="#E8F0FE" opacity=".7" />

      {/* Rak */}
      <rect x="48" y="56" width="180" height="7" rx="3.5" fill="#202124" />
      <rect x="48" y="124" width="180" height="7" rx="3.5" fill="#202124" />
      <rect x="48" y="190" width="180" height="7" rx="3.5" fill="#202124" />

      {/* Produk baris atas */}
      <rect x="58" y="78" width="22" height="46" rx="8" fill="#1A73E8" />
      <rect x="88" y="86" width="22" height="38" rx="8" fill="#D93025" />
      <rect x="118" y="74" width="22" height="50" rx="8" fill="#EA6A12" />
      <rect x="148" y="90" width="22" height="34" rx="8" fill="#1A73E8" opacity=".7" />
      <rect x="178" y="80" width="22" height="44" rx="8" fill="#D93025" opacity=".8" />

      {/* Produk baris bawah */}
      <rect x="58" y="146" width="22" height="44" rx="8" fill="#EA6A12" opacity=".8" />
      <rect x="88" y="154" width="22" height="36" rx="8" fill="#1A73E8" />
      <rect x="118" y="142" width="22" height="48" rx="8" fill="#D93025" />
      <rect x="148" y="158" width="22" height="32" rx="8" fill="#EA6A12" />
      <rect x="178" y="148" width="22" height="42" rx="8" fill="#1A73E8" />

      {/* Keranjang */}
      <path d="M258 138h66l-8 60a12 12 0 0 1-12 10h-26a12 12 0 0 1-12-10z" fill="#1A73E8" />
      <path d="M278 138v-8a14 14 0 0 1 28 0v8" fill="none" stroke="#202124" strokeWidth="6" strokeLinecap="round" />
      <rect x="270" y="156" width="42" height="8" rx="4" fill="#fff" opacity=".9" />
      <rect x="270" y="170" width="26" height="8" rx="4" fill="#fff" opacity=".6" />

      {/* Label harga */}
      <circle cx="62" cy="216" r="15" fill="#EA6A12" />
      <path d="M62 208v8l6 4" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
