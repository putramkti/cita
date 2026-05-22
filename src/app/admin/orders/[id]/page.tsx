import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderDetail } from "@/lib/admin/orders";
import { formatDateTime, formatIdr, truncateMiddle } from "@/lib/admin/format";
import { syncOrderAction } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getOrderDetail(id);
  if (!data) notFound();

  const { order, user } = data;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Link
          href="/admin/orders"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← Kembali ke daftar
        </Link>
        <h1 className="serif text-3xl text-foreground leading-tight">
          {order.midtransOrderId}
        </h1>
        <p className="text-sm text-muted-foreground tabular-nums">
          internal id {truncateMiddle(order.id, 14, 4)} · plan {order.plan} · {formatIdr(order.amount)}
        </p>
      </header>

      <section className="grid lg:grid-cols-3 gap-3">
        <Card title="Order">
          <Row label="Status" value={order.status} />
          <Row label="Plan" value={order.plan} />
          <Row label="Amount" value={formatIdr(order.amount)} />
          <Row label="Duration" value={`${order.durationDays} hari`} />
          <Row label="Created" value={formatDateTime(order.createdAt)} />
          <Row
            label="Paid at"
            value={order.paidAt ? formatDateTime(order.paidAt) : "—"}
          />
          <Row
            label="Expired at"
            value={order.expiredAt ? formatDateTime(order.expiredAt) : "—"}
          />
          <Row
            label="Midtrans tx id"
            value={order.midtransTxId ?? "—"}
          />
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
              <Row
                label="User id"
                value={truncateMiddle(user.id, 14, 4)}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">User dihapus.</p>
          )}
        </Card>
        <Card title="Subscription">
          {order.subscription ? (
            <>
              <Row label="Plan" value={order.subscription.plan} />
              <Row label="Status" value={order.subscription.status} />
              <Row
                label="Started"
                value={formatDateTime(order.subscription.startedAt)}
              />
              <Row
                label="Expires"
                value={
                  order.subscription.expiresAt
                    ? formatDateTime(order.subscription.expiresAt)
                    : "—"
                }
              />
              <Row
                label="Sub id"
                value={truncateMiddle(order.subscription.id, 14, 4)}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Belum terhubung ke Subscription. Akan auto-link saat status jadi PAID.
            </p>
          )}
        </Card>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-foreground mb-2">
          Sync dengan Midtrans
        </h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Tarik status terbaru langsung dari Midtrans Status API. Kalau order
          sudah <code className="text-foreground">settlement</code> di Midtrans
          tapi DB kita masih PENDING (mis. webhook URL belum ke-set), klik ini
          untuk apply transition + bikin Subscription. Idempotent.
        </p>
        <form action={syncOrderAction} className="flex items-center gap-3">
          <input type="hidden" name="orderId" value={order.id} />
          <button
            type="submit"
            className="rounded-md bg-foreground text-background px-4 py-2 text-sm hover:opacity-90"
          >
            Sync from Midtrans
          </button>
        </form>
      </section>

      {order.raw && (
        <section>
          <h3 className="text-sm font-medium text-foreground mb-2">
            Raw payload (last)
          </h3>
          <pre className="rounded-xl border border-border bg-secondary p-4 text-xs text-muted-foreground overflow-x-auto">
            {JSON.stringify(order.raw, null, 2)}
          </pre>
        </section>
      )}
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
