"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAuthProviders,
  getMe,
  loginUrl,
  type AuthProviders,
} from "@/lib/api";
import SiteLogo from "@/components/site-logo";
import LandingNavbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";

type Provider = "github" | "google";

const PROVIDER_LABEL: Record<Provider, string> = {
  github: "GitHub",
  google: "Google",
};

function authErrorMessage(code: string, provider: string | null) {
  const label =
    provider === "github" || provider === "google"
      ? PROVIDER_LABEL[provider]
      : "OAuth";

  switch (code) {
    case "provider_not_configured":
      return `Login dengan ${label} belum dikonfigurasi di server. Isi kredensial OAuth di backend/.env lalu restart backend.`;
    case "access_denied":
      return `Login dengan ${label} dibatalkan. Silakan coba lagi.`;
    case "invalid_state":
      return "Sesi login kedaluwarsa atau tidak valid. Silakan coba lagi.";
    case "missing_code":
    case "auth_failed":
      return `Login dengan ${label} gagal. Silakan coba lagi.`;
    default:
      return "Login gagal. Silakan coba lagi.";
  }
}

export default function LoginPage() {
  const [checking, setChecking] = useState(true);
  const [providers, setProviders] = useState<AuthProviders | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState<Provider | null>(null);

  // Sudah login? Langsung ke dashboard.
  useEffect(() => {
    let cancelled = false;

    // Pesan error dari callback OAuth backend (?error=...&provider=...).
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get("error");
    if (errorCode) {
      setAuthError(authErrorMessage(errorCode, params.get("provider")));
      // Bersihkan query agar tidak muncul lagi saat halaman di-refresh.
      window.history.replaceState({}, "", window.location.pathname);
    }

    getAuthProviders()
      .then((value) => {
        if (!cancelled) setProviders(value);
      })
      .catch(() => {
        // Backend belum bisa dihubungi — tombol tetap tampil, error asli
        // akan terlihat saat pengguna mencoba login.
        if (!cancelled) setProviders(null);
      });

    getMe().then((user) => {
      if (cancelled) return;
      if (user) {
        window.location.replace("/dashboard");
      } else {
        setChecking(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = (provider: Provider) => {
    setRedirecting(provider);
    window.location.href = loginUrl(provider, "/dashboard");
  };

  const githubDisabled = checking || redirecting !== null || providers?.github === false;
  const googleDisabled = checking || redirecting !== null || providers?.google === false;

  return (
    <>
      <LandingNavbar hideCta hideLinks />
      <main className="relative flex flex-1 items-center bg-white">
      {/* ===== Panel kiri: branding (layar besar) — gaya homepage ===== */}
      <div className="relative hidden h-full flex-1 flex-col justify-between gap-12 overflow-y-auto border-r border-line p-12 xl:flex 2xl:p-16">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue" />
          <span className="h-2.5 w-2.5 rounded-full bg-red" />
          <span className="h-2.5 w-2.5 rounded-full bg-orange" />
        </div>

        <div className="max-w-lg">
          {/* Section label ala homepage */}
          <p className="flex items-center gap-2 text-base font-medium text-ink">
            <i className="h-3 w-3 rounded-full bg-orange" />
            Hosting gratis
          </p>
          <h1 className="mt-4 text-5xl leading-[1.1] font-medium tracking-tight text-ink 2xl:text-6xl">
            Satu akun untuk{" "}
            <span className="text-blue">website</span> &amp; hosting{" "}
            <span className="text-orange">gratis</span>.
          </h1>
          <p className="mt-6 max-w-md text-xl leading-relaxed text-mute">
            Deploy dari repository GitHub atau upload ZIP, dapatkan subdomain{" "}
            <span className="font-mono text-base font-medium text-ink">nama.webkalcer.com</span>{" "}
            dalam hitungan menit.
          </p>

          {/* Checklist ala homepage: lingkaran warna dengan ikon centang */}
          <ul className="mt-10 divide-y divide-line border-y border-line">
            <li className="flex items-center gap-5 py-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue font-bold text-white">✓</span>
              <span className="text-lg text-ink">Hosting statis gratis tanpa kartu kredit</span>
            </li>
            <li className="flex items-center gap-5 py-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red font-bold text-white">✓</span>
              <span className="text-lg text-ink">SSL otomatis untuk semua situs</span>
            </li>
            <li className="flex items-center gap-5 py-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange font-bold text-white">✓</span>
              <span className="text-lg text-ink">Auto deploy setiap push ke repository</span>
            </li>
          </ul>
        </div>

        <p className="text-base text-mute">
          Dipercaya UMKM &amp; kreator di seluruh Indonesia · ©{" "}
          {new Date().getFullYear()} WebKalcer
        </p>
      </div>

      {/* ===== Panel kanan: form (tidak diubah) ===== */}
      <div className="relative flex flex-1 items-center justify-center p-6 py-10 sm:p-10">
        <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-[0_8px_30px_rgba(32,33,36,0.08)] sm:p-10">
        <SiteLogo height={30} mobileHeight={21} />
        <h1 className="mt-6 text-3xl font-medium">Masuk dulu, yuk.</h1>
        <p className="mt-2 text-mute">
          Deploy website dari repository GitHub atau upload ZIP — gratis.
        </p>

        {authError && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-red/30 bg-red/5 p-4 text-base text-red"
          >
            <i
              className="fa-solid fa-circle-exclamation mt-0.5"
              aria-hidden="true"
            />
            <span>{authError}</span>
          </div>
        )}

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={() => login("github")}
            disabled={githubDisabled}
            className="btn flex w-full items-center justify-center gap-3 rounded-full bg-ink px-8 py-4 text-lg font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GithubIcon />
            {redirecting === "github"
              ? "Mengalihkan ke GitHub…"
              : "Masuk dengan GitHub"}
          </button>
          <button
            type="button"
            onClick={() => login("google")}
            disabled={googleDisabled}
            className="btn flex w-full items-center justify-center gap-3 rounded-full border border-line bg-white px-8 py-4 text-lg font-medium text-ink hover:bg-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GoogleIcon />
            {redirecting === "google"
              ? "Mengalihkan ke Google…"
              : "Masuk dengan Google"}
          </button>
        </div>

        {providers && (!providers.github || !providers.google) && (
          <p className="mt-4 flex items-start gap-2 rounded-2xl bg-soft p-4 text-sm leading-relaxed text-mute">
            <i
              className="fa-solid fa-circle-info mt-0.5"
              aria-hidden="true"
            />
            <span>
              {[
                !providers.github ? "GitHub" : null,
                !providers.google ? "Google" : null,
              ]
                .filter(Boolean)
                .join(" dan ")}{" "}
              belum aktif. Isi kredensial OAuth di{" "}
              <span className="font-mono text-ink">backend/.env</span> lalu
              restart backend.
            </span>
          </p>
        )}

        {checking && <p className="mt-6 text-base text-mute">Memeriksa sesi…</p>}

        <p className="mt-8 text-base text-mute">
          Dengan masuk, Anda setuju pada syarat layanan WebKalcer.{" "}
          <Link href="/" className="text-blue hover:underline">
            Kembali ke beranda
          </Link>
        </p>
        </div>
      </div>
      </main>
      <Footer />
    </>
  );
}

function GithubIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.54-.01 2.79-.01 3.17 0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
