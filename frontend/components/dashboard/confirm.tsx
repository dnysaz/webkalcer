"use client";

import type { ReactNode } from "react";
import { Dialog } from "@/components/dashboard/dialog";

/**
 * Komponen modal reusable untuk konfirmasi & pemberitahuan di dashboard.
 * Menggantikan `window.confirm`/`alert`/`window.location.assign`+reload agar
 * konsisten dengan desain & UX situs (Google-style).
 *
 * - ConfirmDialog: minta konfirmasi sebelum aksi destruktif/penting
 *   (hapus project, rollback, hapus riwayat, dll).
 * - InfoDialog: menampilkan pesan info/sukses/error dengan satu tombol.
 *
 * Contoh:
 *   const [confirm, setConfirm] = useState<null | ConfirmConfig>(null);
 *   <ConfirmDialog open={!!confirm} {...confirm} onCancel={() => setConfirm(null)} />
 */

export type ModalTone = "danger" | "warning" | "info" | "success";

const TONE: Record<
  ModalTone,
  { icon: string; chip: string; button: string }
> = {
  danger: {
    icon: "fa-solid fa-triangle-exclamation",
    chip: "bg-red/10 text-red",
    button: "bg-red text-white hover:bg-red/90",
  },
  warning: {
    icon: "fa-solid fa-circle-exclamation",
    chip: "bg-orange/10 text-orange",
    button: "bg-orange text-white hover:bg-orange/90",
  },
  info: {
    icon: "fa-solid fa-circle-info",
    chip: "bg-blue/10 text-blue",
    button: "bg-blue text-white hover:bg-blue/90",
  },
  success: {
    icon: "fa-solid fa-circle-check",
    chip: "bg-blue/10 text-blue",
    button: "bg-blue text-white hover:bg-blue/90",
  },
};

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  tone?: ModalTone;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  tone = "danger",
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const t = TONE[tone];
  return (
    <Dialog open={open} onClose={onCancel} title={title}>
      <div className="flex items-start gap-4">
        <span
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl ${t.chip}`}
        >
          <i className={t.icon} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 text-base leading-relaxed text-mute">
          {message}
        </div>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="btn rounded-full border border-line bg-white px-6 py-2.5 text-base font-medium text-ink hover:bg-soft disabled:opacity-60"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`btn inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-base font-medium ${t.button} disabled:opacity-60`}
        >
          {busy && (
            <i
              className="fa-solid fa-spinner fa-spin text-sm"
              aria-hidden="true"
            />
          )}
          {busy ? "Memproses…" : confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}

export interface InfoDialogProps {
  open: boolean;
  title?: string;
  message: ReactNode;
  tone?: ModalTone;
  actionLabel?: string;
  onClose: () => void;
}

/** Modal satu-tombol untuk info/sukses/error (pengganti alert()). */
export function InfoDialog({
  open,
  title = "Pemberitahuan",
  message,
  tone = "info",
  actionLabel = "Mengerti",
  onClose,
}: InfoDialogProps) {
  const t = TONE[tone];
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <div className="flex items-start gap-4">
        <span
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl ${t.chip}`}
        >
          <i className={t.icon} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 text-base leading-relaxed text-mute">
          {message}
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className={`btn rounded-full px-6 py-2.5 text-base font-medium ${t.button}`}
        >
          {actionLabel}
        </button>
      </div>
    </Dialog>
  );
}
