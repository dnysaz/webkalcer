/* Ilustrasi use-case: instansi menengah, perusahaan & daerah. */
export default function InstansiIllustration() {
  return (
    <svg viewBox="0 0 360 240" aria-hidden="true">
      <circle cx="180" cy="126" r="102" fill="#FEF7E0" opacity=".8" />
      <rect x="48" y="196" width="264" height="10" rx="5" fill="#DADCE0" />

      {/* Kubah & atap melengkung */}
      <path d="M124 92c0-24 24-42 56-42s56 18 56 42z" fill="#1A73E8" />
      <rect x="116" y="92" width="128" height="10" rx="5" fill="#202124" />
      <circle cx="180" cy="42" r="7" fill="#EA6A12" />

      {/* Badan gedung */}
      <rect x="126" y="102" width="108" height="94" rx="16" fill="#fff" stroke="#DADCE0" strokeWidth="2" />
      <rect x="144" y="120" width="12" height="52" rx="6" fill="#DADCE0" />
      <rect x="164" y="120" width="12" height="52" rx="6" fill="#DADCE0" />
      <rect x="184" y="120" width="12" height="52" rx="6" fill="#DADCE0" />
      <rect x="204" y="120" width="12" height="52" rx="6" fill="#DADCE0" />
      <rect x="158" y="172" width="44" height="24" rx="8" fill="#202124" />

      {/* Dokumen resmi */}
      <rect x="246" y="118" width="90" height="64" rx="16" fill="#fff" stroke="#DADCE0" strokeWidth="2" transform="rotate(-6 291 150)" />
      <rect x="262" y="136" width="50" height="7" rx="3.5" fill="#D93025" transform="rotate(-6 291 150)" />
      <rect x="262" y="150" width="34" height="6" rx="3" fill="#DADCE0" transform="rotate(-6 291 150)" />

      {/* Lencana */}
      <circle cx="312" cy="72" r="17" fill="#EA6A12" />
      <path d="M312 63l2.7 6.3 6.8.9-5 4.7 1.3 6.8-5.8-3.3-5.8 3.3 1.3-6.8-5-4.7 6.8-.9z" fill="#fff" />
    </svg>
  );
}
