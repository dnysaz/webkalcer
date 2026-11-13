"use client";

import Link from "next/link";
import { useAuth } from "@/components/dashboard/auth-provider";
import { PageHeader, SectionLabel } from "@/components/dashboard/ui";
import BrandIcon from "@/components/brand-icon";

function CardHeading({
  icon,
  tone,
  label,
  title,
}: {
  icon: string;
  tone: "blue" | "red" | "orange";
  label: string;
  title: string;
}) {
  const tint = {
    blue: "bg-blue/10 text-blue",
    red: "bg-red/10 text-red",
    orange: "bg-orange/10 text-orange",
  }[tone];

  return (
    <div className="flex items-center gap-3">
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${tint}`}
      >
        <i className={`${icon} text-lg`} aria-hidden="true" />
      </span>
      <div>
        <SectionLabel tone={tone}>{label}</SectionLabel>
        <h2 className="text-xl font-bold tracking-tight text-ink">{title}</h2>
      </div>
    </div>
  );
}

export default function PengaturanPage() {
  const { user, logout } = useAuth();

  const isGithub = !!user?.github_id;
  const provider = isGithub ? "GitHub" : "Google";

  return (
    <div className="w-full">
      <PageHeader
        current="Pengaturan"
        label="Akun"
        title="Pengaturan"
        description="Kelola sesi dan informasi akun Anda."
        tone="orange"
        actions={
          <Link
            href="/dashboard/profile"
            className="btn inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-base font-medium text-ink hover:bg-soft"
          >
            <i className="fa-regular fa-user" aria-hidden="true" />
            Lihat profile
          </Link>
        }
      />

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        {/* Akun */}
        <section className="rounded-[2rem] border border-line bg-white p-6 sm:p-8">
          <CardHeading
            icon="fa-solid fa-id-card"
            tone="blue"
            label="Profil"
            title="Akun"
          />
          <div className="mt-5 divide-y divide-line">
            <div className="flex flex-wrap items-baseline justify-between gap-2 py-3">
              <span className="text-base text-mute">Username</span>
              <span className="text-base text-ink">{user?.username || "-"}</span>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 py-3">
              <span className="text-base text-mute">Email</span>
              <span className="break-all text-base text-ink">
                {user?.email || "-"}
              </span>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 py-3">
              <span className="text-base text-mute">Masuk via</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-soft px-3 py-1 text-sm font-medium text-ink">
                <BrandIcon name={isGithub ? "github" : "google"} />
                {provider}
              </span>
            </div>
          </div>
          <p className="mt-4 rounded-2xl bg-soft p-4 text-sm text-mute">
            Nama, avatar, dan email diambil dari akun {provider} Anda dan tidak
            bisa diubah di sini.
          </p>
        </section>

        {/* Sesi */}
        <section className="rounded-[2rem] border border-line bg-white p-6 sm:p-8">
          <CardHeading
            icon="fa-solid fa-shield-halved"
            tone="orange"
            label="Keamanan"
            title="Sesi"
          />
          <p className="mt-5 text-base leading-relaxed text-mute">
            Anda sedang login sebagai{" "}
            <b className="text-ink">{user?.username || user?.email}</b> via{" "}
            {provider}. Sesi berlaku 24 jam sejak login.
          </p>
          <button
            type="button"
            onClick={() => logout()}
            className="btn mt-5 inline-flex items-center gap-2 rounded-full border border-red px-6 py-2.5 text-base font-medium text-red hover:bg-red/5"
          >
            <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" />
            Keluar dari akun
          </button>
        </section>

        {/* Zona berbahaya */}
        <section className="rounded-[2rem] border border-red/30 bg-red/5 p-6 sm:p-8 lg:col-span-2">
          <CardHeading
            icon="fa-solid fa-triangle-exclamation"
            tone="red"
            label="Perhatian"
            title="Zona berbahaya"
          />
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-mute">
            Penghapusan akun akan menghapus semua project, deployment, DNS
            record, dan file build Anda secara permanen. Fitur ini belum
            tersedia otomatis — untuk permintaan penghapusan akun &amp; data,
            hubungi kami dulu.
          </p>
          <a
            href="https://wa.me/6285805566344"
            target="_blank"
            rel="noreferrer"
            className="btn mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-2.5 text-base font-medium text-ink hover:bg-soft"
          >
            <BrandIcon name="whatsapp" className="text-lg text-[#25D366]" />
            Minta penghapusan via WhatsApp
          </a>
        </section>
      </div>
    </div>
  );
}
