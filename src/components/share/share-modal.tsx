"use client";

import { useEffect, useState, useRef } from "react";
import {
  Share2,
  X,
  Copy,
  Check,
  Send,
  MessageCircle,
  Hash,
  Loader2,
} from "lucide-react";

interface ShareModalProps {
  attemptId: string;
  isAuthed: boolean;
  scorePct: number;
  modeLabel: string;
  locale: "id" | "en";
  initialShare?: {
    shareId: string;
    showName: boolean;
  } | null;
  triggerVariant?: "primary" | "ghost";
  triggerLabel?: string;
}

interface ShareState {
  shareId: string;
  showName: boolean;
}

/**
 * Modal-driven share UI for the result page. Handles:
 *
 *   - Lazy share creation: only POSTs /api/share/result when the user opens
 *     the modal (not on page load).
 *   - showName toggle for authed users.
 *   - Native Web Share API with fallbacks: copy link, WhatsApp, X (Twitter).
 *
 * Privacy default: showName=false (anonymous-by-default).
 */
export function ShareModal({
  attemptId,
  isAuthed,
  scorePct,
  modeLabel,
  locale,
  initialShare,
  triggerVariant = "primary",
  triggerLabel,
}: ShareModalProps) {
  const [open, setOpen] = useState(false);
  const [share, setShare] = useState<ShareState | null>(initialShare ?? null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [updatingName, setUpdatingName] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const isEn = locale === "en";

  const dict = {
    open: triggerLabel ?? (isEn ? "Share result" : "Bagikan hasil"),
    title: isEn ? "Share your result" : "Bagikan hasil Anda",
    subtitle: isEn
      ? "Anyone with this link can view your score (read-only)."
      : "Siapa pun dengan tautan ini dapat melihat skor Anda (hanya-baca).",
    showName: isEn ? "Show my display name" : "Tampilkan nama saya",
    showNameOff: isEn
      ? "Result is shared anonymously."
      : "Hasil dibagikan tanpa nama.",
    showNameOn: isEn
      ? "Your display name will appear on the share page."
      : "Nama tampilan Anda akan muncul di halaman bagikan.",
    copy: isEn ? "Copy link" : "Salin tautan",
    copied: isEn ? "Copied" : "Tersalin",
    whatsapp: "WhatsApp",
    twitter: "X / Twitter",
    nativeShare: isEn ? "Share via..." : "Bagikan ke...",
    close: isEn ? "Close" : "Tutup",
    creating: isEn ? "Creating link..." : "Membuat tautan...",
    failed: isEn
      ? "Failed to create share link. Try again."
      : "Gagal membuat tautan. Coba lagi.",
  };

  /* Lazily create the share when modal opens */
  useEffect(() => {
    if (!open || share) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/share/result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attemptId, showName: false }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ShareState = await res.json();
        if (!cancelled) setShare(data);
      } catch {
        if (!cancelled) setError(dict.failed);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, share, attemptId, dict.failed]);

  /* Esc to close */
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const url = share
    ? `${typeof window !== "undefined" ? window.location.origin : "https://cita.id"}/r/${share.shareId}`
    : "";

  const text = isEn
    ? `${modeLabel} SKD CPNS — score ${scorePct}%. Try it on Cita: ${url}`
    : `Hasil ${modeLabel} SKD CPNS — skor ${scorePct}%. Coba di Cita: ${url}`;

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
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

  const handleNativeShare = async () => {
    if (!url) return;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ url, text, title: "Cita" });
        return;
      } catch {
        // user cancelled
      }
    }
    handleCopy();
  };

  const handleWhatsApp = () => {
    if (!url) return;
    const u = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(u, "_blank", "noopener,noreferrer");
  };

  const handleTwitter = () => {
    if (!url) return;
    const u = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(u, "_blank", "noopener,noreferrer");
  };

  const handleToggleName = async (next: boolean) => {
    if (!share) return;
    setUpdatingName(true);
    try {
      const res = await fetch("/api/share/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, showName: next }),
      });
      if (!res.ok) throw new Error();
      const data: ShareState = await res.json();
      setShare(data);
    } catch {
      // revert visually if the call fails
    } finally {
      setUpdatingName(false);
    }
  };

  const triggerClass =
    triggerVariant === "primary"
      ? "inline-flex items-center gap-2 rounded-md bg-foreground text-background px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
      : "inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClass}>
        <Share2 className="size-4" strokeWidth={1.75} />
        {dict.open}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={dict.title}
            className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="serif text-2xl text-foreground">{dict.title}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {dict.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                aria-label={dict.close}
              >
                <X className="size-4" strokeWidth={1.75} />
              </button>
            </div>

            {loading && !share && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
                <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
                {dict.creating}
              </div>
            )}

            {error && !share && (
              <div className="rounded-md border border-[var(--error-fg)]/20 bg-[var(--error-soft)] p-4 text-sm text-[var(--error-fg)]">
                {error}
              </div>
            )}

            {share && (
              <>
                {/* Privacy toggle */}
                {isAuthed && (
                  <label className="flex items-start gap-3 mb-5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={share.showName}
                      disabled={updatingName}
                      onChange={(e) => handleToggleName(e.target.checked)}
                      className="mt-0.5 size-4 rounded border-border accent-foreground disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-foreground font-medium">
                        {dict.showName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {share.showName ? dict.showNameOn : dict.showNameOff}
                      </p>
                    </div>
                  </label>
                )}

                {/* URL preview */}
                <div className="rounded-md border border-border bg-background px-3 py-2.5 mb-4 flex items-center gap-2">
                  <p className="text-xs font-mono text-muted-foreground truncate flex-1">
                    {url}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded text-xs font-medium text-foreground hover:bg-secondary px-2 py-1 transition-colors"
                  >
                    {copied ? (
                      <Check className="size-3.5" strokeWidth={2} />
                    ) : (
                      <Copy className="size-3.5" strokeWidth={1.75} />
                    )}
                    {copied ? dict.copied : dict.copy}
                  </button>
                </div>

                {/* Quick share targets */}
                <div className="grid grid-cols-3 gap-2">
                  <ShareTargetButton
                    icon={<Send className="size-4" strokeWidth={1.75} />}
                    label={dict.nativeShare}
                    onClick={handleNativeShare}
                  />
                  <ShareTargetButton
                    icon={
                      <MessageCircle className="size-4" strokeWidth={1.75} />
                    }
                    label={dict.whatsapp}
                    onClick={handleWhatsApp}
                  />
                  <ShareTargetButton
                    icon={<Hash className="size-4" strokeWidth={1.75} />}
                    label={dict.twitter}
                    onClick={handleTwitter}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ShareTargetButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 rounded-md border border-border bg-background py-3 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
    >
      {icon}
      <span className="leading-tight text-[11px]">{label}</span>
    </button>
  );
}
