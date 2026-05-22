import { Suspense } from "react";
import { getOverviewStats, getDailySeries } from "@/lib/admin/stats";
import { formatIdr } from "@/lib/admin/format";
import { DailyBars } from "./_components/daily-bars";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [stats, daily] = await Promise.all([
    getOverviewStats(),
    getDailySeries(7),
  ]);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="serif text-3xl text-foreground leading-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Snapshot Cita realtime — direfresh setiap kunjungan halaman.
        </p>
      </header>

      {/* Top stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Pengguna terdaftar"
          value={
            stats.users.total - stats.users.anon
          }
          sub={`+${stats.users.newToday} hari ini · +${stats.users.new7d} dlm 7 hari`}
        />
        <StatCard
          label="Premium aktif"
          value={stats.users.premium}
          sub={`${stats.billing.activeSubscriptions} subscription ACTIVE`}
        />
        <StatCard
          label="Pendapatan 30 hari"
          value={formatIdr(stats.billing.revenueIdr30d)}
          sub={`${formatIdr(stats.billing.revenueIdr7d)} (7d) · ${formatIdr(stats.billing.revenueIdrToday)} (today)`}
        />
        <StatCard
          label="Tryout 7 hari"
          value={stats.attempts.sevenDays}
          sub={`${stats.attempts.today} hari ini · ${stats.attempts.inProgress} in-progress`}
        />
      </section>

      {/* Tutor + billing */}
      <section className="grid lg:grid-cols-2 gap-3">
        <Panel title="Cita Tutor">
          <Row label="Pesan tutor (hari ini)" value={stats.tutor.msgsToday} />
          <Row label="Pesan tutor (7 hari)" value={stats.tutor.msgs7d} />
          <Row
            label="User aktif tutor (hari ini)"
            value={stats.tutor.activeUsersToday}
          />
        </Panel>
        <Panel title="Billing">
          <Row
            label="Order paid (hari ini)"
            value={`${stats.billing.paidOrdersToday} · ${formatIdr(stats.billing.revenueIdrToday)}`}
          />
          <Row
            label="Order paid (7 hari)"
            value={`${stats.billing.paidOrders7d} · ${formatIdr(stats.billing.revenueIdr7d)}`}
          />
          <Row
            label="Order pending"
            value={stats.billing.pendingOrders}
            highlight={stats.billing.pendingOrders > 0}
          />
          <Row
            label="Subscription expired"
            value={stats.billing.expiredSubscriptions}
          />
          <Row
            label="Subscription cancelled"
            value={stats.billing.cancelledSubscriptions}
          />
        </Panel>
      </section>

      {/* Charts */}
      <section>
        <h2 className="text-sm font-medium text-foreground mb-3">
          Aktivitas 7 hari terakhir
        </h2>
        <Suspense fallback={null}>
          <DailyBars data={daily} />
        </Suspense>
      </section>

      {/* User breakdown */}
      <section>
        <h2 className="text-sm font-medium text-foreground mb-3">
          Distribusi role
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <RoleCard label="Anonymous" value={stats.users.anon} />
          <RoleCard label="Registered" value={stats.users.registered} />
          <RoleCard label="Premium" value={stats.users.premium} accent />
          <RoleCard label="Moderator" value={stats.users.moderator} />
          <RoleCard label="Admin" value={stats.users.admin} />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="serif text-2xl text-foreground mt-2 tabular-nums">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          {sub}
        </p>
      )}
    </div>
  );
}

function Panel({
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

function Row({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 text-sm first:pt-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          highlight
            ? "tabular-nums text-[var(--gold)] font-medium"
            : "tabular-nums text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}

function RoleCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? "rounded-lg border border-[var(--gold)]/40 bg-[var(--gold)]/5 px-4 py-3"
          : "rounded-lg border border-border bg-card px-4 py-3"
      }
    >
      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-xl text-foreground mt-1 tabular-nums">{value}</p>
    </div>
  );
}
