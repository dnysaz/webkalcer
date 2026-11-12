"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/dashboard/auth-provider";
import { EnvEditor } from "@/components/dashboard/env-editor";
import { PageHeader, SectionLabel } from "@/components/dashboard/ui";
import {
  ApiError,
  PLATFORM_DOMAIN,
  type GithubRepo,
  checkSubdomain,
  createProject,
  listGithubRepos,
  updateEnv,
  uploadProject,
} from "@/lib/api";

const SUBDOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

type Tab = "git" | "zip";

const TABS: { key: Tab; label: string; caption: string; icon: string }[] = [
  { key: "git", label: "GitHub", caption: "Paste link repo", icon: "fa-brands fa-github" },
  { key: "zip", label: "Upload ZIP", caption: "File .zip, maks 100 MB", icon: "fa-solid fa-file-zipper" },
];

const FLOW_STEPS = [
  { title: "Pilih sumber", desc: "GitHub atau ZIP" },
  { title: "Tentukan alamat", desc: "Subdomain gratis" },
  { title: "Deploy", desc: "Online dalam menit" },
];

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function DeployPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const isGithubUser = !!user?.github_id;

  const [tab, setTab] = useState<Tab>("git");
  const [tabTouched, setTabTouched] = useState(false);

  // git
  const [repoUrl, setRepoUrl] = useState("");
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [repoQuery, setRepoQuery] = useState("");
  const [reposPage, setReposPage] = useState(1);
  const [reposHasMore, setReposHasMore] = useState(false);
  const [reposLoadingMore, setReposLoadingMore] = useState(false);

  // zip
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  // bersama
  const [subdomain, setSubdomain] = useState("");
  const [subdomainState, setSubdomainState] = useState<
    "idle" | "checking" | "ok" | "taken" | "invalid"
  >("idle");
  const [subdomainMsg, setSubdomainMsg] = useState("");
  const [envRows, setEnvRows] = useState<{ key: string; value: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || tabTouched) return;
    setTab(isGithubUser ? "git" : "zip");
  }, [authLoading, isGithubUser, tabTouched]);

  useEffect(() => {
    if (!isGithubUser || tab !== "git") return;
    let cancelled = false;
    setReposLoading(true);
    listGithubRepos(1)
      .then((d) => {
        if (cancelled) return;
        setRepos(d.repos);
        setReposHasMore(d.hasMore);
        setReposPage(1);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReposLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isGithubUser, tab]);

  const loadMoreRepos = () => {
    const next = reposPage + 1;
    setReposLoadingMore(true);
    listGithubRepos(next)
      .then((d) => {
        setRepos((prev) => {
          const seen = new Set(prev.map((r) => r.full_name));
          return [...prev, ...d.repos.filter((r) => !seen.has(r.full_name))];
        });
        setReposHasMore(d.hasMore);
        setReposPage(next);
      })
      .catch(() => {})
      .finally(() => setReposLoadingMore(false));
  };

  useEffect(() => {
    if (!subdomain) {
      setSubdomainState("idle");
      setSubdomainMsg("");
      return;
    }
    // Aturan backend: 3–63 karakter, hanya a-z 0-9 -, tanpa - di ujung
    if (subdomain.length < 3 || !SUBDOMAIN_RE.test(subdomain)) {
      setSubdomainState("invalid");
      setSubdomainMsg(
        subdomain.length < 3
          ? "Minimal 3 karakter."
          : "3–63 karakter, hanya a-z, 0-9, dan tanda -, tanpa spasi.",
      );
      return;
    }
    setSubdomainState("checking");
    setSubdomainMsg("");
    const t = setTimeout(() => {
      let cancelled = false;
      checkSubdomain(subdomain)
        .then((r) => {
          if (cancelled) return;
          if (r.available) {
            setSubdomainState("ok");
            setSubdomainMsg("");
          } else {
            // Pesan dari server: nama dipakai / kata diblokir
            setSubdomainState("taken");
            setSubdomainMsg(r.error ?? "Nama sudah dipakai project lain.");
          }
        })
        .catch((e) => {
          if (cancelled) return;
          setSubdomainState("invalid");
          setSubdomainMsg(
            e instanceof ApiError
              ? e.message
              : "Gagal memeriksa ketersediaan nama.",
          );
        });
      return () => {
        cancelled = true;
      };
    }, 400);
    return () => clearTimeout(t);
  }, [subdomain]);

  const pickFile = (f: File | undefined | null) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".zip")) {
      setError("File harus berupa .zip");
      return;
    }
    if (f.size > 100 * 1024 * 1024) {
      setError("Ukuran ZIP maksimal 100 MB.");
      return;
    }
    setError("");
    setFile(f);
  };

  // API: repo_url harus http(s)://github.com/... (hanya GitHub, tanpa credential di URL)
  const repoUrlValid = /^https?:\/\/(www\.)?github\.com\/[^\s/]+\/[^\s/]+/i.test(
    repoUrl.trim(),
  );

  const canSubmit =
    !submitting &&
    subdomainState === "ok" &&
    (tab === "git" ? repoUrlValid : !!file);

  const submit = async () => {
    setError("");
    const env_vars: Record<string, string> = {};
    for (const { key, value } of envRows) {
      if (key.trim()) env_vars[key.trim()] = value;
    }
    setSubmitting(true);
    try {
      if (tab === "git") {
        await createProject({
          repo_url: repoUrl.trim(),
          subdomain,
          ...(Object.keys(env_vars).length ? { env_vars } : {}),
        });
      } else {
        const project = await uploadProject(subdomain, file as File);
        // API: /api/projects/upload tidak menerima env_vars —
        // simpan setelahnya lewat endpoint env (merge semantics)
        if (Object.keys(env_vars).length > 0) {
          try {
            await updateEnv(project.id, env_vars);
          } catch (envErr) {
            throw new Error(
              `Project berhasil dibuat, tetapi env gagal disimpan: ${
                envErr instanceof Error ? envErr.message : "kesalahan tidak dikenal"
              }. Anda bisa menambahkannya nanti di halaman project.`,
            );
          }
        }
      }
      router.push("/dashboard");
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 429
          ? "Terlalu banyak permintaan — coba lagi dalam 1 menit."
          : e instanceof Error
            ? e.message
            : "Terjadi kesalahan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const subdomainStatus = {
    checking: { icon: "fa-solid fa-spinner fa-spin", text: "Memeriksa…", cls: "text-mute" },
    ok: { icon: "fa-solid fa-circle-check", text: "Nama tersedia", cls: "text-blue" },
    taken: { icon: "fa-solid fa-circle-xmark", text: subdomainMsg || "Nama sudah dipakai project lain.", cls: "text-red" },
    invalid: { icon: "fa-solid fa-circle-xmark", text: subdomainMsg || "Nama tidak valid.", cls: "text-red" },
    idle: { icon: "fa-solid fa-circle-info", text: "3–63 karakter, hanya a-z, 0-9, dan -, tanpa - di ujung.", cls: "text-mute" },
  }[subdomainState];

  const envCount = envRows.filter((r) => r.key.trim()).length;
  const liveUrl = `https://${subdomain || "my-site"}.${PLATFORM_DOMAIN}`;
  const steps =
    tab === "git"
      ? [
          "Kode di-clone dari repo & di-build otomatis",
          "Situs aktif di subdomain pilihan Anda",
          "Pantau progres build & rollback di halaman project",
        ]
      : [
          "ZIP diekstrak & langsung disajikan — tanpa antrean build",
          "Situs aktif di subdomain pilihan Anda",
          "Update = upload ZIP baru sebagai project baru",
        ];
  const filteredRepos = repos.filter((r) =>
    r.full_name.toLowerCase().includes(repoQuery.trim().toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        current="Deploy"
        label="Deploy"
        title="Deploy project baru"
        description={
          <>
            Upload website Anda atau hubungkan repository GitHub — langsung
            online di subdomain{" "}
            <span className="font-mono text-sm text-ink sm:text-base">
              .{PLATFORM_DOMAIN}
            </span>
            .
          </>
        }
        tone="blue"
      >
        <ol className="mt-8 grid gap-3 sm:grid-cols-3">
          {FLOW_STEPS.map((step, i) => (
            <li
              key={step.title}
              className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue text-sm font-bold text-white">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{step.title}</p>
                <p className="text-xs text-mute">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </PageHeader>

      <div className="mt-6 grid gap-5 sm:mt-8 sm:gap-6 lg:grid-cols-5 lg:gap-10">
        {/* ===== Form ===== */}
        <div className="order-1 rounded-[2rem] border border-line bg-white p-5 sm:p-8 lg:col-span-3">
          <SectionLabel tone="blue">Sumber website</SectionLabel>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            Pilih metode deploy
          </h2>
          {/* Menu metode deploy: segmented control */}
          <div role="tablist" aria-label="Metode deploy" className="mt-5 grid grid-cols-2 gap-1.5 rounded-2xl bg-soft p-1.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => {
                  setTab(t.key);
                  setTabTouched(true);
                }}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 transition-all sm:flex-row sm:gap-3 sm:py-3.5 ${
                  tab === t.key
                    ? "bg-white text-blue shadow-sm"
                    : "text-mute hover:text-ink"
                }`}
              >
                <i className={`${t.icon} text-xl sm:text-2xl`} aria-hidden="true" />
                <span className="flex flex-col items-center leading-tight sm:items-start">
                  <span className="font-medium">{t.label}</span>
                  <span className="mt-0.5 hidden text-[11px] font-normal text-mute sm:block">
                    {t.caption}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* Panel: GitHub */}
          {tab === "git" && (
            <>
              {!isGithubUser && !authLoading && (
                <p className="mt-6 flex items-start gap-2 rounded-2xl bg-soft p-4 text-base text-mute">
                  <i className="fa-solid fa-circle-info mt-0.5" aria-hidden="true" />
                  Anda masuk dengan Google — tempel URL repository publik secara
                  manual, atau pakai tab Upload ZIP.
                </p>
              )}
              <label className="mt-8 block text-base font-medium">
                URL repository GitHub
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/user/repo"
                  aria-invalid={repoUrl.trim().length > 0 && !repoUrlValid}
                  className="mt-2.5 w-full rounded-2xl border border-line px-4 py-4 font-mono text-base outline-none focus:border-blue aria-[invalid=true]:border-red"
                />
                {repoUrl.trim().length > 0 && !repoUrlValid && (
                  <span className="mt-2 flex items-center gap-2 text-sm font-normal text-red">
                    <i className="fa-solid fa-circle-xmark" aria-hidden="true" />
                    URL harus diawali https://github.com/
                  </span>
                )}
              </label>

              {isGithubUser && (
                <div className="mt-5">
                  <div className="flex items-center gap-2 rounded-2xl border border-line px-4 py-2 focus-within:border-blue">
                    <i className="fa-solid fa-magnifying-glass text-mute" aria-hidden="true" />
                    <input
                      type="text"
                      value={repoQuery}
                      onChange={(e) => setRepoQuery(e.target.value)}
                      placeholder="Cari repository…"
                      className="w-full min-w-0 py-1 text-base outline-none"
                      aria-label="Cari repository"
                    />
                  </div>
                  {reposLoading ? (
                    <p className="mt-3 text-base text-mute">
                      <i className="fa-solid fa-spinner fa-spin mr-2" aria-hidden="true" />
                      Memuat daftar repository…
                    </p>
                  ) : filteredRepos.length > 0 ? (
                    <div className="mt-2 max-h-56 overflow-y-auto rounded-2xl border border-line">
                      {filteredRepos.map((r) => {
                        const selected = repoUrl === r.html_url;
                        return (
                          <button
                            key={r.full_name}
                            type="button"
                            onClick={() => setRepoUrl(r.html_url)}
                            className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-base transition-colors ${
                              selected ? "bg-blue/5" : "hover:bg-soft"
                            }`}
                          >
                            <span className="min-w-0 truncate font-mono text-sm">{r.full_name}</span>
                            <span className="flex shrink-0 items-center gap-2 text-xs text-mute">
                              {r.private && <i className="fa-solid fa-lock" aria-hidden="true" />}
                              {selected && <i className="fa-solid fa-circle-check text-blue" aria-hidden="true" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-3 text-base text-mute">Repository tidak ditemukan.</p>
                  )}
                  {reposHasMore && !reposLoading && (
                    <button
                      type="button"
                      onClick={loadMoreRepos}
                      disabled={reposLoadingMore}
                      className="mt-2 w-full rounded-2xl border border-line py-2.5 text-sm font-medium text-mute hover:text-ink disabled:opacity-60"
                    >
                      {reposLoadingMore ? "Memuat…" : "Muat lebih banyak repository"}
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Panel: Upload ZIP */}
          {tab === "zip" && (
            <div className="mt-8">
              {!file ? (
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    pickFile(e.dataTransfer.files?.[0]);
                  }}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                    dragging ? "border-blue bg-blue/5" : "border-line bg-soft hover:border-blue/50"
                  }`}
                >
                  <i className="fa-solid fa-file-zipper text-4xl text-mute" aria-hidden="true" />
                  <p className="mt-3 font-medium text-ink">
                    Klik untuk pilih file
                    <span className="hidden text-mute sm:inline"> atau seret ke sini</span>
                  </p>
                  <p className="mt-1 text-sm text-mute">Maks 100 MB, harus ada index.html</p>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) => pickFile(e.target.files?.[0])}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center gap-4 rounded-3xl border border-line bg-soft p-4">
                  <i className="fa-solid fa-file-zipper text-3xl text-blue" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm text-ink">{file.name}</p>
                    <p className="mt-0.5 text-sm text-mute">{formatSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    aria-label="Hapus file"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-mute hover:bg-line"
                  >
                    <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Subdomain */}
          <div className="mt-8 border-t border-line pt-8">
            <SectionLabel tone="orange">Alamat website</SectionLabel>
            <label className="mt-3 block text-base font-medium">
              Nama project / subdomain
              <div className="mt-2.5 flex items-center gap-2 rounded-2xl border border-line px-4 py-4 focus-within:border-blue">
                <i className="fa-solid fa-globe text-mute" aria-hidden="true" />
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) =>
                    setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  }
                  placeholder="my-site"
                  className="w-full min-w-0 font-mono text-lg outline-none"
                />
                <span className="shrink-0 font-mono text-xs text-mute sm:text-base">
                  .{PLATFORM_DOMAIN}
                </span>
              </div>
              <p className={`mt-2 flex items-center gap-2 text-sm ${subdomainStatus.cls}`}>
                <i className={subdomainStatus.icon} aria-hidden="true" />
                {subdomainStatus.text}
              </p>
            </label>
          </div>

          <EnvEditor rows={envRows} onChange={setEnvRows} />

          {error && (
            <p className="mt-6 flex items-start gap-2 rounded-2xl bg-red/10 p-4 text-base text-red">
              <i className="fa-solid fa-circle-exclamation mt-0.5" aria-hidden="true" />
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="btn mt-8 w-full rounded-full bg-blue py-4 text-lg font-medium text-white disabled:opacity-50"
          >
            {submitting
              ? "Memproses…"
              : tab === "git"
                ? "Deploy dari repository"
                : "Upload & deploy"}
          </button>
        </div>

        {/* ===== Ringkasan & pratinjau ===== */}
        <aside className="order-2 flex flex-col gap-5 sm:gap-6 lg:col-span-2">
          <div className="rounded-[2rem] border border-line bg-white p-5 sm:p-8">
            <SectionLabel tone="red">Ringkasan deploy</SectionLabel>
            <dl className="mt-4 divide-y divide-line text-sm sm:text-base">
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-mute">Metode</dt>
                <dd className="flex items-center gap-2 font-medium text-ink">
                  <i
                    className={tab === "git" ? "fa-brands fa-github" : "fa-solid fa-file-zipper"}
                    aria-hidden="true"
                  />
                  {tab === "git" ? "GitHub" : "Upload ZIP"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-mute">Sumber</dt>
                <dd className="max-w-[55%] truncate text-right font-mono text-sm text-ink">
                  {tab === "git"
                    ? repoUrl.trim() || "—"
                    : file?.name || "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-mute">Env vars</dt>
                <dd className="text-ink">{envCount} diisi</dd>
              </div>
            </dl>
          </div>

          {/* Pratinjau alamat (mock browser) */}
          <div className="rounded-[2rem] border border-line bg-white p-5 sm:p-8">
            <SectionLabel tone="blue">Pratinjau alamat</SectionLabel>
            <div className="mt-4 overflow-hidden rounded-2xl border border-line">
              <div className="flex items-center gap-2 border-b border-line bg-soft px-3 py-2.5 sm:px-4">
                <span className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red/80" />
                  <span className="h-3 w-3 rounded-full bg-orange/80" />
                  <span className="h-3 w-3 rounded-full bg-[#34A853]" />
                </span>
                <span className="ml-1 flex min-w-0 flex-1 items-center gap-1.5 truncate rounded-full bg-white px-3 py-1 font-mono text-xs text-mute">
                  <i className="fa-solid fa-lock text-[10px]" aria-hidden="true" />
                  {liveUrl}
                </span>
              </div>
              <div className="space-y-2.5 bg-white p-5">
                <div className="h-4 w-2/5 rounded bg-soft" />
                <div className="h-2.5 w-4/5 rounded bg-soft" />
                <div className="h-2.5 w-3/5 rounded bg-soft" />
                <div className="h-7 w-28 rounded-full bg-blue/15" />
              </div>
            </div>
            <p
              className={`mt-3 break-all font-mono text-xs ${
                subdomainState === "ok" ? "text-blue" : "text-mute"
              }`}
            >
              {liveUrl}
            </p>
          </div>

          {/* Cara kerja */}
          <div className="rounded-[2rem] border border-line bg-white p-5 sm:p-8">
            <SectionLabel tone="orange">Setelah deploy</SectionLabel>
            <ol className="mt-4 space-y-4">
              {steps.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-base text-ink">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-soft text-xs font-bold text-blue">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
