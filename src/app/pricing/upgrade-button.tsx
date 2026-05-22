"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

interface UpgradeButtonProps {
  authed: boolean;
  labelUpgrade: string;
  labelLogin: string;
  /** Kept for compatibility with shared callers; no longer used. */
  processingLabel?: string;
}

/**
 * Pricing-page CTA for the Premium tier.
 *
 *   - Anonymous user → push to /auth/login?next=/pricing
 *   - Authenticated user → push to /checkout (where voucher input lives)
 *
 * The previous implementation called /api/billing/checkout directly and
 * opened the Snap popup inline. Now we route through /checkout so the
 * user can review pricing, apply a voucher, and confirm before any
 * payment intent is created.
 */
export function UpgradeButton({
  authed,
  labelUpgrade,
  labelLogin,
}: UpgradeButtonProps) {
  const router = useRouter();

  if (!authed) {
    return (
      <button
        type="button"
        onClick={() => router.push("/auth/login?next=/checkout")}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 hover:bg-primary/90 transition-colors"
      >
        <Sparkles className="size-4" strokeWidth={1.75} />
        {labelLogin}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.push("/checkout")}
      className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 hover:bg-primary/90 transition-colors"
    >
      <Sparkles className="size-4" strokeWidth={1.75} />
      {labelUpgrade}
    </button>
  );
}
