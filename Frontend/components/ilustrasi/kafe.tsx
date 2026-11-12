/* Ilustrasi hero halaman /layanan — kedai/ruko dengan bentuk organik. */
export default function KafeIllustration() {
  return (
    <svg viewBox="0 0 360 240" aria-hidden="true">
      <circle cx="186" cy="124" r="100" fill="#E8F0FE" />
      <circle cx="308" cy="54" r="16" fill="#EA6A12" opacity=".22" />
      <circle cx="46" cy="188" r="11" fill="#D93025" opacity=".16" />

      {/* Papan nama */}
      <rect x="126" y="28" width="120" height="40" rx="14" fill="#fff" stroke="#DADCE0" strokeWidth="2" />
      <rect x="146" y="43" width="42" height="10" rx="5" fill="#1A73E8" />
      <circle cx="210" cy="48" r="5" fill="#EA6A12" />
      <circle cx="226" cy="48" r="5" fill="#D93025" />

      {/* Bangunan */}
      <rect x="96" y="84" width="176" height="116" rx="18" fill="#fff" stroke="#DADCE0" strokeWidth="2" />

      {/* Tenda bergelombang */}
      <path
        d="M84 96c34-16 66-16 100-8 34 8 66 8 100-8v22c-34 16-66 16-100 8-34-8-66-8-100 8z"
        fill="#EA6A12"
      />
      <path d="M104 92c56-12 112-10 168 2" stroke="#fff" strokeWidth="3" fill="none" opacity=".45" strokeLinecap="round" />

      {/* Jendela & pintu */}
      <rect x="114" y="132" width="48" height="38" rx="12" fill="#E8F0FE" stroke="#DADCE0" strokeWidth="2" />
      <rect x="174" y="132" width="44" height="68" rx="12" fill="#1A73E8" />
      <circle cx="210" cy="168" r="4" fill="#fff" />
      <rect x="232" y="132" width="30" height="38" rx="12" fill="#FEF7E0" stroke="#DADCE0" strokeWidth="2" />

      {/* Meja & tanaman */}
      <rect x="120" y="198" width="128" height="8" rx="4" fill="#DADCE0" />
      <path d="M288 178c-2-18 6-32 20-38" stroke="#1A73E8" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="310" cy="138" r="10" fill="#1A73E8" opacity=".8" />
      <circle cx="300" cy="158" r="7" fill="#1A73E8" opacity=".5" />
    </svg>
  );
}
