"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createVoucherAction } from "../actions";

const initialState = {} as { ok?: boolean; error?: string; voucherId?: string };

/**
 * /admin/vouchers/new — create a voucher.
 *
 * Server action handles validation. On success, the action returns the
 * new voucher id and the client navigates to the detail page so admin
 * can verify + share the code.
 */
export function VoucherNewForm() {
  const [state, formAction, pending] = useActionState(
    createVoucherAction,
    initialState,
  );

  // Reasonable defaults for the date inputs (today + 30 days).
  const todayIso = new Date().toISOString().slice(0, 16);
  const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  if (state?.ok && state.voucherId) {
    // Show success card with link rather than auto-redirecting so the
    // admin sees confirmation copy first.
    return (
      <div className="rounded-xl border border-foreground/30 bg-card p-7 sm:p-8">
        <p className="serif text-2xl text-foreground">Voucher dibuat</p>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Kode sudah aktif sesuai konfigurasi. Anda bisa membagikan kode
          tersebut atau membuka halaman detail untuk melihat redemption.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/admin/vouchers/${state.voucherId}`}
            className="inline-flex items-center rounded-md bg-foreground text-background px-4 py-2 text-sm hover:opacity-90"
          >
            Lihat detail
          </Link>
          <Link
            href="/admin/vouchers/new"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
          >
            Buat lagi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-xl border border-border bg-card p-7 sm:p-8 space-y-5"
    >
      <Field
        label="Kode"
        hint="Huruf besar, angka, dash atau underscore. 3-32 karakter. Contoh: LAUNCH50"
      >
        <input
          type="text"
          name="code"
          required
          minLength={3}
          maxLength={32}
          autoCapitalize="characters"
          spellCheck={false}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </Field>

      <Field
        label="Deskripsi (opsional)"
        hint="Catatan internal — tidak ditampilkan ke user."
      >
        <input
          type="text"
          name="description"
          maxLength={120}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Tipe diskon">
          <select
            name="discountType"
            required
            defaultValue="PERCENTAGE"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="PERCENTAGE">Persen (%)</option>
            <option value="FIXED_AMOUNT">Nominal (Rp)</option>
          </select>
        </Field>
        <Field
          label="Nilai diskon"
          hint="Untuk Persen: 0-100. Untuk Nominal: rupiah (contoh 10000)."
        >
          <input
            type="number"
            name="discountValue"
            required
            min={1}
            max={1_000_000}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Berlaku mulai">
          <input
            type="datetime-local"
            name="validFrom"
            defaultValue={todayIso}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </Field>
        <Field label="Berlaku sampai" hint="Wajib diisi.">
          <input
            type="datetime-local"
            name="validUntil"
            defaultValue={in30}
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field
          label="Cap global (opsional)"
          hint="Total maksimum redemption. Kosongkan = tanpa batas."
        >
          <input
            type="number"
            name="maxRedemptions"
            min={1}
            placeholder="∞"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </Field>
        <Field label="Maks per user" hint="Default 1.">
          <input
            type="number"
            name="maxPerUser"
            min={1}
            defaultValue={1}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </Field>
        <Field
          label="Min pembelian (opsional)"
          hint="Rupiah — voucher hanya berlaku jika harga ≥ angka ini."
        >
          <input
            type="number"
            name="minPurchase"
            min={0}
            placeholder="—"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked
          className="size-4 rounded border-border accent-foreground"
        />
        Aktif sekarang (centang = bisa langsung dipakai user).
      </label>

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
          {pending ? "Menyimpan…" : "Buat voucher"}
        </button>
        <Link
          href="/admin/vouchers"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.5} />
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
