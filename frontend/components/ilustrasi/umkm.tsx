/* Ilustrasi use-case: UMKM naik kelas online. */
export default function UmkmIllustration() {
  return (
    <svg viewBox="0 0 360 240" aria-hidden="true">
      <circle cx="180" cy="122" r="98" fill="#FEF7E0" />
      <circle cx="322" cy="62" r="14" fill="#EA6A12" opacity=".2" />

      {/* Ponsel */}
      <rect x="112" y="26" width="136" height="188" rx="26" fill="#fff" stroke="#DADCE0" strokeWidth="2" />
      <rect x="164" y="34" width="32" height="5" rx="2.5" fill="#DADCE0" />
      <rect x="124" y="44" width="112" height="152" rx="16" fill="#F1F3F4" />

      {/* Etalase */}
      <rect x="136" y="56" width="88" height="52" rx="14" fill="#fff" />
      <path d="M136 70a14 14 0 0 1 14-14h60a14 14 0 0 1 14 14v4c-30 8-58 8-88 0z" fill="#EA6A12" />
      <rect x="148" y="80" width="20" height="20" rx="6" fill="#1A73E8" />
      <rect x="178" y="80" width="32" height="14" rx="6" fill="#E8F0FE" />

      {/* Produk */}
      <rect x="136" y="118" width="22" height="22" rx="7" fill="#D93025" />
      <rect x="166" y="122" width="58" height="6" rx="3" fill="#202124" />
      <rect x="166" y="134" width="38" height="6" rx="3" fill="#DADCE0" />
      <rect x="136" y="146" width="22" height="22" rx="7" fill="#1A73E8" />
      <rect x="166" y="150" width="58" height="6" rx="3" fill="#202124" />
      <rect x="166" y="162" width="38" height="6" rx="3" fill="#DADCE0" />

      {/* Tombol pesan */}
      <rect x="136" y="176" width="88" height="14" rx="7" fill="#1A73E8" />
      <rect x="162" y="180" width="36" height="6" rx="3" fill="#fff" />

      {/* Koin */}
      <circle cx="62" cy="150" r="20" fill="#EA6A12" />
      <text x="62" y="157" textAnchor="middle" fontFamily="Roboto,sans-serif" fontWeight="700" fontSize="14" fill="#fff">Rp</text>

      {/* Grafik naik */}
      <rect x="284" y="154" width="14" height="24" rx="7" fill="#DADCE0" />
      <rect x="304" y="136" width="14" height="42" rx="7" fill="#EA6A12" opacity=".7" />
      <rect x="324" y="118" width="14" height="60" rx="7" fill="#1A73E8" />
      <path d="M280 120l26-22c4-3 10-3 14 1l18 14" stroke="#D93025" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M330 108l10 3-6 9z" fill="#D93025" />
    </svg>
  );
}
