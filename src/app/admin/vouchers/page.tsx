import Link from "next/link";
import { Plus } from "lucide-react";
import { listVouchers } from "@/lib/admin/vouchers";
import { formatDate } from "@/lib/admin/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}

const STATUS_FILTERS: Array<{
  value: "all" | "active" | "inactive" | "expired";
  label: string;
}> = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
  { value: "expired", label: "Expired" },
];

export default async function AdminVouchersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const status = (sp.status ?? "all") as
    | "all"
    | "active"
    | "inactive"
    | "expired";
  const page = Number(sp.page ?? 1);

  const result = await listVouchers({ q, status, page, pageSize: 25 });
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="serif text-3xl text-foreground leading-tight">
            Vouchers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {result.total} voucher (filtered).
          </p>
        </div>
        <Link
          href="/admin/vouchers/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-4 py-2 text-sm hover:opacity-90"
        >
          <Plus className="size-4" strokeWidth={2} />
          Buat voucher
        </Link>
      </header>

      <form
        method="get"
        className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-4"
      >
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="q"
            className="block text-xs text-muted-foreground mb-1.5"
          >
            Cari kode / deskripsi
          </label>
          <input
            type="text"
            name="q"
            id="q"
            defaultValue={q}
            placeholder="LAUNCH50"
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>
        <div>
          <label
            htmlFor="status"
            className="block text-xs text-muted-foreground mb-1.5"
          >
            Status
          </label>
          <select
            name="status"
            id="status"
            defaultValue={status}
            className="rounded-md border border-border bg-card px-3 py-2 text-sm"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-foreground text-background px-4 py-2 text-sm hover:opacity-90"
        >
          Terapkan
        </button>
      </form>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {result.rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Belum ada voucher. Klik <strong>Buat voucher</strong> di kanan atas
            untuk membuat yang pertama.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {result.rows.map((v) => (
              <li
                key={v.id}
                className="px-4 py-4 sm:px-5 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/admin/vouchers/${v.id}`}
                      className="font-mono text-sm font-medium text-foreground hover:underline"
                    >
                      {v.code}
                    </Link>
                    {!v.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground bg-muted">
                        Nonaktif
                      </span>
                    )}
                    {v.validUntil < new Date() && (
                      <span className="text-xs px-2 py-0.5 rounded-full border border-amber-300/40 text-amber-700 bg-amber-50">
                        Expired
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {v.description ?? "—"}
                  </p>
                </div>
                <div className="text-right text-sm tabular-nums">
                  <p className="text-foreground">
                    {formatDiscount(v.discountType, v.discountValue)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {v.redemptionsCount}
                    {v.maxRedemptions ? `/${v.maxRedemptions}` : ""} digunakan
                    · sampai {formatDate(v.validUntil)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="tabular-nums">
            Halaman {result.page} dari {totalPages}
          </span>
          <div className="flex gap-1">
            {result.page > 1 && (
              <Link
                href={pageHref(sp, result.page - 1)}
                className="rounded border border-border px-3 py-1.5 hover:bg-secondary"
              >
                Sebelumnya
              </Link>
            )}
            {result.page < totalPages && (
              <Link
                href={pageHref(sp, result.page + 1)}
                className="rounded border border-border px-3 py-1.5 hover:bg-secondary"
              >
                Berikutnya
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDiscount(
  type: "PERCENTAGE" | "FIXED_AMOUNT",
  value: number,
): string {
  if (type === "PERCENTAGE") return `${value}% off`;
  return `Rp ${value.toLocaleString("id-ID")} off`;
}

function pageHref(
  sp: { q?: string; status?: string; page?: string },
  page: number,
): string {
  const params = new URLSearchParams();
  if (sp.q) params.set("q", sp.q);
  if (sp.status) params.set("status", sp.status);
  params.set("page", String(page));
  return `/admin/vouchers?${params.toString()}`;
}
