"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

interface Props {
  shareId: string;
  scorePct: number;
  modeLabel: string;
  locale: "id" | "en";
}

/**
 * Renders the 'Copy link' / 'Share' row on the public share page so visitors
 * (often other students) can re-share or grab the URL.
 */
export function ShareCtaCopy({ shareId, scorePct, modeLabel, locale }: Props) {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/r/${shareId}`
      : `https://cita.id/r/${shareId}`;

  const text =
    locale === "en"
      ? `${modeLabel} SKD CPNS — score ${scorePct}%. Try it on Cita: ${url}`
      : `Hasil ${modeLabel} SKD CPNS — skor ${scorePct}%. Coba di Cita: ${url}`;

  const isEn = locale === "en";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Older browser fallback
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ url, text, title: "Cita" });
        return;
      } catch {
        // user cancelled
      }
    }
    copy();
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="label-caps text-muted-foreground mb-1.5">
          {isEn ? "Share this link" : "Bagikan tautan ini"}
        </p>
        <p className="text-sm text-foreground font-mono truncate">{url}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
        >
          {copied ? (
            <Check className="size-3.5" strokeWidth={2} />
          ) : (
            <Copy className="size-3.5" strokeWidth={1.75} />
          )}
          {copied
            ? isEn
              ? "Copied"
              : "Tersalin"
            : isEn
              ? "Copy"
              : "Salin"}
        </button>
        <button
          type="button"
          onClick={share}
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-3 py-2 text-xs font-medium hover:opacity-90 transition-opacity"
        >
          <Share2 className="size-3.5" strokeWidth={1.75} />
          {isEn ? "Share" : "Bagikan"}
        </button>
      </div>
    </div>
  );
}
