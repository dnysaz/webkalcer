/* Ilustrasi halaman Website Custom: kartu portofolio & kuas. */
export default function PortofolioIllustration() {
  return (
    <svg viewBox="0 0 360 240" aria-hidden="true">
      <circle cx="180" cy="120" r="100" fill="#E8F0FE" />

      {/* Kartu belakang */}
      <g transform="rotate(-7 120 128)">
        <rect x="56" y="54" width="112" height="140" rx="18" fill="#fff" stroke="#DADCE0" strokeWidth="2" />
        <rect x="70" y="68" width="84" height="86" rx="12" fill="#D93025" />
        <circle cx="112" cy="100" r="14" fill="#fff" opacity=".9" />
        <rect x="70" y="164" width="56" height="8" rx="4" fill="#DADCE0" />
      </g>

      {/* Kartu depan */}
      <g transform="rotate(6 240 120)">
        <rect x="184" y="44" width="112" height="140" rx="18" fill="#fff" stroke="#DADCE0" strokeWidth="2" />
        <rect x="198" y="58" width="84" height="86" rx="12" fill="#1A73E8" />
        <path d="M198 144l28-38 20 24 12-13 16 27z" fill="#fff" opacity=".9" />
        <rect x="198" y="156" width="56" height="8" rx="4" fill="#DADCE0" />
      </g>

      {/* Kuas */}
      <g transform="rotate(30 292 180)">
        <rect x="286" y="156" width="10" height="36" rx="5" fill="#EA6A12" />
        <path d="M286 192h10l-5 12z" fill="#202124" />
      </g>

      {/* Aksen */}
      <circle cx="62" cy="206" r="14" fill="#F2C9A0" />
      <rect x="46" y="216" width="32" height="14" rx="7" fill="#202124" />
      <circle cx="318" cy="60" r="10" fill="#EA6A12" opacity=".24" />
    </svg>
  );
}
