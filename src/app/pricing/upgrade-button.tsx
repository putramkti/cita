"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

interface UpgradeButtonProps {
  authed: boolean;
  labelUpgrade: string;
  labelLogin: string;
  processingLabel: string;
}

/**
 * Pricing-page CTA for the Premium tier.
 *
 *   - Anonymous user → push to /auth/login?next=/pricing
 *   - Authenticated user → POST /api/billing/checkout → open Snap popup
 *     - When Midtrans is unconfigured (placeholder env), the API returns 503
 *       with a friendly notice; we surface that as a small inline error.
 */
export function UpgradeButton({
  authed,
  labelUpgrade,
  labelLogin,
  processingLabel,
}: UpgradeButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!authed) {
    return (
      <button
        type="button"
        onClick={() => router.push("/auth/login?next=/pricing")}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 hover:bg-primary/90 transition-colors"
      >
        <Sparkles className="size-4" strokeWidth={1.75} />
        {labelLogin}
      </button>
    );
  }

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: "PREMIUM" }),
        });
        const json = (await res.json()) as {
          token?: string;
          redirectUrl?: string;
          error?: { message?: string };
        };

        if (!res.ok) {
          setError(json.error?.message ?? "Gagal memulai pembayaran.");
          return;
        }

        // Prefer Snap popup if available; otherwise use full redirect.
        const w = window as typeof window & {
          snap?: { pay: (token: string, opts?: unknown) => void };
        };
        if (json.token && w.snap?.pay) {
          w.snap.pay(json.token, {
            onSuccess: () =>
              router.push("/akun/billing?status=success"),
            onPending: () =>
              router.push("/akun/billing?status=pending"),
            onError: () =>
              router.push("/akun/billing?status=error"),
            onClose: () => {
              /* user closed the popup */
            },
          });
        } else if (json.redirectUrl) {
          window.location.href = json.redirectUrl;
        } else {
          setError("Pembayaran tidak tersedia saat ini.");
        }
      } catch (e) {
        console.error(e);
        setError("Tidak dapat menghubungi server pembayaran.");
      }
    });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
            {processingLabel}
          </>
        ) : (
          <>
            <Sparkles className="size-4" strokeWidth={1.75} />
            {labelUpgrade}
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-destructive text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
