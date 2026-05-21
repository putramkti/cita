import Link from "next/link";
import { listSubscriptions } from "@/lib/admin/subscriptions";
import { formatDateTime, truncateMiddle } from "@/lib/admin/format";
import type { SubscriptionStatus } from "@prisma/client";

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
  value: SubscriptionStatus | "ALL";
  label: string;
}> = [
  { value: "ALL", label: "Semua" },
  { value: "ACTIVE", label: "Active" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "EXPIRED", label: "Expired" },
  { value: "PENDING", label: "Pending" },
];

export default async function AdminSubscriptionsPage({
  searchParams,
}: PageProps) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const status = (sp.status ?? "ALL") as SubscriptionStatus | "ALL";
  const page = Number(sp.page ?? 1);

  const result = await listSubscriptions({ q, status, page, pageSize: 25 });
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="serif text-3xl text-foreground leading-tight">
          Subscriptions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {result.total} subscription{result.total !== 1 ? "s" : ""} (filtered).
        </p>
      </header>

      <form
        method="get"
        className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-4"
      >
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-muted-foreground mb-1.5">
            Cari user id
          </label>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="user id..."
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">
            Status
          </label>
          <select
            name="status"
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
            href="/admin/subscriptions"
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
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Plan</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Started</th>
                <th className="text-left px-4 py-3 font-medium">Expires</th>
                <th className="text-left px-4 py-3 font-medium">Auto-renew</th>
                <th className="text-right px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    Belum ada subscription.
                  </td>
                </tr>
              )}
              {result.rows.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${s.userId}`}
                      className="hover:underline"
                    >
                      <div className="flex flex-col">
                        <span className="text-foreground">
                          {s.userDisplayName ?? s.userEmail ?? "(no name)"}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {s.userEmail ?? truncateMiddle(s.userId, 10, 4)}
                        </span>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">{s.plan}</td>
                  <td className="px-4 py-3">
                    <SubStatusPill status={s.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {formatDateTime(s.startedAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {s.expiresAt ? formatDateTime(s.expiresAt) : "—"}
                  </td>
                  <td className="px-4 py-3">{s.autoRenew ? "on" : "off"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/subscriptions/${s.id}`}
                      className="text-xs text-foreground hover:underline"
                    >
                      Detail →
                    </Link>
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
  return `/admin/subscriptions?${params.toString()}`;
}

function SubStatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVE:
      "border-[var(--gold)]/40 text-[var(--gold)] bg-[var(--gold)]/[0.08]",
    CANCELLED: "border-amber-300/40 text-amber-700 bg-amber-50",
    EXPIRED: "border-border text-muted-foreground bg-secondary",
    PENDING: "border-blue-300/40 text-blue-700 bg-blue-50",
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
