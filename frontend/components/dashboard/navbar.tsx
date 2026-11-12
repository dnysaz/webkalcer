"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/dashboard/auth-provider";

const MENU = [
  { href: "/dashboard", label: "Dashboard", icon: "fa-solid fa-gauge-high" },
  { href: "/dashboard/profile", label: "Profile", icon: "fa-regular fa-user" },
  { href: "/dashboard/pengaturan", label: "Pengaturan", icon: "fa-solid fa-gear" },
];

function Initials(name: string | undefined) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}

export default function DashboardNavbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();

  // Tutup panel mobile saat pindah halaman
  useEffect(() => {
    setNavOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href ||
    (href === "/dashboard" && pathname.startsWith("/projects"));

  // Hanya satu panel yang boleh terbuka: dropdown avatar (desktop)
  // atau panel hamburger (mobile).
  const toggleMenu = () => {
    setMenuOpen((v) => !v);
    setNavOpen(false);
  };

  const toggleNav = () => {
    setNavOpen((v) => !v);
    setMenuOpen(false);
  };

  const menuLink = (href: string) =>
    isActive(href)
      ? "rounded-full bg-soft px-4 py-2 font-medium text-ink"
      : "rounded-full px-4 py-2 text-mute transition-colors hover:bg-soft/70 hover:text-ink";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="wrap flex h-16 items-center justify-between gap-2 sm:h-20">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="WebKalcer — ke beranda"
          onClick={() => setNavOpen(false)}
        >
          <span className="text-2xl font-medium tracking-tight">
            <span className="text-blue">Web</span>
            <span className="text-red">Kal</span>
            <span className="text-orange">cer</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-base md:flex">
          {MENU.map((item) => (
            <Link key={item.href} href={item.href} className={menuLink(item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="hidden items-center gap-2 md:flex sm:gap-3">
              <div className="hidden flex-col items-end text-base md:flex">
                <span className="font-medium text-ink">
                  {user.username || user.email}
                </span>
                <span className="text-sm text-mute">
                  {user.github_id ? "GitHub" : user.google_id ? "Google" : ""}
                </span>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleMenu}
                  aria-label="Profil"
                  aria-expanded={menuOpen}
                  className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-soft text-lg text-ink hover:bg-line"
                >
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar_url}
                      alt="avatar"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    Initials(user.username || user.email)
                  )}
                </button>
                {menuOpen && (
                  <>
                    <button
                      type="button"
                      aria-hidden="true"
                      tabIndex={-1}
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-3xl border border-line bg-white shadow-xl">
                      <div className="border-b border-line bg-soft/60 p-4">
                        <p className="text-base font-medium text-ink">
                          {user.username || user.email}
                        </p>
                        <p className="break-all text-xs text-mute">{user.email}</p>
                      </div>
                      <div className="p-2">
                        {MENU.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-base text-ink transition-colors hover:bg-soft"
                          >
                            <i
                              className={`${item.icon} w-5 text-center text-mute`}
                              aria-hidden="true"
                            />
                            {item.label}
                          </Link>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            logout();
                          }}
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-base text-red transition-colors hover:bg-red/10"
                        >
                          <i
                            className="fa-solid fa-arrow-right-from-bracket w-5 text-center"
                            aria-hidden="true"
                          />
                          Keluar
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="btn rounded-full bg-blue px-5 py-2.5 text-sm font-medium text-white sm:text-base"
            >
              Masuk
            </Link>
          )}

          <button
            type="button"
            onClick={toggleNav}
            aria-label={navOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={navOpen}
            className="grid h-11 w-11 place-items-center rounded-full text-xl text-ink hover:bg-soft md:hidden"
          >
            <i
              className={navOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Panel menu mobile — satu-satunya menu di layar kecil */}
      {navOpen && (
        <div className="border-t border-line bg-white md:hidden">
          <nav className="wrap flex flex-col py-3">
            {user && (
              <div className="mb-2 flex items-center gap-3 rounded-2xl bg-soft p-4">
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar_url}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-base font-medium text-ink">
                    {Initials(user.username || user.email)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-base font-medium text-ink">
                    {user.username || user.email}
                  </p>
                  <p className="truncate text-xs text-mute">{user.email}</p>
                </div>
              </div>
            )}
            {MENU.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setNavOpen(false)}
                  className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 text-lg transition-colors hover:bg-soft ${
                    active ? "bg-soft font-medium text-ink" : "text-ink"
                  }`}
                >
                  <i
                    className={`${item.icon} w-6 text-center ${
                      active ? "text-blue" : "text-mute"
                    }`}
                    aria-hidden="true"
                  />
                  {item.label}
                </Link>
              );
            })}
            {user && (
              <button
                type="button"
                onClick={() => {
                  setNavOpen(false);
                  logout();
                }}
                className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-left text-lg text-red transition-colors hover:bg-red/5"
              >
                <i
                  className="fa-solid fa-arrow-right-from-bracket w-6 text-center"
                  aria-hidden="true"
                />
                Keluar
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
