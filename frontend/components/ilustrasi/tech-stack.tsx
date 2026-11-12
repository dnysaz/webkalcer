/* Ilustrasi use-case: tech stack modern. */
export default function TechStackIllustration() {
  return (
    <svg viewBox="0 0 360 240" aria-hidden="true">
      <circle cx="180" cy="118" r="100" fill="#FEF7E0" opacity=".7" />

      {/* Lapisan stack */}
      <rect x="56" y="140" width="196" height="46" rx="18" fill="#202124" />
      <rect x="88" y="96" width="196" height="46" rx="18" fill="#1A73E8" />
      <rect x="120" y="52" width="196" height="46" rx="18" fill="#EA6A12" />

      {/* Kode */}
      <g fontFamily="Roboto Mono,monospace" fontWeight="500" fontSize="18" fill="#fff">
        <text x="152" y="82">{"</>"}</text>
      </g>
      <rect x="108" y="112" width="60" height="9" rx="4.5" fill="#fff" opacity=".9" />
      <rect x="176" y="112" width="34" height="9" rx="4.5" fill="#fff" opacity=".45" />
      <rect x="76" y="156" width="54" height="9" rx="4.5" fill="#fff" opacity=".85" />
      <rect x="140" y="156" width="30" height="9" rx="4.5" fill="#5F6368" />

      {/* Petir */}
      <path d="M310 68l-16 32h13l-5 28 20-36h-13z" fill="#D93025" />
      <circle cx="312" cy="168" r="12" fill="#1A73E8" opacity=".16" />
    </svg>
  );
}
