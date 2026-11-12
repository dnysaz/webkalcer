/* Ilustrasi hero homepage — pembuat website bekerja di laptop. */
export default function HeroIllustration() {
  return (
    <svg viewBox="0 0 560 420" aria-hidden="true">
      {/* Latar organik */}
      <circle cx="300" cy="206" r="178" fill="#E8F0FE" />
      <circle cx="474" cy="78" r="54" fill="#EA6A12" opacity=".16" />
      <circle cx="88" cy="286" r="34" fill="#D93025" opacity=".12" />
      <circle cx="470" cy="330" r="16" fill="#1A73E8" opacity=".18" />

      {/* Meja */}
      <rect x="64" y="344" width="432" height="16" rx="8" fill="#DADCE0" />

      {/* Badan & kepala */}
      <path d="M188 344c-2-62 24-100 62-100s64 38 62 100z" fill="#1A73E8" />
      <rect x="242" y="222" width="16" height="26" rx="8" fill="#E8B48A" />
      <circle cx="250" cy="196" r="34" fill="#F2C9A0" />
      <path d="M216 194a34 34 0 0 1 68 0c-14-16-54-16-68 0z" fill="#202124" />
      <circle cx="238" cy="202" r="2.8" fill="#202124" />
      <circle cx="262" cy="202" r="2.8" fill="#202124" />
      <path d="M241 212q9 8 18 0" stroke="#202124" strokeWidth="2.6" fill="none" strokeLinecap="round" />

      {/* Laptop */}
      <rect x="196" y="248" width="170" height="98" rx="16" fill="#202124" />
      <rect x="204" y="256" width="154" height="74" rx="9" fill="#fff" />
      <path d="M204 265a9 9 0 0 1 9-9h136a9 9 0 0 1 9 9v7H204z" fill="#1A73E8" />
      <circle cx="216" cy="264" r="2.6" fill="#fff" />
      <circle cx="226" cy="264" r="2.6" fill="#fff" opacity=".7" />
      <rect x="216" y="282" width="56" height="8" rx="4" fill="#202124" />
      <rect x="216" y="296" width="38" height="7" rx="3.5" fill="#DADCE0" />
      <rect x="216" y="310" width="34" height="12" rx="6" fill="#EA6A12" />
      <rect x="286" y="282" width="60" height="40" rx="10" fill="#FCE8E6" />
      <path d="M294 312l12-14 9 9 6-6 10 11z" fill="#D93025" opacity=".8" />
      <rect x="186" y="346" width="190" height="10" rx="5" fill="#5F6368" />

      {/* Tangan */}
      <circle cx="210" cy="336" r="10" fill="#F2C9A0" />
      <circle cx="352" cy="336" r="10" fill="#F2C9A0" />

      {/* Kartu browser melayang */}
      <rect x="356" y="58" width="146" height="106" rx="18" fill="#fff" stroke="#DADCE0" strokeWidth="2" />
      <path d="M356 76a18 18 0 0 1 18-18h110a18 18 0 0 1 18 18v8H356z" fill="#1A73E8" />
      <circle cx="374" cy="70" r="3" fill="#fff" />
      <circle cx="386" cy="70" r="3" fill="#fff" opacity=".7" />
      <rect x="374" y="98" width="62" height="8" rx="4" fill="#DADCE0" />
      <rect x="374" y="126" width="16" height="24" rx="4" fill="#EA6A12" />
      <rect x="398" y="114" width="16" height="36" rx="4" fill="#1A73E8" />
      <rect x="422" y="104" width="16" height="46" rx="4" fill="#D93025" />

      {/* Kopi */}
      <path d="M104 306h40v26a12 12 0 0 1-12 12h-16a12 12 0 0 1-12-12z" fill="#fff" stroke="#DADCE0" strokeWidth="2" />
      <path d="M144 312h6a8 8 0 0 1 0 16h-6" fill="none" stroke="#DADCE0" strokeWidth="3" />
      <path d="M112 296q-4-8 0-14M126 296q-4-8 0-14" stroke="#EA6A12" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Tanaman */}
      <rect x="452" y="304" width="40" height="40" rx="12" fill="#FEF7E0" stroke="#DADCE0" strokeWidth="2" />
      <path d="M472 304c-2-20 4-34 16-42" stroke="#1A73E8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx="490" cy="258" r="9" fill="#1A73E8" opacity=".75" />
      <circle cx="482" cy="278" r="6.5" fill="#1A73E8" opacity=".45" />
    </svg>
  );
}
