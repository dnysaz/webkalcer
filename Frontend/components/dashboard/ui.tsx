import Link from "next/link";
import type { ReactNode } from "react";

export type Tone = "blue" | "red" | "orange" | "ink";

const DOT: Record<Tone, string> = {
  blue: "bg-blue",
  red: "bg-red",
  orange: "bg-orange",
  ink: "bg-ink",
};

const TINT: Record<Tone, string> = {
  blue: "bg-blue/10 text-blue",
  red: "bg-red/10 text-red",
  orange: "bg-orange/10 text-orange",
  ink: "bg-ink/5 text-ink",
};

export function SectionLabel({
  tone = "blue",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <p className="flex items-center gap-2 text-sm font-medium text-mute sm:text-base">
      <i className={`h-2.5 w-2.5 rounded-full ${DOT[tone]}`} aria-hidden="true" />
      {children}
    </p>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-mute sm:text-base">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`}>
          {i > 0 && (
            <span className="mx-2 text-line" aria-hidden="true">
              ›
            </span>
          )}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-blue">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  current,
  label,
  title,
  description,
  tone = "blue",
  actions,
  children,
}: {
  current: string;
  label: string;
  title: ReactNode;
  description?: ReactNode;
  tone?: Tone;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  const crumbs = [
    { label: "Beranda", href: "/" },
    ...(current === "Dashboard"
      ? []
      : [{ label: "Dashboard", href: "/dashboard" }]),
    { label: current },
  ];

  return (
    <header>
      <Breadcrumbs items={crumbs} />

      <div className="relative mt-5 overflow-hidden rounded-[2rem] bg-soft px-6 py-8 sm:px-10 sm:py-12">
        <span
          className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-blue/10"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -bottom-16 right-28 h-32 w-32 rounded-full bg-orange/10"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <SectionLabel tone={tone}>{label}</SectionLabel>
            <h1 className="mt-3 break-words text-3xl leading-[1.12] font-bold tracking-tight sm:text-4xl xl:text-5xl">
              {title}
            </h1>
            {description && (
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-mute sm:text-lg">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              {actions}
            </div>
          )}
        </div>

        {children && <div className="relative">{children}</div>}
      </div>
    </header>
  );
}

export function StatCard({
  icon,
  label,
  value,
  hint,
  tone = "blue",
}: {
  icon: string;
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: Tone;
}) {
  return (
    <div className="rounded-3xl border border-line bg-white p-4 transition-shadow hover:shadow-[0_8px_24px_rgba(32,33,36,0.07)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span
          className={`grid h-10 w-10 place-items-center rounded-2xl sm:h-11 sm:w-11 ${TINT[tone]}`}
        >
          <i className={`${icon} text-lg`} aria-hidden="true" />
        </span>
        {hint && <span className="hidden text-xs text-mute sm:inline">{hint}</span>}
      </div>
      <p className="mt-3 text-2xl font-medium tracking-tight text-ink sm:mt-4 sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-sm text-mute">{label}</p>
    </div>
  );
}
