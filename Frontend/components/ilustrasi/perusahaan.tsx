/* Ilustrasi use-case: landing page perusahaan. */
export default function PerusahaanIllustration() {
  return (
    <svg viewBox="0 0 360 240" aria-hidden="true">
      <circle cx="278" cy="140" r="86" fill="#E8F0FE" />
      <circle cx="52" cy="52" r="12" fill="#EA6A12" opacity=".2" />
      <rect x="44" y="188" width="272" height="10" rx="5" fill="#DADCE0" />

      {/* Gedung */}
      <rect x="62" y="58" width="124" height="130" rx="20" fill="#fff" stroke="#DADCE0" strokeWidth="2" />
      <path d="M62 78a20 20 0 0 1 20-20h84a20 20 0 0 1 20 20v16H62z" fill="#1A73E8" />
      <rect x="80" y="108" width="20" height="18" rx="6" fill="#DADCE0" />
      <rect x="112" y="108" width="20" height="18" rx="6" fill="#DADCE0" />
      <rect x="144" y="108" width="20" height="18" rx="6" fill="#EA6A12" />
      <rect x="80" y="138" width="20" height="18" rx="6" fill="#DADCE0" />
      <rect x="112" y="138" width="20" height="18" rx="6" fill="#DADCE0" />
      <rect x="144" y="138" width="20" height="18" rx="6" fill="#DADCE0" />
      <rect x="108" y="162" width="32" height="26" rx="8" fill="#202124" />

      {/* Kartu profil perusahaan */}
      <rect x="204" y="64" width="116" height="96" rx="18" fill="#fff" stroke="#DADCE0" strokeWidth="2" />
      <path d="M204 82a18 18 0 0 1 18-18h80a18 18 0 0 1 18 18v8H204z" fill="#202124" />
      <circle cx="216" cy="86" r="3" fill="#fff" />
      <circle cx="226" cy="86" r="3" fill="#fff" opacity=".65" />
      <circle cx="228" cy="112" r="10" fill="#EA6A12" />
      <rect x="248" y="104" width="56" height="8" rx="4" fill="#202124" />
      <rect x="248" y="118" width="36" height="6" rx="3" fill="#DADCE0" />
      <rect x="220" y="134" width="84" height="16" rx="8" fill="#1A73E8" />
      <rect x="236" y="140" width="52" height="4" rx="2" fill="#fff" />
    </svg>
  );
}
