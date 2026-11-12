/* Ilustrasi use-case: landing page personal branding. */
export default function PersonalBrandingIllustration() {
  return (
    <svg viewBox="0 0 360 240" aria-hidden="true">
      <circle cx="180" cy="120" r="100" fill="#FEF7E0" />
      <circle cx="322" cy="188" r="14" fill="#1A73E8" opacity=".18" />

      {/* Kartu profil */}
      <rect x="52" y="44" width="150" height="156" rx="22" fill="#fff" stroke="#DADCE0" strokeWidth="2" />
      <circle cx="127" cy="102" r="30" fill="#F2C9A0" />
      <path d="M97 98a30 30 0 0 1 60 0c-12-14-48-14-60 0z" fill="#202124" />
      <circle cx="117" cy="106" r="2.6" fill="#202124" />
      <circle cx="137" cy="106" r="2.6" fill="#202124" />
      <path d="M120 116q7 6 14 0" stroke="#202124" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <rect x="97" y="144" width="60" height="10" rx="5" fill="#202124" />
      <rect x="107" y="160" width="40" height="8" rx="4" fill="#DADCE0" />
      <rect x="93" y="176" width="68" height="18" rx="9" fill="#1A73E8" />
      <rect x="111" y="183" width="32" height="5" rx="2.5" fill="#fff" />

      {/* Galeri */}
      <rect x="220" y="52" width="88" height="68" rx="18" fill="#D93025" />
      <circle cx="264" cy="82" r="14" fill="#fff" opacity=".9" />
      <rect x="220" y="132" width="88" height="68" rx="18" fill="#E8F0FE" stroke="#DADCE0" strokeWidth="2" />
      <path d="M234 186l20-26 15 17 11-11 15 20" stroke="#1A73E8" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Suka */}
      <circle cx="302" cy="36" r="15" fill="#EA6A12" />
      <path d="M302 43c-5-3-9-7-9-11a4.5 4.5 0 0 1 9-1.7 4.5 4.5 0 0 1 9 1.7c0 4-4 8-9 11z" fill="#fff" />
    </svg>
  );
}
