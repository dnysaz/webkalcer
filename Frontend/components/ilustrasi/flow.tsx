/* Diagram alur homepage: Pengunjung → Cloudflare → situs *.webkalcer.com */
export default function FlowIllustration() {
  return (
    <svg
      viewBox="0 0 560 230"
      role="img"
      aria-label="Alur pengunjung melewati Cloudflare menuju situs Anda"
    >
      {/* Konektor lengkung */}
      <path
        d="M146 88c26 0 30-16 50-16s28 16 46 16"
        stroke="#DADCE0"
        strokeWidth="3"
        strokeDasharray="7 8"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M222 88l-12-6.5v13z" fill="#DADCE0" />
      <path
        d="M338 88c26 0 30-16 50-16s28 16 46 16"
        stroke="#DADCE0"
        strokeWidth="3"
        strokeDasharray="7 8"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M414 88l-12-6.5v13z" fill="#DADCE0" />

      {/* Pengguna */}
      <circle cx="92" cy="88" r="54" fill="#E8F0FE" />
      <circle cx="92" cy="76" r="15" fill="#1A73E8" />
      <path d="M64 122a28 24 0 0 1 56 0z" fill="#1A73E8" />
      <text
        x="92"
        y="172"
        textAnchor="middle"
        fontFamily="Roboto Mono,monospace"
        fontWeight="500"
        fontSize="14"
        fill="#5F6368"
      >
        Anda
      </text>

      {/* Cloudflare */}
      <circle cx="280" cy="88" r="58" fill="#FEF7E0" />
      <g fill="#EA6A12">
        <circle cx="258" cy="86" r="14" />
        <circle cx="280" cy="74" r="18" />
        <circle cx="306" cy="86" r="14" />
        <rect x="244" y="86" width="76" height="18" rx="9" />
      </g>
      <path
        d="M266 95h32m-22-10 10 10-10 10"
        stroke="#fff"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="280"
        y="172"
        textAnchor="middle"
        fontFamily="Roboto Mono,monospace"
        fontWeight="500"
        fontSize="14"
        fill="#EA6A12"
      >
        Cloudflare
      </text>
      <text
        x="280"
        y="196"
        textAnchor="middle"
        fontFamily="Roboto,sans-serif"
        fontSize="11"
        fill="#5F6368"
      >
        SSL gratis · Anti-DDoS
      </text>

      {/* Situs Anda */}
      <circle cx="468" cy="88" r="54" fill="#fff" stroke="#DADCE0" strokeWidth="2" />
      <rect x="436" y="62" width="64" height="44" rx="10" fill="#fff" stroke="#DADCE0" strokeWidth="2" />
      <path d="M436 72a10 10 0 0 1 10-10h44a10 10 0 0 1 10 10v6h-64z" fill="#1A73E8" />
      <circle cx="444" cy="68" r="2" fill="#fff" />
      <circle cx="451" cy="68" r="2" fill="#fff" opacity=".75" />
      <rect x="444" y="86" width="30" height="6" rx="3" fill="#DADCE0" />
      <circle cx="468" cy="126" r="11" fill="#1A73E8" />
      <path
        d="M463 126l4 4 7-8"
        stroke="#fff"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="468"
        y="172"
        textAnchor="middle"
        fontFamily="Roboto Mono,monospace"
        fontWeight="500"
        fontSize="12"
        fill="#1A73E8"
      >
        *.webkalcer.com
      </text>
      <text
        x="468"
        y="196"
        textAnchor="middle"
        fontFamily="Roboto,sans-serif"
        fontSize="11"
        fill="#5F6368"
      >
        situs Anda
      </text>
    </svg>
  );
}
