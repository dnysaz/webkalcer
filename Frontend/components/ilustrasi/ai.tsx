/* Ilustrasi use-case: adopsi AI. */
export default function AiIllustration() {
  return (
    <svg viewBox="0 0 360 240" aria-hidden="true">
      <circle cx="180" cy="120" r="100" fill="#E8F0FE" opacity=".8" />

      {/* Sirkuit lengkung */}
      <path d="M120 82V54c0-6 4-10 10-10h22M240 82V54c0-6-4-10-10-10h-22M120 158v28c0 6 4 10 10 10h22M240 158v28c0 6-4 10-10 10h-22" stroke="#DADCE0" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="152" cy="44" r="5" fill="#1A73E8" />
      <circle cx="208" cy="44" r="5" fill="#D93025" />
      <circle cx="152" cy="196" r="5" fill="#D93025" />
      <circle cx="208" cy="196" r="5" fill="#1A73E8" />

      {/* Chip */}
      <rect x="112" y="76" width="136" height="88" rx="20" fill="#202124" />
      <circle cx="154" cy="118" r="9" fill="#1A73E8" />
      <circle cx="206" cy="118" r="9" fill="#EA6A12" />
      <path d="M156 140q24 12 48 0" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" />

      {/* Kaki chip */}
      <rect x="128" y="62" width="9" height="14" rx="4.5" fill="#EA6A12" />
      <rect x="176" y="62" width="9" height="14" rx="4.5" fill="#EA6A12" />
      <rect x="224" y="62" width="9" height="14" rx="4.5" fill="#EA6A12" />
      <rect x="128" y="164" width="9" height="14" rx="4.5" fill="#EA6A12" />
      <rect x="176" y="164" width="9" height="14" rx="4.5" fill="#EA6A12" />
      <rect x="224" y="164" width="9" height="14" rx="4.5" fill="#EA6A12" />

      {/* Percikan */}
      <path d="M296 54l3.4 8 8 1.2-5.9 5.6 1.4 8-6.9-4-6.9 4 1.4-8-5.9-5.6 8-1.2z" fill="#EA6A12" />
      <path d="M54 176l2.6 6 6 1-4.4 4.2 1 6-5.2-3-5.2 3 1-6-4.4-4.2 6-1z" fill="#1A73E8" opacity=".6" />
    </svg>
  );
}
