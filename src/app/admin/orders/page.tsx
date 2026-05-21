import Link from "next/link";
import { listOrders } from "@/lib/admin/orders";
import { formatDateTime, formatIdr, truncateMiddle } from "@/lib/admin/format";
import type { PaymentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}

const STATUS_FILTERS: Array<{ value: PaymentStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Semua" },
  { value: "PAID", label: "Paid" },
  { value: "PENDING", label: "Pending" },
  { value: "EXPIRED", label: "Expired" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const status = (sp.status ?? "ALL") as PaymentStatus | "ALL";
  const page = Number(sp.page ?? 1);

  const result = await listOrders({ q, status, page, pageSize: 25 });
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="serif text-3xl text-foreground leading-tight">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {result.total} order{result.total !== 1 ? "s" : ""} (filtered).
        </p>
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
            Cari midtrans id / order id / user id
          </label>
          <input
            type="text"
            name="q"
            id="q"
            defaultValue={q}
            placeholder="cita-..."
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
          Apply
        </button>
        {(q || status !== "ALL") && (
          <Link
            href="/admin/orders"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Reset
          </Link>
        )}
      </form>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Midtrans ID</th>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Plan</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Paid</th>
                <th className="text-left px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    Belum ada order yang cocok filter.
                  </td>
                </tr>
              )}
              {result.rows.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 tabular-nums">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="hover:underline"
                    >
                      {o.midtransOrderId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${o.userId}`}
                      className="hover:underline"
                    >
                      <div className="flex flex-col">
                        <span className="text-foreground">
                          {o.userDisplayName ?? o.userEmail ?? "(no name)"}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {o.userEmail ?? truncateMiddle(o.userId, 10, 4)}
                        </span>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">{o.plan}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatIdr(o.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusPill status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {o.paidAt ? formatDateTime(o.paidAt) : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {formatDateTime(o.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Hal {result.page} dari {totalPages} · {result.total} total
          </span>
          <div className="flex gap-1">
            {result.page > 1 && (
              <Link
                href={pageHref(sp, result.page - 1)}
                className="rounded border border-border px-3 py-1.5 hover:bg-secondary"
              >
                ‹ Prev
              </Link>
            )}
            {result.page < totalPages && (
              <Link
                href={pageHref(sp, result.page + 1)}
                className="rounded border border-border px-3 py-1.5 hover:bg-secondary"
              >
                Next ›
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function pageHref(
  sp: { q?: string; status?: string; page?: string },
  page: number,
): string {
  const params = new URLSearchParams();
  if (sp.q) params.set("q", sp.q);
  if (sp.status) params.set("status", sp.status);
  params.set("page", String(page));
  return `/admin/orders?${params.toString()}`;
}

function OrderStatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PAID: "border-[var(--gold)]/40 text-[var(--gold)] bg-[var(--gold)]/[0.08]",
    PENDING: "border-blue-300/40 text-blue-700 bg-blue-50",
    EXPIRED: "border-border text-muted-foreground bg-secondary",
    FAILED: "border-destructive/40 text-destructive bg-destructive/5",
    CANCELLED: "border-border text-muted-foreground bg-secondary",
    REFUNDED: "border-amber-300/40 text-amber-700 bg-amber-50",
  };
  return (
    <span
      className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${
        colors[status] ?? colors.EXPIRED
      }`}
    >
      {status}
    </span>
  );
}
