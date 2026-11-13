"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/dashboard/auth-provider";
import { ConfirmDialog, InfoDialog, type ModalTone } from "@/components/dashboard/confirm";
import { CopyButton } from "@/components/dashboard/copy-button";

export const dynamic = "force-dynamic";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PageHeader, SectionLabel } from "@/components/dashboard/ui";
import {
  ApiError,
  type Project,
  type Deployment,
  type WebhookInfo,
  getProject,
  listDeployments,
  redeploy,
  rollback,
  clearDeployments,
  getEnvKeys,
  updateEnv,
  setCustomDomain,
  getWebhook,
  deleteProject,
  projectPublicUrl,
} from "@/lib/api";

function formatDate(iso: string | undefined) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const TABS = [
  { key: "ringkasan", label: "Ringkasan", icon: "fa-solid fa-circle-info" },
  { key: "deployments", label: "Deployments", icon: "fa-solid fa-rocket" },
  { key: "env", label: "Environment", icon: "fa-solid fa-key" },
  { key: "domain", label: "Domain & webhook", icon: "fa-solid fa-globe" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [deployLoading, setDeployLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [envKeys, setEnvKeys] = useState<string[]>([]);
  const [envLoading, setEnvLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>("ringkasan");
  const [newEnvKey, setNewEnvKey] = useState("");
  const [newEnvValue, setNewEnvValue] = useState("");
  const [domain, setDomain] = useState("");
  const [domainLoading, setDomainLoading] = useState(false);
  const [webhook, setWebhook] = useState<WebhookInfo | null>(null);
  const [confirmState, setConfirmState] = useState<{
    tone: ModalTone;
    title: string;
    message: string;
    confirmLabel: string;
    action: () => Promise<void>;
  } | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [notice, setNotice] = useState<{
    title: string;
    message: string;
    tone: ModalTone;
  } | null>(null);

  const showError = (title: string, e: unknown, fallback: string) =>
    setNotice({
      title,
      message: e instanceof Error ? e.message : fallback,
      tone: "danger",
    });

  const runConfirmed = async () => {
    if (!confirmState) return;
    setConfirmBusy(true);
    try {
      await confirmState.action();
      setConfirmState(null);
    } finally {
      setConfirmBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, [params.id]);

  const load = async () => {
    try {
      setLoading(true);
      const [p, ds, keys, wh] = await Promise.all([
        getProject(params.id!),
        listDeployments(params.id!),
        getEnvKeys(params.id!),
        getWebhook(params.id!).catch(() => null),
      ]);
      setProject(p);
      setDeployments(ds);
      setEnvKeys(keys);
      setWebhook(wh);
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 401
          ? "Sesi login sudah berakhir. Silakan masuk kembali."
          : e instanceof Error
            ? e.message
            : "Gagal memuat detail project.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto-poll saat ada deployment yang masih building
  useEffect(() => {
    if (!polling) return;
    const t = setInterval(async () => {
      try {
        const ds = await listDeployments(params.id!);
        setDeployments(ds);
        const latest = ds[0];
        if (latest && (latest.status === "building" || latest.status === "pending")) {
          return; // keep polling
        }
        setPolling(false);
        // refresh project status
        const p = await getProject(params.id!);
        setProject(p);
      } catch {
        // silent
      }
    }, 3000);
    return () => clearInterval(t);
  }, [polling, params.id]);

  const handleDeploy = async () => {
    setDeployLoading(true);
    try {
      await redeploy(params.id!);
      setDeployments([]);
      setPolling(true);
      setTab("deployments");
      const p = await getProject(params.id!);
      setProject(p);
    } catch (e) {
      showError("Gagal memulai redeploy", e, "Redeploy tidak dapat dimulai. Coba lagi.");
    } finally {
      setDeployLoading(false);
    }
  };

  const requestRollback = (deploymentId: string, release: string) =>
    setConfirmState({
      tone: "warning",
      title: "Rollback ke rilis lama",
      message: `Rollback ke rilis "${release}"? Situs akan kembali ke versi ini.`,
      confirmLabel: "Rollback",
      action: async () => {
        try {
          await rollback(params.id!, deploymentId);
          const p = await getProject(params.id!);
          setProject(p);
          const ds = await listDeployments(params.id!);
          setDeployments(ds);
        } catch (e) {
          showError("Gagal rollback", e, "Rollback tidak dapat dilakukan. Coba lagi.");
        }
      },
    });

  const requestClear = () =>
    setConfirmState({
      tone: "danger",
      title: "Hapus riwayat deployment",
      message: "Hapus semua riwayat deployment? Tindakan ini tidak dapat diurungkan.",
      confirmLabel: "Hapus riwayat",
      action: async () => {
        try {
          await clearDeployments(params.id!);
          setDeployments([]);
        } catch (e) {
          showError(
            "Gagal membersihkan riwayat",
            e,
            "Riwayat deployment tidak dapat dihapus. Coba lagi.",
          );
        }
      },
    });

  const handleSaveEnv = async (envVars: Record<string, string>) => {
    setEnvLoading(true);
    try {
      const keys = await updateEnv(params.id!, envVars);
      setEnvKeys(keys);
      setTab("env");
    } catch (e) {
      showError("Gagal menyimpan env", e, "Environment variables tidak dapat disimpan. Coba lagi.");
    } finally {
      setEnvLoading(false);
    }
  };

  const handleSetDomain = async (value: string) => {
    setDomainLoading(true);
    try {
      const res = await setCustomDomain(params.id!, value);
      setProject((p) => (p ? { ...p, custom_domain: res.custom_domain } : p));
      setDomain(value);
    } catch (e) {
      showError("Gagal mengatur domain", e, "Domain tidak dapat disimpan. Coba lagi.");
    } finally {
      setDomainLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-40 animate-pulse rounded-[2rem] bg-soft" />
        <div className="grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-[2rem] border border-line bg-white"
            />
          ))}
        </div>
        <p className="text-sm text-mute">Memuat detail project…</p>
      </div>
    );
  }
  if (error || !project) {
    return (
      <div className="rounded-[2rem] border border-red/30 bg-red/5 p-8 text-center sm:p-12">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red/10 text-2xl text-red">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-red">
          {error || "Project tidak ditemukan."}
        </h1>
        <p className="mt-2 text-mute">
          Muat ulang halaman, atau kembali ke daftar project.
        </p>
        <Link
          href="/dashboard"
          className="btn mt-6 inline-flex items-center gap-2 rounded-full bg-blue px-6 py-3 text-base font-medium text-white"
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          Kembali ke dashboard
        </Link>
      </div>
    );
  }

  const isBuilding = deployments.some(
    (d) => d.status === "building" || d.status === "pending",
  );
  const publicUrl = projectPublicUrl(project);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        current={project.subdomain}
        label="Project"
        title={project.subdomain}
        description={
          project.repo_url.startsWith("zip://")
            ? "Project dari ZIP upload"
            : project.repo_url
        }
        tone="blue"
        actions={
          <>
            <StatusBadge status={project.status} />
            <button
              type="button"
              disabled={project.status === "building" || deployLoading}
              onClick={() => setTab("deployments")}
              className="btn rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink hover:bg-soft disabled:opacity-60"
            >
              {project.status === "building" ? "Sedang build…" : "Redeploy"}
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn inline-flex items-center gap-2 rounded-full bg-blue px-6 py-2.5 text-sm font-medium text-white"
            >
              Buka situs
              <i className="fa-solid fa-arrow-up-right-from-square text-xs" aria-hidden="true" />
            </a>
          </>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto whitespace-nowrap rounded-full border border-line bg-soft p-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-white text-ink shadow-sm"
                : "text-mute hover:text-ink"
            }`}
          >
            <i
              className={`${t.icon} text-xs ${
                tab === t.key ? "text-blue" : ""
              }`}
              aria-hidden="true"
            />
            {t.label}
          </button>
        ))}
      </div>

      {/* Ringkasan */}
      {tab === "ringkasan" && (
        <>
          <section className="grid gap-5 md:grid-cols-3">
            <div className="rounded-[2rem] border border-line bg-white p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue/10 text-blue">
                  <i className="fa-solid fa-globe" aria-hidden="true" />
                </span>
                <p className="text-sm text-mute">URL publik</p>
              </div>
              <p className="mt-4 break-all font-mono text-sm text-ink sm:text-base">
                {publicUrl}
              </p>
            </div>
            <div className="rounded-[2rem] border border-line bg-white p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-red/10 text-red">
                  <i className="fa-solid fa-signal" aria-hidden="true" />
                </span>
                <p className="text-sm text-mute">Status</p>
              </div>
              <StatusBadge status={project.status} className="mt-4" />
              <p className="mt-2 text-sm text-mute">
                {isBuilding
                  ? "Build sedang berjalan…"
                  : "Situs aktif dan bisa dibuka."}
              </p>
            </div>
            <div className="rounded-[2rem] border border-line bg-white p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange/10 text-orange">
                  <i className="fa-solid fa-chart-line" aria-hidden="true" />
                </span>
                <p className="text-sm text-mute">Kunjungan total</p>
              </div>
              <p className="mt-3 text-4xl font-medium tracking-tight text-ink">
                {project.views.toLocaleString("id-ID")}
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-line bg-white p-6 sm:p-8">
            <SectionLabel tone="orange">Info project</SectionLabel>
            <h2 className="mt-2 text-xl font-bold tracking-tight">
              Detail singkat
            </h2>
            <dl className="mt-4 grid gap-x-10 sm:grid-cols-2">
              <div className="border-b border-line py-3">
                <dt className="text-sm text-mute">Sumber</dt>
                <dd className="mt-1 break-all font-mono text-sm text-ink">
                  {project.repo_url.startsWith("zip://")
                    ? "Upload ZIP"
                    : project.repo_url}
                </dd>
              </div>
              <div className="border-b border-line py-3">
                <dt className="text-sm text-mute">Dibuat</dt>
                <dd className="mt-1 text-base text-ink">
                  {formatDate(project.created_at)}
                </dd>
              </div>
              <div className="border-b border-line py-3">
                <dt className="text-sm text-mute">Custom domain</dt>
                <dd className="mt-1 text-base text-ink">
                  {project.custom_domain || "Belum ada"}
                </dd>
              </div>
              <div className="border-b border-line py-3">
                <dt className="text-sm text-mute">Webhook GitHub</dt>
                <dd className="mt-1 text-base text-ink">
                  {webhook ? "Aktif" : "Tidak tersedia"}
                </dd>
              </div>
            </dl>
          </section>
        </>
      )}

      {/* Deployments */}
      {tab === "deployments" && (
        <section className="rounded-[2rem] border border-line bg-white p-6 sm:p-8">
          <SectionLabel tone="blue">Deployments</SectionLabel>
          <div className="mt-2 mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold tracking-tight">
              Riwayat deployment
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={deployLoading || isBuilding}
                onClick={handleDeploy}
                className="btn rounded-full border border-line px-4 py-2 text-sm font-medium text-ink disabled:opacity-60 hover:bg-soft"
              >
                {deployLoading ? "Memulai…" : "Redeploy sekarang"}
              </button>
              {deployments.length > 0 && (
                <button
                  type="button"
                  onClick={requestClear}
                  className="btn rounded-full px-4 py-2 text-sm font-medium text-red hover:bg-red/5"
                >
                  Bersihkan riwayat
                </button>
              )}
            </div>
          </div>

          {isBuilding && (
            <div className="mb-4 rounded-2xl bg-orange/10 p-4 text-base text-ink">
              Build sedang berjalan… halaman akan diperbarui otomatis setiap 3 detik.
            </div>
          )}

          {deployments.length === 0 ? (
            <p className="text-base text-mute">Belum ada riwayat deployment.</p>
          ) : (
            <div className="space-y-3">
              {deployments.map((d) => (
                <div
                  key={d.id}
                  className="rounded-2xl border border-line p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="break-all font-mono text-sm">{d.release || "-"}</span>
                        <StatusBadge status={d.status as any} className="text-xs" />
                      </div>
                      <p className="text-sm text-mute">{formatDate(d.created_at)}</p>
                    </div>
                    {d.status === "success" && d.release && (
                      <button
                        type="button"
                        onClick={() => requestRollback(d.id, d.release)}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-soft text-mute hover:bg-line"
                        title="Rollback"
                        aria-label="Rollback ke rilis ini"
                      >
                        <i className="fa-solid fa-rotate-left" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <details className="mt-3 rounded-2xl bg-soft p-3 text-xs font-mono text-mute">
                    <summary className="cursor-pointer underline offset-2">Tampilkan log</summary>
                    <pre className="mt-2 whitespace-pre-wrap break-words">{d.log}</pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Environment variables */}
      {tab === "env" && (
        <section className="rounded-[2rem] border border-line bg-white p-6 sm:p-8">
          <SectionLabel tone="orange">Environment</SectionLabel>
          <div className="mt-2 flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold tracking-tight">
              Environment variables
            </h2>
            <button
              type="button"
              onClick={() => setTab("ringkasan")}
              className="btn shrink-0 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-soft"
            >
              Selesai
            </button>
          </div>
          <p className="mb-4 text-base text-mute">
            Hanya nama kunci yang ditampilkan. Nilai disimpan terenkripsi di
            backend dan tidak pernah dikirim ke browser. Mengubah env tidak
            otomatis redeploy — gunakan tombol Redeploy setelahnya.
          </p>
          <div className="space-y-2">
            {envKeys.length === 0 ? (
              <p className="text-base text-mute">Belum ada environment variable.</p>
            ) : (
              envKeys.map((key) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl bg-soft p-3"
                >
                  <span className="font-mono text-base">{key}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEnvLoading(true);
                      updateEnv(params.id!, { [key]: "" }).then((ks) => {
                        setEnvKeys(ks);
                        setEnvLoading(false);
                      });
                    }}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm text-red hover:bg-red/10"
                    title="Hapus"
                    aria-label={`Hapus ${key}`}
                  >
                    <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 rounded-xl border border-line p-4">
            <p className="text-sm font-medium mb-2">Tambah / ubah kunci</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={newEnvKey}
                placeholder="KEY"
                onChange={(e) => setNewEnvKey(e.target.value.toUpperCase())}
                className="w-full min-w-0 flex-1 rounded-xl border border-line px-3 py-2 font-mono text-base outline-none focus:border-blue"
              />
              <input
                type="text"
                value={newEnvValue}
                placeholder="nilai"
                onChange={(e) => setNewEnvValue(e.target.value)}
                className="w-full min-w-0 flex-1 rounded-xl border border-line px-3 py-2 font-mono text-base outline-none focus:border-blue"
              />
              <button
                type="button"
                disabled={
                  envLoading ||
                  !newEnvKey ||
                  !/^[A-Za-z_][A-Za-z0-9_]*$/.test(newEnvKey)
                }
                onClick={() => {
                  setEnvLoading(true);
                  updateEnv(params.id!, { [newEnvKey]: newEnvValue })
                    .then((ks) => {
                      setEnvKeys(ks);
                      setNewEnvKey("");
                      setNewEnvValue("");
                    })
                    .catch(() => {})
                    .finally(() => setEnvLoading(false));
                }}
                className="btn rounded-full bg-blue px-6 py-2 text-sm font-medium text-white disabled:opacity-60 sm:w-auto w-full"
              >
                Simpan
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Domain & webhook */}
      {tab === "domain" && (
        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[2rem] border border-line bg-white p-6 sm:p-8">
            <SectionLabel tone="blue">Domain</SectionLabel>
            <h2 className="mt-2 text-xl font-bold tracking-tight mb-3">
              Custom domain
            </h2>
            <p className="mb-4 text-sm text-mute">
              Pasang domain milik Anda sendiri (contoh: tokoanda.com). SSL
              diatur otomatis melalui Cloudflare.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value.replace(/^https?:\/\//i, ""))}
                placeholder="contoh.com"
                className="w-full min-w-0 flex-1 rounded-xl border border-line px-4 py-3 font-mono text-base outline-none focus:border-blue"
              />
              <button
                type="button"
                disabled={domainLoading || !domain}
                onClick={() => handleSetDomain(domain)}
                className="btn w-full rounded-full bg-blue px-5 py-3 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
              >
                {domainLoading ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
            <p className="mt-3 text-xs text-mute">
              Kosongkan dan simpan untuk menghapus custom domain.
            </p>
          </div>

          <div className="rounded-[2rem] border border-line bg-white p-6 sm:p-8">
            <SectionLabel tone="red">Webhook</SectionLabel>
            <h2 className="mt-2 text-xl font-bold tracking-tight mb-3">
              Webhook GitHub
            </h2>
            <p className="mb-4 text-sm text-mute">
              Salin URL dan secret ini ke Settings → Webhooks di repository
              GitHub Anda. Setiap push ke default branch akan memicu redeploy
              otomatis.
            </p>
            {webhook ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-soft p-3">
                  <p className="text-sm font-medium text-mute">URL</p>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={webhook.url}
                      readOnly
                      className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2 font-mono text-xs text-ink outline-none"
                    />
                    <CopyButton text={webhook.url} label="Salin URL webhook" />
                  </div>
                </div>
                <div className="rounded-xl bg-soft p-3">
                  <p className="text-sm font-medium text-mute">Secret</p>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={webhook.secret}
                      readOnly
                      className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2 font-mono text-xs text-ink outline-none"
                    />
                    <CopyButton text={webhook.secret} label="Salin secret webhook" />
                  </div>
                </div>
                <p className="text-xs text-mute">
                  Event yang dipantau: {webhook.events.join(", ")}.
                </p>
              </div>
            ) : (
              <p className="text-base text-mute">Webhook tidak tersedia untuk project ini.</p>
            )}
          </div>
        </section>
      )}

      <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
        <Link
          href="/dashboard"
          className="text-base font-medium text-ink hover:underline"
        >
          ← Kembali ke daftar project
        </Link>
        <button
          type="button"
          onClick={() =>
            setConfirmState({
              tone: "danger",
              title: "Hapus project",
              message:
                "Yakin ingin menghapus project ini? Tindakan ini tidak dapat diurungkan.",
              confirmLabel: "Hapus project",
              action: async () => {
                try {
                  await deleteProject(params.id!);
                  router.push("/dashboard");
                } catch (e) {
                  showError(
                    "Gagal menghapus project",
                    e,
                    "Project tidak dapat dihapus. Coba lagi.",
                  );
                }
              },
            })
          }
          className="btn text-base font-medium text-red hover:bg-red/5"
        >
          Hapus project
        </button>
      </div>
      <ConfirmDialog
        open={confirmState !== null}
        tone={confirmState?.tone ?? "danger"}
        title={confirmState?.title ?? "Konfirmasi"}
        message={confirmState?.message ?? ""}
        confirmLabel={confirmState?.confirmLabel}
        busy={confirmBusy}
        onConfirm={runConfirmed}
        onCancel={() => setConfirmState(null)}
      />
      <InfoDialog
        open={notice !== null}
        tone={notice?.tone ?? "info"}
        title={notice?.title ?? "Pemberitahuan"}
        message={notice?.message ?? ""}
        onClose={() => setNotice(null)}
      />
    </div>
  );
}