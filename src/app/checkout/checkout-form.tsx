"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface CheckoutFormProps {
  locale: "id" | "en";
  listPriceIdr: number;
  initialVoucher: string;
  email: string | null;
}

interface VoucherOk {
  ok: true;
  voucher: { code: string; discountType: "PERCENTAGE" | "FIXED_AMOUNT"; discountValue: number };
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  isFree: boolean;
}

interface VoucherErr {
  ok: false;
  code: string;
  message: string;
}

type VoucherState = VoucherOk | VoucherErr | null;

declare global {
  interface Window {
    snap?: { pay: (token: string, opts?: unknown) => void };
  }
}

/**
 * Checkout form: voucher input (debounced live validation) + pay button.
 *
 *   - As the user types, debounce 500ms then validate via /api/billing/voucher/check.
 *   - Show live receipt: original price, discount, final amount.
 *   - When 100% off, "Pay" button becomes "Activate Premium" and skips
 *     Midtrans entirely (server side decides).
 *   - On submit, POST /api/billing/checkout. Server returns either
 *     { free: true, redirectUrl } → router.push, or
 *     { token, redirectUrl } → open Snap popup.
 */
export function CheckoutForm({
  locale,
  listPriceIdr,
  initialVoucher,
  email,
}: CheckoutFormProps) {
  const router = useRouter();
  const isEn = locale === "en";
  const [code, setCode] = useState(initialVoucher);
  const [voucher, setVoucher] = useState<VoucherState>(null);
  const [validating, setValidating] = useState(false);
  const [pending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Debounced voucher validation. Triggered on every code change after
  // 500ms of inactivity. Empty code → clear state, no request.
  useEffect(() => {
    const trimmed = code.trim();
    if (!trimmed) {
      setVoucher(null);
      setValidating(false);
      return;
    }

    setValidating(true);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/billing/voucher/check?code=${encodeURIComponent(trimmed)}&plan=PREMIUM`,
          { cache: "no-store" },
        );
        const data = (await res.json()) as VoucherOk | VoucherErr;
        setVoucher(data);
      } catch {
        setVoucher({
          ok: false,
          code: "network_error",
          message: isEn ? "Network error." : "Tidak dapat menghubungi server.",
        });
      } finally {
        setValidating(false);
      }
    }, 500);

    return () => clearTimeout(handle);
  }, [code, isEn]);

  const finalAmount = voucher?.ok ? voucher.finalAmount : listPriceIdr;
  const discountAmount = voucher?.ok ? voucher.discountAmount : 0;
  const isFree = voucher?.ok ? voucher.isFree : false;

  const handlePay = () => {
    setSubmitError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan: "PREMIUM",
            voucherCode: code.trim() || undefined,
          }),
        });
        const data = (await res.json()) as
          | { free: true; redirectUrl: string }
          | { free: false; token?: string; redirectUrl?: string }
          | { error?: { message?: string; code?: string } };

        if (!res.ok) {
          const errMsg =
            ("error" in data && data.error?.message) ||
            (isEn ? "Failed to start payment." : "Gagal memulai pembayaran.");
          setSubmitError(errMsg);
          return;
        }

        if ("free" in data && data.free === true) {
          router.push(data.redirectUrl);
          return;
        }

        if ("token" in data && data.token && window.snap?.pay) {
          window.snap.pay(data.token, {
            onSuccess: () => router.push("/akun/billing?status=success"),
            onPending: () => router.push("/akun/billing?status=pending"),
            onError: () => router.push("/akun/billing?status=error"),
            onClose: () => {
              /* user closed the popup */
            },
          });
        } else if ("redirectUrl" in data && data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          setSubmitError(
            isEn
              ? "Payment is unavailable right now."
              : "Pembayaran tidak tersedia saat ini.",
          );
        }
      } catch (e) {
        console.error(e);
        setSubmitError(
          isEn
            ? "Could not reach the payment server."
            : "Tidak dapat menghubungi server pembayaran.",
        );
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Code input */}
      <div>
        <label
          htmlFor="voucher-code"
          className="block text-xs text-muted-foreground mb-1.5"
        >
          {isEn ? "Voucher code (optional)" : "Kode voucher (opsional)"}
        </label>
        <div className="relative">
          <input
            id="voucher-code"
            name="voucher-code"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder={isEn ? "e.g. LAUNCH50" : "mis. LAUNCH50"}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full rounded-md border border-border bg-background px-3 py-2 pr-10 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {validating ? (
              <Loader2
                className="size-4 text-muted-foreground animate-spin"
                strokeWidth={1.5}
                aria-hidden
              />
            ) : voucher?.ok ? (
              <Check
                className="size-4 text-foreground"
                strokeWidth={2}
                aria-hidden
              />
            ) : voucher && !voucher.ok ? (
              <AlertCircle
                className="size-4 text-destructive"
                strokeWidth={1.5}
                aria-hidden
              />
            ) : null}
          </div>
        </div>
        {voucher?.ok && (
          <p className="mt-1.5 text-xs text-foreground inline-flex items-center gap-1">
            <Sparkles className="size-3" strokeWidth={2} aria-hidden />
            {isEn
              ? `Code applied: ${voucher.voucher.code} (${formatDiscountLabel(voucher, isEn)})`
              : `Kode aktif: ${voucher.voucher.code} (${formatDiscountLabel(voucher, isEn)})`}
          </p>
        )}
        {voucher && !voucher.ok && code.trim().length > 0 && !validating && (
          <p className="mt-1.5 text-xs text-destructive">
            {voucher.message}
          </p>
        )}
      </div>

      {/* Live receipt */}
      <div className="rounded-lg border border-border bg-background p-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            {isEn ? "List price" : "Harga normal"}
          </span>
          <span className="tabular-nums">
            Rp {listPriceIdr.toLocaleString("id-ID")}
          </span>
        </div>
        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-foreground">
            <span>
              {isEn ? "Voucher discount" : "Diskon voucher"}
            </span>
            <span className="tabular-nums">
              − Rp {discountAmount.toLocaleString("id-ID")}
            </span>
          </div>
        )}
        <div className="flex items-baseline justify-between border-t border-border pt-3">
          <span className="font-medium">
            {isEn ? "Total to pay" : "Total bayar"}
          </span>
          <span className="serif text-2xl tracking-tight tabular-nums">
            {finalAmount === 0
              ? isEn ? "Free" : "Gratis"
              : `Rp ${finalAmount.toLocaleString("id-ID")}`}
          </span>
        </div>
      </div>

      {/* Email confirmation */}
      {email && (
        <p className="text-xs text-muted-foreground">
          {isEn ? "Receipt to" : "Tanda terima ke"}{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      )}

      {/* Pay button */}
      <button
        type="button"
        onClick={handlePay}
        disabled={pending || validating}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium px-4 py-3 hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
            {isEn ? "Processing…" : "Memproses…"}
          </>
        ) : isFree ? (
          <>
            <Sparkles className="size-4" strokeWidth={1.75} />
            {isEn ? "Activate Premium" : "Aktifkan Premium"}
          </>
        ) : (
          <>
            <Sparkles className="size-4" strokeWidth={1.75} />
            {isEn
              ? `Pay Rp ${finalAmount.toLocaleString("id-ID")}`
              : `Bayar Rp ${finalAmount.toLocaleString("id-ID")}`}
          </>
        )}
      </button>

      {submitError && (
        <p className="text-xs text-destructive text-center" role="alert">
          {submitError}
        </p>
      )}
    </div>
  );
}

function formatDiscountLabel(v: VoucherOk, isEn: boolean): string {
  if (v.voucher.discountType === "PERCENTAGE") {
    return `${v.voucher.discountValue}% ${isEn ? "off" : "off"}`;
  }
  return `Rp ${v.voucher.discountValue.toLocaleString("id-ID")} ${isEn ? "off" : "off"}`;
}
