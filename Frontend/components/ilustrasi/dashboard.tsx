/* Ilustrasi use-case: dashboard aplikasi. */
export default function DashboardIllustration() {
  return (
    <svg viewBox="0 0 360 240" aria-hidden="true">
      <circle cx="58" cy="44" r="18" fill="#E8F0FE" />

      {/* Jendela dashboard */}
      <rect x="40" y="28" width="280" height="184" rx="22" fill="#fff" stroke="#DADCE0" strokeWidth="2" />

      {/* Sidebar */}
      <path d="M40 50a22 22 0 0 1 22-22h34v184H62a22 22 0 0 1-22-22z" fill="#202124" />
      <circle cx="68" cy="54" r="5" fill="#EA6A12" />
      <rect x="60" y="76" width="34" height="7" rx="3.5" fill="#5F6368" />
      <rect x="60" y="94" width="34" height="7" rx="3.5" fill="#5F6368" />
      <rect x="60" y="112" width="24" height="7" rx="3.5" fill="#1A73E8" />

      {/* Kartu statistik */}
      <rect x="118" y="46" width="86" height="42" rx="14" fill="#E8F0FE" />
      <rect x="132" y="58" width="38" height="9" rx="4.5" fill="#1A73E8" />
      <rect x="132" y="72" width="24" height="6" rx="3" fill="#1A73E8" opacity=".5" />

      <rect x="216" y="46" width="86" height="42" rx="14" fill="#FCE8E6" />
      <rect x="230" y="58" width="38" height="9" rx="4.5" fill="#D93025" />
      <rect x="230" y="72" width="24" height="6" rx="3" fill="#D93025" opacity=".5" />

      {/* Grafik area */}
      <rect x="118" y="104" width="184" height="88" rx="16" fill="#FEF7E0" />
      <path d="M134 174c22-6 30-34 48-34 18 0 24 20 40 20s26-26 44-30" stroke="#EA6A12" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="266" cy="130" r="5" fill="#EA6A12" />

      {/* Donut */}
      <circle cx="140" cy="136" r="14" fill="none" stroke="#1A73E8" strokeWidth="6" strokeDasharray="46 42" strokeLinecap="round" transform="rotate(-90 140 136)" />
      <circle cx="292" cy="80" r="4" fill="#1A73E8" />
    </svg>
  );
}
