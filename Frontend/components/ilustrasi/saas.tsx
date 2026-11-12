/* Ilustrasi use-case: produk SaaS. */
export default function SaasIllustration() {
  return (
    <svg viewBox="0 0 360 240" aria-hidden="true">
      <circle cx="180" cy="120" r="104" fill="#E8F0FE" opacity=".7" />

      {/* Awan */}
      <path d="M142 74a24 24 0 0 1 44-12 20 20 0 0 1 32 14 18 18 0 0 1-2 36h-66a18 18 0 0 1-8-38z" fill="#1A73E8" />
      <path d="M180 94v-18m-8 9 8-9 8 9" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Kartu langganan */}
      <rect x="52" y="126" width="112" height="86" rx="18" fill="#fff" stroke="#DADCE0" strokeWidth="2" />
      <rect x="70" y="142" width="42" height="10" rx="5" fill="#202124" />
      <rect x="70" y="160" width="76" height="6" rx="3" fill="#DADCE0" />
      <rect x="70" y="174" width="76" height="6" rx="3" fill="#DADCE0" />
      <rect x="70" y="188" width="60" height="14" rx="7" fill="#1A73E8" />

      {/* Toggle & sparkline */}
      <rect x="196" y="126" width="112" height="86" rx="18" fill="#fff" stroke="#DADCE0" strokeWidth="2" />
      <rect x="212" y="142" width="80" height="10" rx="5" fill="#F1F3F4" />
      <circle cx="280" cy="147" r="9" fill="#1A73E8" />
      <path d="M214 196c16 2 22-18 36-18s22 14 34 8" stroke="#EA6A12" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="284" cy="186" r="4" fill="#EA6A12" />
      <circle cx="322" cy="196" r="10" fill="#D93025" opacity=".18" />
    </svg>
  );
}
