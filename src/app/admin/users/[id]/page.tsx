import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserDetail } from "@/lib/admin/users";
import {
  formatDate,
  formatDateTime,
  formatIdr,
  truncateMiddle,
} from "@/lib/admin/format";
import {
  setUserRoleAction,
  grantPremiumAction,
} from "../actions";
import type { Role } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ROLES: Role[] = ["REGISTERED", "PREMIUM", "MODERATOR", "ADMIN"];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;
  const detail = await getUserDetail(id);
  if (!detail) notFound();

  const { user, subscription, attempts, orders, tutorMsgsTotal } = detail;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Link
          href="/admin/users"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← Kembali ke daftar
        </Link>
        <h1 className="serif text-3xl text-foreground leading-tight">
          {user.displayName ?? user.email ?? "(no name)"}
        </h1>
        <p className="text-sm text-muted-foreground tabular-nums">
          {user.email ?? "(no email)"} · id {truncateMiddle(user.id, 10, 6)}
        </p>
      </header>

      {/* Identity card */}
      <section className="grid lg:grid-cols-3 gap-3">
        <Card title="Status">
          <Row label="Role" value={user.role} />
          <Row label="Anonymous" value={user.isAnonymous ? "yes" : "no"} />
          <Row label="Joined" value={formatDateTime(user.createdAt)} />
          <Row label="Updated" value={formatDateTime(user.updatedAt)} />
        </Card>
        <Card title="Subscription">
          {subscription ? (
            <>
              <Row label="Plan" value={subscription.plan} />
              <Row label="Status" value={subscription.status} />
              <Row
                label="Started"
                value={formatDateTime(subscription.startedAt)}
              />
              <Row
                label="Expires"
                value={
                  subscription.expiresAt
                    ? formatDateTime(subscription.expiresAt)
                    : "—"
                }
              />
              <Row
                label="Auto-renew"
                value={subscription.autoRenew ? "on" : "off"}
              />
              <Row
                label="Last order"
                value={
                  subscription.lastOrderId
                    ? truncateMiddle(subscription.lastOrderId, 14, 4)
                    : "—"
                }
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Belum ada subscription record.
            </p>
          )}
        </Card>
        <Card title="Aktivitas">
          <Row label="Tryouts" value={attempts.length} />
          <Row label="Paid orders" value={orders.filter((o) => o.status === "PAID").length} />
          <Row label="Total orders" value={orders.length} />
          <Row label="Pesan tutor" value={tutorMsgsTotal} />
        </Card>
      </section>

      {/* Admin actions */}
      <section className="grid lg:grid-cols-2 gap-3">
        <ActionCard title="Ubah role">
          <form
            action={setUserRoleAction}
            className="flex flex-wrap items-end gap-2"
          >
            <input type="hidden" name="userId" value={user.id} />
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">
                New role
              </label>
              <select
                name="role"
                defaultValue={user.role}
                className="rounded-md border border-border bg-card px-3 py-2 text-sm"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-md bg-foreground text-background px-4 py-2 text-sm hover:opacity-90"
            >
              Update role
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Set ke PREMIUM otomatis bikin Subscription kalau belum ada (30 hari).
            Demoting tidak auto-cancel — gunakan modul Subscriptions.
          </p>
        </ActionCard>
        <ActionCard title="Grant Premium manual">
          <form
            action={grantPremiumAction}
            className="flex flex-wrap items-end gap-2"
          >
            <input type="hidden" name="userId" value={user.id} />
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">
                Days
              </label>
              <input
                type="number"
                name="days"
                defaultValue={30}
                min={1}
                max={365}
                className="w-28 rounded-md border border-border bg-card px-3 py-2 text-sm tabular-nums"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-[var(--gold)] text-background px-4 py-2 text-sm hover:opacity-90"
            >
              Grant
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Additive — kalau Premium aktif, hari ditambah ke expiresAt
            sekarang. Kalau expired/none, mulai dari sekarang.
          </p>
        </ActionCard>
      </section>

      {/* Orders */}
      <section>
        <h2 className="text-sm font-medium text-foreground mb-3">
          Order history ({orders.length})
        </h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-xs text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Midtrans ID</th>
                  <th className="text-left px-4 py-3 font-medium">Plan</th>
                  <th className="text-right px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Paid at</th>
                  <th className="text-left px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                      Belum ada order.
                    </td>
                  </tr>
                )}
                {orders.map((o) => (
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
      </section>

      {/* Attempts */}
      <section>
        <h2 className="text-sm font-medium text-foreground mb-3">
          Tryout terakhir ({attempts.length})
        </h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-xs text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Mode</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Score</th>
                  <th className="text-left px-4 py-3 font-medium">Lulus</th>
                  <th className="text-left px-4 py-3 font-medium">Started</th>
                  <th className="text-left px-4 py-3 font-medium">Finished</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {attempts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                      Belum pernah tryout.
                    </td>
                  </tr>
                )}
                {attempts.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3">{a.mode}</td>
                    <td className="px-4 py-3">{a.status}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {a.totalScore ?? "—"}
                    </td>
                    <td className="px-4 py-3">{a.passingStatus ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">
                      {formatDateTime(a.startedAt)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">
                      {a.finishedAt ? formatDateTime(a.finishedAt) : "—"}
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
    <div className="flex items-center justify-between py-1.5 text-sm first:pt-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function OrderStatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PAID: "border-[var(--gold)]/40 text-[var(--gold)] bg-[var(--gold)]/[0.08]",
    PENDING: "border-blue-300/40 text-blue-700 bg-blue-50",
    EXPIRED: "border-border text-muted-foreground bg-secondary",
    FAILED: "border-destructive/40 text-destructive bg-destructive/5",
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
