"use client";

import Link from "next/link";
import { useState } from "react";
import SiteLogo from "@/components/site-logo";

const NAV_LINKS = [
  { href: "/layanan", label: "Layanan" },
  { href: "/#contoh", label: "Contoh" },
  { href: "/#harga", label: "Harga" },
  { href: "/#proses", label: "Proses" },
  { href: "/#hosting", label: "Hosting Gratis" },
  { href: "/kontak", label: "Kontak" },
];

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="wrap flex h-16 items-center justify-between gap-4 sm:h-20">
        <Link href="/" aria-label="WebKalcer" onClick={() => setOpen(false)}>
          <SiteLogo height={27} mobileHeight={22} />
        </Link>
        <nav className="hidden items-center gap-9 text-base text-mute lg:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="btn rounded-full bg-blue px-5 py-2 text-base font-medium text-white sm:px-6 sm:py-2.5"
          >
            Masuk
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            className="grid h-11 w-11 place-items-center rounded-full text-xl text-ink hover:bg-soft lg:hidden"
          >
            <i
              className={open ? "fa-solid fa-xmark" : "fa-solid fa-bars"}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Panel menu mobile */}
      {open && (
        <div className="border-t border-line bg-white lg:hidden">
          <nav className="wrap flex flex-col py-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3.5 text-lg text-ink transition-colors hover:bg-soft"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
