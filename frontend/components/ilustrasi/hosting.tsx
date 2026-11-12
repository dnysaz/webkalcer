/* Ilustrasi halaman Hosting Statis Gratis: cloud, ZIP, git, server. */
export default function HostingIllustration() {
  return (
    <svg viewBox="0 0 360 240" aria-hidden="true">
      <circle cx="180" cy="120" r="102" fill="#E8F0FE" opacity=".7" />

      {/* Awan */}
      <path d="M136 58a22 22 0 0 1 40-11 18 18 0 0 1 29 13 16 16 0 0 1-2 32h-60a16 16 0 0 1-7-34z" fill="#1A73E8" />
      <path d="M174 76v-12m-6 6 6-6 6 6" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Garis koneksi */}
      <path d="M138 84c-22 10-22 34-44 40M210 84c22 10 22 34 44 40" stroke="#DADCE0" strokeWidth="3" strokeDasharray="6 7" fill="none" strokeLinecap="round" />

      {/* ZIP */}
      <rect x="56" y="132" width="78" height="62" rx="14" fill="#EA6A12" />
      <path d="M56 146a14 14 0 0 1 14-14h18l9 10h23a14 14 0 0 1 14 14v2H56z" fill="#C85A0E" />
      <text x="95" y="170" textAnchor="middle" fontFamily="Roboto Mono,monospace" fontWeight="500" fontSize="16" fill="#fff">.ZIP</text>

      {/* Git */}
      <circle cx="244" cy="146" r="10" fill="#D93025" />
      <circle cx="244" cy="188" r="10" fill="#D93025" />
      <circle cx="276" cy="166" r="10" fill="#D93025" />
      <path d="M244 156v22M244 176c0-12 14-10 22-10" stroke="#D93025" strokeWidth="5" fill="none" strokeLinecap="round" />

      {/* Server */}
      <rect x="140" y="180" width="120" height="28" rx="12" fill="#202124" />
      <circle cx="158" cy="194" r="4" fill="#25D366" />
      <circle cx="172" cy="194" r="4" fill="#1A73E8" />
      <rect x="196" y="190" width="48" height="7" rx="3.5" fill="#5F6368" />
    </svg>
  );
}
