"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface CancelButtonProps {
  labelCancel: string;
  labelProcessing: string;
  labelConfirm: string;
  labelYes: string;
  labelNo: string;
}

/**
 * Cancel-subscription CTA. Two-step UX (button → confirm bar) so a stray
 * click can't terminate auto-renew. Posts to /api/billing/cancel.
 */
export function CancelButton({
  labelCancel,
  labelProcessing,
  labelConfirm,
  labelYes,
  labelNo,
}: CancelButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onCancel = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/billing/cancel", { method: "POST" });
        const json = (await res.json()) as { error?: { message?: string } };
        if (!res.ok) {
          setError(json.error?.message ?? "Gagal membatalkan.");
          return;
        }
        router.refresh();
      } catch {
        setError("Tidak bisa menghubungi server.");
      } finally {
        setConfirming(false);
      }
    });
  };

  if (!confirming) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors underline-offset-4 hover:underline"
        >
          {labelCancel}
        </button>
        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-muted/30 p-3 text-xs space-y-2.5">
      <p className="text-muted-foreground">{labelConfirm}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-md bg-destructive text-destructive-foreground px-3 py-1.5 text-xs font-medium hover:bg-destructive/90 disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="size-3 animate-spin" strokeWidth={2} />
              {labelProcessing}
            </>
          ) : (
            labelYes
          )}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary/50"
        >
          {labelNo}
        </button>
      </div>
    </div>
  );
}
