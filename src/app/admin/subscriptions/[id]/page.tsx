import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubscriptionDetail } from "@/lib/admin/subscriptions";
import {
  formatDate,
  formatDateTime,
  formatIdr,
  truncateMiddle,
} from "@/lib/admin/format";
import {
  setExpiryAction,
  cancelAction,
  reactivateAction,
} from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminSubscriptionDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  const data = await getSubscriptionDetail(id);
  if (!data) notFound();

  const { sub, user } = data;
  const expiryInput = sub.expiresAt
    ? sub.expiresAt.toISOString().slice(0, 16)
    : "";

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Link
          href="/admin/subscriptions"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← Kembali ke daftar
        </Link>
        <h1 className="serif text-3xl text-foreground leading-tight">
          Subscription · {sub.plan} · {sub.status}
        </h1>
        <p className="text-sm text-muted-foreground tabular-nums">
          id {truncateMiddle(sub.id, 14, 4)} · user{" "}
          {user ? (
            <Link
              href={`/admin/users/${user.id}`}
              className="hover:underline"
            >
              {user.email ?? truncateMiddle(user.id, 10, 4)}
            </Link>
          ) : (
            truncateMiddle(sub.userId, 10, 4)
          )}
        </p>
      </header>

      <section className="grid lg:grid-cols-2 gap-3">
        <Card title="Subscription">
          <Row label="Plan" value={sub.plan} />
          <Row label="Status" value={sub.status} />
          <Row label="Started" value={formatDateTime(sub.startedAt)} />
          <Row
            label="Expires"
            value={sub.expiresAt ? formatDateTime(sub.expiresAt) : "—"}
          />
          <Row
            label="Cancelled"
            value={sub.cancelledAt ? formatDateTime(sub.cancelledAt) : "—"}
          />
          <Row label="Auto-renew" value={sub.autoRenew ? "on" : "off"} />
          <Row
            label="Last order"
            value={
              sub.lastOrderId
                ? truncateMiddle(sub.lastOrderId, 14, 4)
                : "—"
            }
          />
          <Row label="Updated" value={formatDateTime(sub.updatedAt)} />
        </Card>
        <Card title="User">
          {user ? (
            <>
              <Row
                label="Name"
                value={
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="hover:underline"
                  >
                    {user.displayName ?? "(no name)"}
                  </Link>
                }
              />
              <Row label="Email" value={user.email ?? "—"} />
              <Row label="Role" value={user.role} />
              <Row label="User id" value={truncateMiddle(user.id, 14, 4)} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              User dihapus.
            </p>
          )}
        </Card>
      </section>

      <section className="grid lg:grid-cols-3 gap-3">
        <ActionCard title="Set expiresAt manual">
          <form action={setExpiryAction} className="space-y-2">
            <input type="hidden" name="subscriptionId" value={sub.id} />
            <input
              type="datetime-local"
              name="expiresAt"
              defaultValue={expiryInput}
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="w-full rounded-md bg-foreground text-background px-4 py-2 text-sm hover:opacity-90"
            >
              Override expiresAt
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Untuk kompensasi (extend) atau truncation (shorten). Tidak ubah
            status.
          </p>
        </ActionCard>

        <ActionCard title="Cancel subscription">
          <form action={cancelAction} className="space-y-2">
            <input type="hidden" name="subscriptionId" value={sub.id} />
            <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="revokeNow" value="1" />
              Revoke akses sekarang juga
            </label>
            <button
              type="submit"
              className="w-full rounded-md bg-destructive text-destructive-foreground px-4 py-2 text-sm hover:opacity-90"
            >
              Cancel subscription
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Tanpa revoke: status CANCELLED, akses tetap sampai expiresAt.
            Dengan revoke: status EXPIRED, akses hilang sekarang, role
            demote ke REGISTERED.
          </p>
        </ActionCard>

        <ActionCard title="Reactivate (grant N hari)">
          <form action={reactivateAction} className="space-y-2">
            <input type="hidden" name="subscriptionId" value={sub.id} />
            <input
              type="number"
              name="days"
              defaultValue={30}
              min={1}
              max={365}
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm tabular-nums"
            />
            <button
              type="submit"
              className="w-full rounded-md bg-[var(--gold)] text-background px-4 py-2 text-sm hover:opacity-90"
            >
              Reactivate
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Set status ACTIVE + expiresAt = now + N hari. Role di-mirror ke
            PREMIUM jika belum admin/moderator.
          </p>
        </ActionCard>
      </section>

      <section>
        <h2 className="text-sm font-medium text-foreground mb-3">
          Orders linked ({sub.orders.length})
        </h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-xs text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">
                    Midtrans ID
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Plan</th>
                  <th className="text-right px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sub.orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                      Tidak ada order yang terhubung.
                    </td>
                  </tr>
                )}
                {sub.orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 tabular-nums">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="hover:underline"
                      >
                        {o.midtransOrderId}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{o.plan}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatIdr(o.amount)}
                    </td>
                    <td className="px-4 py-3">{o.status}</td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">
                      {o.paidAt ? formatDateTime(o.paidAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-medium text-foreground mb-3">{title}</h3>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function ActionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-medium text-foreground mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm first:pt-0 last:pb-0 gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums text-foreground text-right truncate max-w-[60%]">
        {value}
      </span>
    </div>
  );
}
