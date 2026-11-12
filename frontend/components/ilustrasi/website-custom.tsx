/* Ilustrasi use-case: website custom. */
export default function WebsiteCustomIllustration() {
  return (
    <svg viewBox="0 0 360 240" aria-hidden="true">
      <circle cx="296" cy="52" r="20" fill="#FEF7E0" />
      <circle cx="48" cy="196" r="13" fill="#1A73E8" opacity=".16" />

      {/* Kanvas desain */}
      <rect x="46" y="32" width="268" height="176" rx="24" fill="#fff" stroke="#1A73E8" strokeWidth="2" strokeDasharray="10 8" />

      {/* Hero blok */}
      <rect x="70" y="56" width="220" height="44" rx="14" fill="#E8F0FE" />
      <rect x="88" y="70" width="118" height="10" rx="5" fill="#1A73E8" />
      <rect x="88" y="84" width="72" height="6" rx="3" fill="#1A73E8" opacity=".45" />

      {/* Tiga kolom */}
      <rect x="70" y="112" width="66" height="72" rx="14" fill="#D93025" />
      <rect x="82" y="130" width="42" height="7" rx="3.5" fill="#fff" opacity=".9" />
      <rect x="82" y="144" width="30" height="7" rx="3.5" fill="#fff" opacity=".9" />

      <rect x="148" y="112" width="66" height="72" rx="14" fill="#FEF7E0" stroke="#DADCE0" strokeWidth="2" />
      <circle cx="181" cy="140" r="13" fill="#EA6A12" opacity=".9" />
      <rect x="162" y="162" width="38" height="6" rx="3" fill="#DADCE0" />

      <rect x="226" y="112" width="64" height="72" rx="14" fill="#1A73E8" />
      <rect x="238" y="130" width="40" height="7" rx="3.5" fill="#fff" opacity=".9" />
      <rect x="238" y="144" width="40" height="7" rx="3.5" fill="#fff" opacity=".9" />
      <rect x="238" y="158" width="24" height="7" rx="3.5" fill="#fff" opacity=".6" />

      {/* Palet & penggaris */}
      <circle cx="302" cy="192" r="16" fill="#EA6A12" />
      <path d="M295 197l10-12 6 8" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <g fill="#1A73E8">
        <circle cx="78" cy="200" r="4" opacity=".8" />
        <circle cx="92" cy="200" r="4" opacity=".55" />
        <circle cx="106" cy="200" r="4" opacity=".3" />
      </g>
    </svg>
  );
}
