"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/dashboard/auth-provider";
import { StatusBadge } from "@/components/dashboard/status-badge";
import {
  PageHeader,
  SectionLabel,
  StatCard,
} from "@/components/dashboard/ui";
import { DashboardIllustration } from "@/components/ilustrasi";
import {
  listProjects,
  type Project,
  deleteProject,
  PLATFORM_DOMAIN,
} from "@/lib/api";

const FAQ: { icon: string; q: string; a: string }[] = [
  {
    icon: "fa-solid fa-rocket",
    q: "Bisa deploy apa saja?",
    a: "Situs statis — HTML, CSS, dan JS hasil build dari framework apa pun (React, Vue, Next.js static export, Vite, dll). Upload berupa ZIP (index.html di root atau di dalam satu folder pembungkus, maks 100 MB) atau repository GitHub. Aplikasi dengan backend & database sendiri belum bisa — chat kami dulu untuk konsultasi.",
  },
  {
    icon: "fa-solid fa-bolt",
    q: "Bagaimana cara deploy otomatis?",
    a: "Untuk repository GitHub, build berjalan otomatis setiap push. Tambahkan webhook di Settings → Webhooks repo Anda — URL & secret ada di halaman project. Alternatifnya, tekan tombol “Deploy ulang” di halaman project.",
  },
  {
    icon: "fa-solid fa-shield-halved",
    q: "Apakah environment variables aman?",
    a: "Ya. Nilai env hanya tersimpan di server WebKalcer dan tidak pernah dikirim ke browser — yang tampil di dashboard hanya nama key-nya (mis. API_KEY), bukan nilainya. Env terisolasi per project: project lain (milik Anda atau orang lain) tidak bisa membacanya. Kosongkan value untuk menghapus key.",
  },
  {
    icon: "fa-solid fa-globe",
    q: "Bisa pakai domain sendiri?",
    a: "Bisa. Buka project → tab Domain, masukkan domain Anda (mis. contoh.com). DNS record & SSL/HTTPS diurus otomatis lewat Cloudflare. Tanpa domain sendiri, situs tetap online di <nama>.webkalcer.com.",
  },
  {
    icon: "fa-solid fa-rotate-left",
    q: "Build gagal, harus bagaimana?",
    a: "Buka project → tab Deployments untuk melihat log build terakhir. Perbaiki lalu deploy ulang, atau rollback ke salah satu dari 3 rilis sukses terakhir dengan satu klik.",
  },
  {
    icon: "fa-solid fa-file-zipper",
    q: "Cara update situs dari ZIP?",
    a: "Project dari ZIP langsung aktif (tanpa antrean build) dan tidak bisa redeploy — untuk update, upload ZIP terbaru sebagai project baru. Project dari GitHub bisa redeploy dan auto-deploy setiap push.",
  },
  {
    icon: "fa-solid fa-circle-question",
    q: "Apakah hosting ini gratis?",
    a: "Hosting situs statis di <nama>.webkalcer.com gratis untuk semua project Anda. Untuk custom domain, kebutuhan backend, atau fitur khusus lainnya — chat tim WebKalcer dulu, kami carikan solusi terbaiknya.",
  },
  {
    icon: "fa-solid fa-book",
    q: "Di mana dokumentasi lengkapnya?",
    a: "Ringkasannya sudah ada di section ini dan di setiap halaman project. Butuh pendampingan langkah-demi-langkah atau dokumentasi teknis lebih detail? Chat tim WebKalcer — kami bantu sampai situs Anda online.",
  },
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Redirect ke login jika sesi tidak ada
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    listProjects()
      .then((rows) => {
        if (!cancelled) {
          setProjects(rows);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus project ini?")) return;
    setDeleting(id);
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menghapus project.");
    } finally {
      setDeleting(null);
    }
  };

  const online = projects.filter((p) => p.status === "deployed").length;
  const totalViews = projects.reduce((sum, p) => sum + p.views, 0);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-40 animate-pulse rounded-[2rem] bg-soft" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-3xl border border-line bg-white"
            />
          ))}
        </div>
        <p className="text-sm text-mute">Memuat dashboard…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        current="Dashboard"
        label="Dashboard"
        title={`Halo, ${user?.username ?? "pengguna"}`}
        description={
          <>
            Kelola project website Anda di sini. Hosting statis gratis di{" "}
            <span className="font-mono text-sm text-ink sm:text-base">
              {PLATFORM_DOMAIN}
            </span>
            .
          </>
        }
        tone="blue"
        actions={
          <Link
            href="/dashboard/deploy"
            className="btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue px-7 py-3.5 text-center text-base font-medium text-white sm:w-auto sm:text-lg"
          >
            <i className="fa-solid fa-plus" aria-hidden="true" />
            Deploy project baru
          </Link>
        }
      />

      {/* ===== Ringkasan ===== */}
      <section aria-label="Ringkasan project">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard
            icon="fa-solid fa-layer-group"
            label="Total project"
            value={projects.length}
            hint="Semua project"
            tone="blue"
          />
          <StatCard
            icon="fa-solid fa-circle-check"
            label="Online"
            value={online}
            hint="Aktif"
            tone="red"
          />
          <StatCard
            icon="fa-solid fa-chart-line"
            label="Total kunjungan"
            value={totalViews.toLocaleString("id-ID")}
            tone="orange"
          />
          <StatCard
            icon="fa-solid fa-globe"
            label="Hosting statis"
            value="Gratis"
            hint={PLATFORM_DOMAIN}
            tone="ink"
          />
        </div>
      </section>

      {/* ===== Project ===== */}
      <section aria-labelledby="project-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionLabel tone="red">Project Anda</SectionLabel>
            <h2
              id="project-heading"
              className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Website yang Anda kelola
            </h2>
          </div>
          <span className="rounded-full border border-line bg-white px-4 py-1.5 text-sm text-mute">
            {projects.length} project
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="mt-6 overflow-hidden rounded-[2rem] border border-line bg-white">
            <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-2">
              <div>
                <SectionLabel tone="blue">Mulai dari sini</SectionLabel>
                <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  Belum ada project.
                </h3>
                <p className="mt-2 max-w-md text-base leading-relaxed text-mute sm:text-lg">
                  Deploy website statis pertama Anda dari repository GitHub atau
                  upload ZIP. Online di subdomain gratis dalam hitungan menit.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/dashboard/deploy"
                    className="btn inline-flex items-center justify-center gap-2 rounded-full bg-blue px-6 py-3 text-base font-medium text-white"
                  >
                    <i className="fa-solid fa-rocket" aria-hidden="true" />
                    Deploy project pertama
                  </Link>
                  <a
                    href="https://wa.me/6285805566344"
                    target="_blank"
                    rel="noreferrer"
                    className="btn inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3 text-base font-medium text-ink hover:bg-soft"
                  >
                    <i
                      className="fa-brands fa-whatsapp text-lg text-[#25D366]"
                      aria-hidden="true"
                    />
                    Tanya dulu
                  </a>
                </div>
              </div>
              <div className="mx-auto w-full max-w-md [&>svg]:block [&>svg]:h-auto [&>svg]:w-full">
                <DashboardIllustration />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => (
              <article
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-white transition-shadow hover:shadow-[0_10px_30px_rgba(32,33,36,0.08)]"
              >
                <div className="flex items-start justify-between gap-3 border-b border-line bg-soft/70 px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue/10 text-blue">
                      <i className="fa-solid fa-globe" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-mono text-base font-medium text-ink">
                        {p.subdomain}
                      </p>
                      <p className="truncate text-xs text-mute">
                        {p.custom_domain || `${p.subdomain}.${PLATFORM_DOMAIN}`}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="flex items-center gap-2 truncate text-sm text-mute">
                    <i
                      className={
                        p.repo_url.startsWith("zip://")
                          ? "fa-solid fa-file-zipper"
                          : "fa-brands fa-github"
                      }
                      aria-hidden="true"
                    />
                    {p.repo_url.startsWith("zip://")
                      ? "Upload ZIP"
                      : p.repo_url}
                  </p>

                  <dl className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-soft p-4">
                    <div>
                      <dt className="text-xs text-mute">Dibuat</dt>
                      <dd className="mt-0.5 text-sm font-medium text-ink">
                        {new Date(p.created_at).toLocaleDateString("id-ID")}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-mute">Kunjungan</dt>
                      <dd className="mt-0.5 text-sm font-medium text-ink">
                        {p.views.toLocaleString("id-ID")}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex gap-2 border-t border-line pt-4">
                    <Link
                      href={`/projects/${p.id}`}
                      className="btn flex-1 rounded-full bg-blue px-4 py-2.5 text-center text-sm font-medium text-white"
                    >
                      Detail
                    </Link>
                    <button
                      type="button"
                      disabled={deleting === p.id}
                      onClick={() => handleDelete(p.id)}
                      className="btn rounded-full border border-line px-4 py-2.5 text-sm font-medium text-red hover:bg-red/5 disabled:opacity-50"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ===== Bantuan & FAQ ===== */}
      <section id="faq" aria-labelledby="faq-heading">
        <div className="rounded-[2rem] bg-soft p-6 sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionLabel tone="blue">Bantuan</SectionLabel>
              <h2
                id="faq-heading"
                className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl"
              >
                Pertanyaan yang sering diajukan
              </h2>
              <p className="mt-2 max-w-xl text-base text-mute">
                Ringkasan cara deploy, domain, environment variables, dan
                hosting gratis di WebKalcer.
              </p>
            </div>
            <a
              href="https://wa.me/6285805566344"
              target="_blank"
              rel="noreferrer"
              className="btn inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-base font-medium text-white"
            >
              <i
                className="fa-brands fa-whatsapp text-xl text-[#25D366]"
                aria-hidden="true"
              />
              Chat tim WebKalcer
            </a>
          </div>
        </div>

        <div className="mt-5 columns-1 gap-4 md:columns-2">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group mb-4 break-inside-avoid overflow-hidden rounded-3xl border border-line bg-white open:border-blue/40 open:shadow-[0_8px_24px_rgba(32,33,36,0.06)]"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 transition-colors hover:bg-soft sm:px-5 [&::-webkit-details-marker]:hidden">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-soft text-blue">
                  <i className={item.icon} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 text-base font-medium text-ink">
                  {item.q}
                </span>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-soft text-sm text-mute transition-all duration-200 group-open:rotate-180 group-open:bg-blue/10 group-open:text-blue">
                  <i className="fa-solid fa-chevron-down" aria-hidden="true" />
                </span>
              </summary>
              <div className="border-t border-line px-5 py-4 text-base leading-relaxed text-mute">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
