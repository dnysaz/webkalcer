"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tombol salin ke clipboard yang reusable.
 * Menyalin teks (mis. webhook URL/secret) dan memberi umpan balik visual
 * berupa ikon centang selama 2 detik. Ada fallback untuk browser lama /
 * konteks non-HTTPS (document.execCommand).
 */
export function CopyButton({
  text,
  label = "Salin",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        // biarkan: setidaknya tidak melempar error ke UI
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? "Tersalin!" : label}
      aria-label={copied ? "Tersalin" : label}
      aria-live="polite"
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-sm font-medium text-blue transition-colors hover:bg-line"
    >
      <i
        className={
          copied ? "fa-solid fa-check text-[#1E8E3E]" : "fa-regular fa-copy"
        }
        aria-hidden="true"
      />
    </button>
  );
}
