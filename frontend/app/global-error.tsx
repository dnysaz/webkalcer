"use client";
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          fontFamily: "Roboto, system-ui, sans-serif",
          background: "#f1f3f4",
          color: "#202124",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            textAlign: "center",
            background: "#fff",
            border: "1px solid #dadce0",
            borderRadius: 16,
            padding: 40,
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 700, color: "#d93025" }}>500</div>
          <h1 style={{ fontSize: 24, marginTop: 4 }}>Terjadi kesalahan kritis</h1>
          <p style={{ color: "#5f6368", lineHeight: 1.6 }}>
            Halaman mengalami gangguan total. Silakan coba lagi atau muat ulang.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: 16,
              padding: "12px 24px",
              borderRadius: 8,
              border: "none",
              background: "#1a73e8",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Muat Ulang
          </button>
        </div>
      </body>
    </html>
  );
}
