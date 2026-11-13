/* Client untuk API backend webkalcer.
   Acuan: /api.md di root repo. */

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
export const PLATFORM_DOMAIN =
  process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "webkalcer.com";

export type User = {
  id: string;
  github_id: string;
  google_id: string;
  username: string;
  email: string;
  avatar_url: string;
};

export type Project = {
  id: string;
  user_id: string;
  repo_url: string;
  subdomain: string;
  status: "pending" | "building" | "deployed" | "failed";
  custom_domain: string;
  env_keys: string[];
  created_at: string;
  updated_at: string;
  views: number;
  last_visited_at: string;
  visits?: { day: string; count: number }[];
};

export type Deployment = {
  id: string;
  project_id: string;
  status: "pending" | "building" | "success" | "failed";
  log: string;
  release: string;
  created_at: string;
  updated_at: string;
};

export type WebhookInfo = {
  url: string;
  secret: string;
  events: string[];
};

export type GithubRepo = {
  name: string;
  full_name: string;
  html_url: string;
  private: boolean;
};

export type RepoInfo = {
  full_name: string;
  description: string;
  html_url: string;
  private: boolean;
  language: string;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
  updated_at: string;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function api<T = unknown>(
  path: string,
  options: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const { json, headers, ...rest } = options;
  const isFormData = rest.body instanceof FormData;
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include", // WAJIB: cookie session_id
    cache: "no-store",
    headers: {
      ...(json !== undefined && !isFormData
        ? { "Content-Type": "application/json" }
        : {}),
      ...headers,
    },
    ...(json !== undefined && !isFormData ? { body: JSON.stringify(json) } : {}),
    ...rest,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(data?.error ?? `HTTP ${res.status}`, res.status);
  }
  return data as T;
}

/* ---------- Auth ---------- */

export function loginUrl(
  provider: "github" | "google",
  next = "/dashboard",
): string {
  return `${API_URL}/auth/${provider}/login?next=${encodeURIComponent(next)}`;
}

export type AuthProviders = {
  github: boolean;
  google: boolean;
};

/** Provider OAuth yang sudah punya kredensial di backend. */
export async function getAuthProviders(): Promise<AuthProviders> {
  return api<AuthProviders>("/auth/providers");
}

export async function getMe(): Promise<User | null> {
  try {
    const data = await api<{ user: User }>("/api/auth/me");
    return data.user;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await api("/api/auth/logout", { method: "POST" });
}

/* ---------- Pesanan publik ---------- */

export type OrderInput = {
  nama: string;
  kontak: string;
  bisnis?: string;
  pesan: string;
  paket: "landing-page" | "website-custom";
};

/**
 * Kirim formulir pesanan publik. Backend meneruskannya ke email tim lewat
 * Resend; API key tidak pernah menyentuh browser.
 */
export async function sendOrder(input: OrderInput): Promise<void> {
  await api("/api/orders", { method: "POST", json: input });
}

/* ---------- Projects ---------- */

export async function listProjects(): Promise<Project[]> {
  const data = await api<{ projects: Project[] | null }>("/api/projects");
  return data.projects ?? [];
}

export async function getProject(id: string): Promise<Project> {
  const data = await api<{ project: Project }>(`/api/projects/${id}`);
  return data.project;
}

export async function createProject(input: {
  repo_url: string;
  subdomain: string;
  env_vars?: Record<string, string>;
}): Promise<Project> {
  const data = await api<{ project: Project }>("/api/projects", {
    method: "POST",
    json: input,
  });
  return data.project;
}

export async function uploadProject(
  subdomain: string,
  file: File,
): Promise<Project> {
  const fd = new FormData();
  fd.append("subdomain", subdomain);
  fd.append("file", file);
  const data = await api<{ project: Project }>("/api/projects/upload", {
    method: "POST",
    body: fd,
  });
  return data.project;
}

export async function deleteProject(id: string): Promise<void> {
  await api(`/api/projects/${id}`, { method: "DELETE" });
}

export async function checkSubdomain(
  name: string,
): Promise<{ available: boolean; error?: string }> {
  return api(`/api/check-subdomain?name=${encodeURIComponent(name)}`);
}

/* ---------- Env ---------- */

export async function getEnvKeys(id: string): Promise<string[]> {
  const data = await api<{ env_keys: string[] | null }>(
    `/api/projects/${id}/env`,
  );
  return data.env_keys ?? [];
}

/** Merge semantics: value string kosong = hapus key; key tak dikirim = tetap. */
export async function updateEnv(
  id: string,
  env_vars: Record<string, string>,
): Promise<string[]> {
  const data = await api<{ env_keys: string[] | null }>(
    `/api/projects/${id}/env`,
    {
      method: "POST",
      json: { env_vars },
    },
  );
  return data.env_keys ?? [];
}

/* ---------- Deploy & deployments ---------- */

export async function redeploy(id: string): Promise<void> {
  await api(`/api/projects/${id}/deploy`, { method: "POST" });
}

export async function listDeployments(id: string): Promise<Deployment[]> {
  const data = await api<{ deployments: Deployment[] | null }>(
    `/api/projects/${id}/deployments`,
  );
  return data.deployments ?? [];
}

export async function rollback(
  id: string,
  deploymentId: string,
): Promise<void> {
  await api(`/api/projects/${id}/deployments/${deploymentId}/rollback`, {
    method: "POST",
  });
}

export async function clearDeployments(id: string): Promise<void> {
  await api(`/api/projects/${id}/deployments`, { method: "DELETE" });
}

/* ---------- Domain & webhook ---------- */

export async function setCustomDomain(
  id: string,
  domain: string,
): Promise<{ custom_domain: string; warning?: string }> {
  return api(`/api/projects/${id}/domain`, {
    method: "PUT",
    json: { domain },
  });
}

export async function getWebhook(id: string): Promise<WebhookInfo> {
  const data = await api<{ webhook: WebhookInfo }>(`/api/projects/${id}/webhook`);
  return data.webhook;
}

/* ---------- GitHub ---------- */

export async function listGithubRepos(
  page = 1,
  perPage = 100,
): Promise<{ repos: GithubRepo[]; hasMore: boolean }> {
  const data = await api<{
    repos: GithubRepo[] | null;
    page: number;
    has_more: boolean;
  }>(
    `/api/github/repos?page=${page}&per_page=${perPage}`,
  );
  return { repos: data.repos ?? [], hasMore: data.has_more };
}

export async function getRepoInfo(id: string): Promise<RepoInfo> {
  const data = await api<{ repo: RepoInfo }>(`/api/projects/${id}/repo`);
  return data.repo;
}

export type GithubProfile = {
  login: string;
  name: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  total_contributions?: number;
};

/** Statistik profil GitHub untuk halaman Profile (khusus user GitHub). */
export async function getGithubProfile(): Promise<GithubProfile> {
  const data = await api<{ profile: GithubProfile }>("/api/github/profile");
  return data.profile;
}

/* ---------- Helper ---------- */

/** URL publik project. Backend tidak mengisi deploy_url → dibentuk di sini. */
export function projectPublicUrl(project: Project): string {
  if (project.custom_domain) {
    return `https://${project.custom_domain}`;
  }
  const isLocal =
    API_URL.includes("localhost") || API_URL.includes("127.0.0.1");
  const scheme = isLocal ? "http" : "https";
  return `${scheme}://${project.subdomain}.${PLATFORM_DOMAIN}`;
}
