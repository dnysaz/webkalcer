/* Ilustrasi use-case: backend-as-a-service (BaaS). */
export default function BaasIllustration() {
  return (
    <svg viewBox="0 0 360 240" aria-hidden="true">
      <circle cx="180" cy="122" r="100" fill="#FEF7E0" opacity=".8" />

      {/* Database */}
      <ellipse cx="140" cy="74" rx="52" ry="18" fill="#1A73E8" />
      <path d="M88 74v76c0 10 23 18 52 18s52-8 52-18V74" fill="#1A73E8" opacity=".92" />
      <ellipse cx="140" cy="112" rx="52" ry="18" fill="#fff" opacity=".2" />
      <ellipse cx="140" cy="150" rx="52" ry="18" fill="#fff" opacity=".2" />

      {/* Koneksi lengkung */}
      <path d="M196 96c34 0 24 30 54 30M196 140c30 0 26 22 54 22" stroke="#DADCE0" strokeWidth="3" strokeDasharray="6 7" fill="none" strokeLinecap="round" />

      {/* Node API */}
      <circle cx="252" cy="92" r="15" fill="#fff" stroke="#1A73E8" strokeWidth="3" />
      <circle cx="252" cy="92" r="5" fill="#1A73E8" />
      <circle cx="252" cy="158" r="15" fill="#fff" stroke="#D93025" strokeWidth="3" />
      <circle cx="252" cy="158" r="5" fill="#D93025" />
      <circle cx="300" cy="124" r="15" fill="#fff" stroke="#EA6A12" strokeWidth="3" />
      <circle cx="300" cy="124" r="5" fill="#EA6A12" />

      {/* Sinkronisasi */}
      <circle cx="300" cy="52" r="18" fill="#EA6A12" />
      <path d="M292 52a8 8 0 0 1 14-5m2 5a8 8 0 0 1-14 5" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M306 43v4h-4M294 61v-4h4" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
