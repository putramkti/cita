"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateVoucherAction } from "../actions";

interface VoucherEditFormProps {
  voucherId: string;
  defaults: {
    description: string | null;
    validUntil: Date;
    maxRedemptions: number | null;
    maxPerUser: number;
    minPurchase: number | null;
    isActive: boolean;
  };
  redemptionsCount: number;
}

const initialState = {} as { ok?: boolean; error?: string };

/**
 * /admin/vouchers/[id] — edit voucher.
 *
 * Code, discount type, and discount value are not editable to preserve
 * redemption snapshot integrity. Admin needs to deactivate + create
 * fresh if those values must change.
 */
export function VoucherEditForm({
  voucherId,
  defaults,
  redemptionsCount,
}: VoucherEditFormProps) {
  const [state, formAction, pending] = useActionState(
    updateVoucherAction.bind(null, voucherId),
    initialState,
  );

  const validUntilLocal = toLocalDateTime(defaults.validUntil);

  return (
    <form
      action={formAction}
      className="rounded-xl border border-border bg-card p-6 sm:p-7 space-y-5"
    >
      <Field label="Deskripsi">
        <input
          type="text"
          name="description"
          defaultValue={defaults.description ?? ""}
          maxLength={120}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </Field>

      <Field label="Berlaku sampai">
        <input
          type="datetime-local"
          name="validUntil"
          defaultValue={validUntilLocal}
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </Field>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field
          label="Cap global"
          hint={`Tidak boleh < jumlah redemption sekarang (${redemptionsCount}).`}
        >
          <input
            type="number"
            name="maxRedemptions"
            defaultValue={defaults.maxRedemptions ?? ""}
            min={redemptionsCount || 1}
            placeholder="∞"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </Field>
        <Field label="Maks per user">
          <input
            type="number"
            name="maxPerUser"
            min={1}
            defaultValue={defaults.maxPerUser}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </Field>
        <Field label="Min pembelian (Rp)">
          <input
            type="number"
            name="minPurchase"
            min={0}
            defaultValue={defaults.minPurchase ?? ""}
            placeholder="—"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={defaults.isActive}
          className="size-4 rounded border-border accent-foreground"
        />
        Aktif (uncheck untuk nonaktifkan tanpa menghapus voucher).
      </label>

      {state?.ok && (
        <p
          className="text-sm text-foreground border border-border bg-muted/40 rounded-md px-3 py-2"
          role="status"
        >
          Perubahan tersimpan.
        </p>
      )}
      {state?.error && (
        <p
          className="text-sm text-destructive border border-destructive/40 bg-destructive/5 rounded-md px-3 py-2"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-md bg-foreground text-background px-4 py-2 text-sm hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Menyimpan…" : "Simpan perubahan"}
        </button>
        <Link
          href="/admin/vouchers"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          Kembali
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1.5">
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-[11px] text-muted-foreground/80 mt-1 leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  );
}

function toLocalDateTime(d: Date): string {
  // Chrome's <input type="datetime-local"> wants 'YYYY-MM-DDTHH:mm'.
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
