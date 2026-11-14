"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CopyButton } from "@/components/dashboard/copy-button";

type DeploymentStatus = "pending" | "building" | "success" | "failed";

type Props = {
  log: string;
  status: DeploymentStatus;
  defaultOpen?: boolean;
};

const TS_RE = /^(\d{2}:\d{2}:\d{2})\s(.*)$/;

/** Warna baris ala terminal supaya error/warning/sukses langsung terlihat. */
function tone(text: string): string {
  const lower = text.toLowerCase();
  if (lower.startsWith("$ ")) return "text-[#8AB4F8] font-semibold";
  if (
    /^(✓|✔)/.test(text) ||
    lower.startsWith("ok:") ||
    lower.includes("build finished")
  ) {
    return "text-[#81C995]";
  }
  if (/error|failed|fatal|✗|exit status [1-9]/i.test(text)) {
    return "text-[#F28B82]";
  }
  if (/warn|⚠|deprecated/i.test(text)) return "text-[#FDD663]";
  return "text-[#E8EAED]";
}

/**
 * Penampil log build bergaya terminal.
 * - Baris berwarna: perintah (biru), sukses (hijau), warning (kuning),
 *   error (merah), timestamp diredupkan.
 * - Auto-scroll ke baris terbaru selama pengguna belum scroll ke atas.
 * - Tombol salin seluruh log.
 */
export function BuildLog({ log, status, defaultOpen = false }: Props) {
  const live = status === "building" || status === "pending";
  const [open, setOpen] = useState(defaultOpen);
  const [pinned, setPinned] = useState(true);
  const boxRef = useRef<HTMLDivElement>(null);

  const lines = useMemo(() => (log ? log.split("\n") : []), [log]);

  // Ikuti baris terbaru selama pengguna belum scroll ke atas.
  useEffect(() => {
    const el = boxRef.current;
    if (!el || !open || !pinned) return;
    el.scrollTop = el.scrollHeight;
  }, [log, open, pinned]);

  const onScroll = () => {
    const el = boxRef.current;
    if (!el) return;
    setPinned(el.scrollHeight - el.scrollTop - el.clientHeight < 32);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#1E293B] bg-[#0B1220]">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#111A2B] px-3 py-2">
        <div className="flex items-center gap-2 text-xs font-medium text-[#C7D2E5]">
          {live ? (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#81C995] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#81C995]" />
            </span>
          ) : (
            <span
              className={`h-2 w-2 rounded-full ${
                status === "failed" ? "bg-[#F28B82]" : "bg-[#5B6B84]"
              }`}
            />
          )}
          <span>{live ? "Log langsung (live)" : "Log build"}</span>
          {lines.length > 0 && (
            <span className="text-[#5B6B84]">· {lines.length} baris</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {open && log.trim() !== "" && (
            <CopyButton
              text={log}
              label="Salin log"
              className="bg-white/10 text-[#E8EAED] hover:bg-white/20"
            />
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-[#C7D2E5] transition-colors hover:bg-white/10"
          >
            {open ? "Sembunyikan log" : "Tampilkan log"}
          </button>
        </div>
      </div>

      {open && (
        <div className="relative">
          <div
            ref={boxRef}
            onScroll={onScroll}
            className="max-h-80 overflow-auto px-3 py-2 font-mono text-[12px] leading-relaxed"
          >
            {lines.length === 0 ? (
              <p className="py-2 text-[#5B6B84]">Menunggu log…</p>
            ) : (
              lines.map((line, i) => {
                const match = TS_RE.exec(line);
                const timestamp = match ? match[1] : null;
                const text = match ? match[2] : line;
                return (
                  <div
                    key={i}
                    className="flex gap-2 whitespace-pre-wrap break-words"
                  >
                    {timestamp && (
                      <span className="shrink-0 select-none text-[#5B6B84]">
                        {timestamp}
                      </span>
                    )}
                    <span className={tone(text)}>{text || " "}</span>
                  </div>
                );
              })
            )}
          </div>
          {!pinned && (
            <button
              type="button"
              onClick={() => {
                setPinned(true);
                const el = boxRef.current;
                if (el) el.scrollTop = el.scrollHeight;
              }}
              className="absolute bottom-3 right-3 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-[#E8EAED] backdrop-blur transition-colors hover:bg-white/25"
            >
              <i className="fa-solid fa-arrow-down mr-1" aria-hidden="true" />
              Ke bawah
            </button>
          )}
        </div>
      )}
    </div>
  );
}
