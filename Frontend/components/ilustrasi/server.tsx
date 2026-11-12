/* Ilustrasi use-case: server berkualitas. */
export default function ServerIllustration() {
  return (
    <svg viewBox="0 0 360 240" aria-hidden="true">
      <circle cx="180" cy="120" r="100" fill="#FCE8E6" opacity=".6" />

      {/* Awan */}
      <path d="M132 54a20 20 0 0 1 37-10 17 17 0 0 1 27 12 15 15 0 0 1-2 30h-56a15 15 0 0 1-6-32z" fill="#1A73E8" />
      <path d="M168 72v-12m-6 6 6-6 6 6" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M168 92v14" stroke="#DADCE0" strokeWidth="3" strokeDasharray="5 6" strokeLinecap="round" />

      {/* Rack server */}
      <rect x="104" y="112" width="144" height="38" rx="14" fill="#202124" />
      <rect x="104" y="158" width="144" height="38" rx="14" fill="#202124" />
      <circle cx="124" cy="131" r="4" fill="#25D366" />
      <circle cx="138" cy="131" r="4" fill="#1A73E8" />
      <rect x="172" y="127" width="56" height="8" rx="4" fill="#5F6368" />
      <circle cx="124" cy="177" r="4" fill="#25D366" />
      <circle cx="138" cy="177" r="4" fill="#EA6A12" />
      <rect x="172" y="173" width="56" height="8" rx="4" fill="#5F6368" />

      {/* Perisai */}
      <circle cx="288" cy="118" r="30" fill="#1A73E8" opacity=".12" />
      <path d="M288 94l18 9v16c0 13-11 20-18 22-7-2-18-9-18-22v-16z" fill="#1A73E8" />
      <path d="M280 116l6 6 10-10" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Petir */}
      <path d="M288 174l-8 14h11l-4 12 13-17h-9z" fill="#EA6A12" />
    </svg>
  );
}
