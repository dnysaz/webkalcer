import type { ReactNode } from "react";
import Link from "next/link";
import LandingNavbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";

export function ServiceCta({
  kicker,
  title,
  desc,
  primary,
  secondary,
}: {
  kicker: string;
  title: string;
  desc: string;
  primary: { href: string; label: string; external?: boolean };
  secondary?: { href: string; label: string };
}) {
  return (
    <div className="mt-12 rounded-3xl bg-ink p-6 sm:p-10">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="max-w-xl">
          <p className="text-sm font-medium uppercase tracking-wide text-white/60">
            {kicker}
          </p>
          <h2 className="mt-1 text-2xl font-medium tracking-tight text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 text-base leading-relaxed text-white/80">
            {desc}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {primary.external ? (
            <a
              href={primary.href}
              target="_blank"
              rel="noreferrer"
              className="btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 py-4 text-lg font-medium text-[#075E54] sm:w-auto"
            >
              {primary.label}
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </a>
          ) : (
            <Link
              href={primary.href}
              className="btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue px-7 py-4 text-lg font-medium text-white sm:w-auto"
            >
              {primary.label}
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
          )}
          {secondary && (
            <Link
              href={secondary.href}
              className="btn inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-4 text-lg font-medium text-white sm:w-auto"
            >
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ServiceShell({
  current,
  label,
  color,
  title,
  intro,
  illustration,
  children,
}: {
  current: string;
  label: string;
  color: string;
  title: ReactNode;
  intro: string;
  illustration?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <LandingNavbar />
      <main id="main-content" className="flex-1 bg-white">
        <div className="wrap py-10 sm:py-16">
          {/* Breadcrumb */}
          <p className="text-base text-mute">
            <Link href="/" className="hover:text-blue">
              Beranda
            </Link>
            <span className="mx-2 text-line" aria-hidden="true">
              ›
            </span>
            <Link href="/layanan" className="hover:text-blue">
              Layanan
            </Link>
            <span className="mx-2 text-line" aria-hidden="true">
              ›
            </span>
            <span className="text-ink">{current}</span>
          </p>

          {/* Hero */}
          <div
            className={
              illustration
                ? "mt-6 grid items-center gap-10 lg:grid-cols-2 lg:gap-14"
                : undefined
            }
          >
            <div>
              <p
                className={`flex items-center gap-2 text-base font-medium text-mute ${
                  illustration ? "" : "mt-6"
                }`}
              >
                <i className={`h-3 w-3 rounded-full ${color}`} aria-hidden="true" />
                {label}
              </p>
              <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-mute sm:text-xl">
                {intro}
              </p>
            </div>
            {illustration && (
              <div className="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full">
                {illustration}
              </div>
            )}
          </div>

          <div className="mt-12 sm:mt-14">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
