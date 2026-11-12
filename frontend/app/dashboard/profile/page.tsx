"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/dashboard/auth-provider";
import { PageHeader, SectionLabel } from "@/components/dashboard/ui";
import { getGithubProfile, type GithubProfile } from "@/lib/api";

function initials(name: string | undefined) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line py-4 last:border-0">
      <span className="text-base text-mute">{label}</span>
      <span
        className={`break-all text-base text-ink ${mono ? "font-mono text-sm" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

const STAT_TONES = [
  "bg-blue/10 text-blue",
  "bg-red/10 text-red",
  "bg-orange/10 text-orange",
  "bg-ink/5 text-ink",
];

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [ghProfile, setGhProfile] = useState<GithubProfile | null>(null);
  const [ghState, setGhState] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );

  const isGithub = !!user?.github_id;

  useEffect(() => {
    if (loading || !isGithub) return;
    let cancelled = false;
    setGhState("loading");
    getGithubProfile()
      .then((p) => {
        if (cancelled) return;
        setGhProfile(p);
        setGhState("ok");
      })
      .catch(() => {
        if (!cancelled) setGhState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [loading, isGithub]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-40 animate-pulse rounded-[2rem] bg-soft" />
        <p className="text-sm text-mute">Memuat profil…</p>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="rounded-[2rem] border border-line bg-white p-8 text-center text-mute">
        Sesi tidak ditemukan. Muat ulang halaman atau login kembali.
      </div>
    );
  }

  const provider = isGithub ? "GitHub" : "Google";
  const stats = [
    { label: "Repository publik", value: ghProfile?.public_repos },
    { label: "Followers", value: ghProfile?.followers },
    { label: "Following", value: ghProfile?.following },
    { label: "Kontribusi tahun ini", value: ghProfile?.total_contributions },
  ];

  return (
    <div className="w-full">
      <PageHeader
        current="Profile"
        label="Akun"
        title="Profile"
        description="Informasi akun dan aktivitas Anda di WebKalcer."
        tone="blue"
        actions={
          <Link
            href="/dashboard/pengaturan"
            className="btn inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-base font-medium text-ink hover:bg-soft"
          >
            <i className="fa-solid fa-gear" aria-hidden="true" />
            Pengaturan akun
          </Link>
        }
      />

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
        {/* Kartu identitas */}
        <div className="relative overflow-hidden rounded-[2rem] bg-soft p-8 text-center">
          <span
            className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-blue/10"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-orange/10"
            aria-hidden="true"
          />
          <div className="relative">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt={user.username || user.email}
                className="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-white"
              />
            ) : (
              <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-white text-3xl font-medium text-ink ring-4 ring-white/70">
                {initials(user.username || user.email)}
              </span>
            )}
            <p className="mt-5 text-xl font-bold text-ink">
              {user.username || "pengguna"}
            </p>
            <p className="mt-1 break-all text-base text-mute">{user.email}</p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-1.5 text-sm font-medium text-ink">
              <i
                className={
                  isGithub ? "fa-brands fa-github" : "fa-brands fa-google"
                }
                aria-hidden="true"
              />
              Masuk dengan {provider}
            </span>
          </div>
        </div>

        {/* Detail akun + statistik GitHub */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="rounded-[2rem] border border-line bg-white p-6 sm:p-8">
            <SectionLabel tone="blue">Informasi akun</SectionLabel>
            <h2 className="mt-2 text-xl font-bold tracking-tight">
              Detail akun
            </h2>
            <div className="mt-3">
              <DetailRow label="User ID" value={user.id} mono />
              <DetailRow label="Provider" value={provider} />
              {isGithub && (
                <DetailRow label="GitHub ID" value={user.github_id} mono />
              )}
              {!isGithub && user.google_id && (
                <DetailRow label="Google ID" value={user.google_id} mono />
              )}
              <DetailRow label="Email" value={user.email || "-"} />
            </div>
          </div>

          {isGithub && (
            <div className="rounded-[2rem] border border-line bg-white p-6 sm:p-8">
              <SectionLabel tone="orange">Aktivitas GitHub</SectionLabel>
              <h2 className="mt-2 text-xl font-bold tracking-tight">
                Statistik GitHub
              </h2>

              {ghState === "loading" && (
                <p className="mt-4 text-base text-mute">Memuat statistik…</p>
              )}
              {ghState === "error" && (
                <p className="mt-4 rounded-2xl bg-soft p-4 text-base text-mute">
                  Statistik GitHub belum bisa dimuat. Pastikan backend berjalan
                  dan Anda masih login dengan akun GitHub.
                </p>
              )}
              {ghState === "ok" && ghProfile && (
                <>
                  {(ghProfile.name || ghProfile.bio) && (
                    <div className="mt-3">
                      {ghProfile.name && (
                        <p className="text-base font-medium text-ink">
                          {ghProfile.name}
                        </p>
                      )}
                      {ghProfile.bio && (
                        <p className="mt-1 text-base text-mute">
                          {ghProfile.bio}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {stats.map((s, i) => (
                      <div
                        key={s.label}
                        className="rounded-2xl border border-line p-4 text-center"
                      >
                        <span
                          className={`mx-auto grid h-9 w-9 place-items-center rounded-full ${
                            STAT_TONES[i % STAT_TONES.length]
                          }`}
                        >
                          <i
                            className={
                              [
                                "fa-solid fa-book",
                                "fa-solid fa-user-group",
                                "fa-solid fa-user-plus",
                                "fa-solid fa-code-commit",
                              ][i % 4]
                            }
                            aria-hidden="true"
                          />
                        </span>
                        <p className="mt-3 text-2xl font-medium text-ink">
                          {s.value ?? "—"}
                        </p>
                        <p className="mt-1 text-xs text-mute">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
