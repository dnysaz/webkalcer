"use client";

import type { Project, Deployment } from "@/lib/api";

type BadgeStatus =
  | Project["status"]
  | Deployment["status"]
  | "success"
  | "deployed";

const STYLE: Record<BadgeStatus, string> = {
  pending: "bg-soft text-mute",
  building: "bg-orange/15 text-ink",
  deployed: "bg-blue/15 text-blue",
  success: "bg-blue/15 text-blue",
  failed: "bg-red/15 text-red",
};

const LABEL: Record<BadgeStatus, string> = {
  pending: "Menunggu build",
  building: "Sedang build",
  deployed: "Online",
  success: "Selesai",
  failed: "Gagal",
};

export function StatusBadge({
  status,
  className,
}: { status: BadgeStatus; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium sm:text-sm ${className ?? ""} ${STYLE[status]}`}
    >
      <i
        className={`h-2 w-2 rounded-full ${
          status === "building" || status === "pending"
            ? "animate-pulse bg-orange"
            : status === "deployed" || status === "success"
              ? "bg-blue"
              : status === "failed"
                ? "bg-red"
                : "bg-mute"
        }`}
      />
      {LABEL[status]}
    </span>
  );
}
