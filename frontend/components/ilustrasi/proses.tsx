/* Ilustrasi halaman Proses Pembuatan: empat tahap terhubung. */
export default function ProsesIllustration() {
  return (
    <svg viewBox="0 0 360 240" aria-hidden="true">
      <circle cx="180" cy="122" r="102" fill="#FEF7E0" opacity=".8" />

      {/* Jalur lengkung */}
      <path d="M52 168c34 0 34-44 68-44s34 44 68 44 34-44 68-44 34 22 56 26" stroke="#DADCE0" strokeWidth="4" strokeDasharray="9 9" fill="none" strokeLinecap="round" />

      {/* Tahap */}
      <g fontFamily="Roboto,sans-serif" fontWeight="700" fontSize="20" fill="#fff" textAnchor="middle">
        <circle cx="52" cy="168" r="26" fill="#1A73E8" />
        <text x="52" y="175">1</text>
        <circle cx="120" cy="124" r="26" fill="#D93025" />
        <text x="120" y="131">2</text>
        <circle cx="188" cy="168" r="26" fill="#EA6A12" />
        <text x="188" y="175">3</text>
        <circle cx="256" cy="124" r="26" fill="#1A73E8" />
        <text x="256" y="131">4</text>
      </g>

      {/* Kartu kecil di atas tahap */}
      <rect x="74" y="52" width="82" height="44" rx="14" fill="#fff" stroke="#DADCE0" strokeWidth="2" />
      <circle cx="98" cy="74" r="8" fill="#1A73E8" opacity=".2" />
      <rect x="112" y="70" width="30" height="7" rx="3.5" fill="#DADCE0" />
      <rect x="84" y="86" width="58" height="5" rx="2.5" fill="#DADCE0" opacity=".7" />

      <circle cx="312" cy="60" r="10" fill="#EA6A12" opacity=".25" />
      <path d="M300 190l4-10 4 10 10 4-10 4-4 10-4-10-10-4z" fill="#1A73E8" opacity=".2" />
    </svg>
  );
}
