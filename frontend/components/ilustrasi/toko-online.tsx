/* Ilustrasi use-case: toko online. */
export default function TokoOnlineIllustration() {
  return (
    <svg viewBox="0 0 360 240" aria-hidden="true">
      <circle cx="180" cy="122" r="98" fill="#FCE8E6" />
      <circle cx="312" cy="60" r="14" fill="#1A73E8" opacity=".18" />

      {/* Ponsel */}
      <rect x="118" y="28" width="124" height="184" rx="24" fill="#fff" stroke="#DADCE0" strokeWidth="2" />
      <rect x="164" y="36" width="32" height="5" rx="2.5" fill="#DADCE0" />
      <rect x="130" y="46" width="100" height="148" rx="14" fill="#F1F3F4" />

      {/* Produk unggulan */}
      <rect x="142" y="58" width="76" height="58" rx="12" fill="#D93025" />
      <path d="M166 58v-6a14 14 0 0 1 28 0v6" fill="none" stroke="#202124" strokeWidth="5" strokeLinecap="round" />
      <circle cx="180" cy="86" r="8" fill="#fff" />
      <rect x="142" y="126" width="52" height="8" rx="4" fill="#202124" />
      <rect x="142" y="140" width="34" height="6" rx="3" fill="#DADCE0" />

      {/* Tombol beli */}
      <rect x="142" y="158" width="76" height="20" rx="10" fill="#1A73E8" />
      <rect x="158" y="165" width="44" height="6" rx="3" fill="#fff" />

      {/* Keranjang */}
      <circle cx="262" cy="182" r="22" fill="#EA6A12" />
      <path d="M252 180h16l-2 12h-12z" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M255 180a4 4 0 0 1 8 0" fill="none" stroke="#fff" strokeWidth="2.5" />
      <circle cx="256" cy="194" r="2" fill="#fff" />
      <circle cx="264" cy="194" r="2" fill="#fff" />

      {/* Label harga */}
      <rect x="244" y="94" width="58" height="34" rx="12" fill="#fff" stroke="#DADCE0" strokeWidth="2" transform="rotate(8 273 111)" />
      <rect x="256" y="104" width="34" height="7" rx="3.5" fill="#1A73E8" transform="rotate(8 273 111)" />
      <rect x="256" y="116" width="22" height="6" rx="3" fill="#DADCE0" transform="rotate(8 273 111)" />
    </svg>
  );
}
