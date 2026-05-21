import Link from "next/link";
import { listUsers } from "@/lib/admin/users";
import { formatDate, formatDateTime, truncateMiddle } from "@/lib/admin/format";
import type { Role } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    role?: string;
    showAnon?: string;
    page?: string;
  }>;
}

const ROLE_FILTERS: Array<{ value: Role | "ALL"; label: string }> = [
  { value: "ALL", label: "Semua" },
  { value: "REGISTERED", label: "Registered" },
  { value: "PREMIUM", label: "Premium" },
  { value: "MODERATOR", label: "Moderator" },
  { value: "ADMIN", label: "Admin" },
];

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const role = (sp.role ?? "ALL") as Role | "ALL";
  const showAnon = sp.showAnon === "1";
  const page = Number(sp.page ?? 1);

  const result = await listUsers({ q, role, showAnon, page, pageSize: 25 });
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="serif text-3xl text-foreground leading-tight">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Total {result.total} user (filtered).
        </p>
      </header>

      {/* Filters */}
      <form
        method="get"
        className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-4"
      >
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="q"
            className="block text-xs text-muted-foreground mb-1.5"
          >
            Cari email / nama / id
          </label>
          <input
            type="text"
            name="q"
            id="q"
            defaultValue={q}
            placeholder="putramukti@..."
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>
        <div>
          <label
            htmlFor="role"
            className="block text-xs text-muted-foreground mb-1.5"
          >
            Role
          </label>
          <select
            name="role"
            id="role"
            defaultValue={role}
            className="rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
          >
            {ROLE_FILTERS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            name="showAnon"
            value="1"
            defaultChecked={showAnon}
          />
          Tampilkan anonymous
        </label>
        <button
          type="submit"
          className="rounded-md bg-foreground text-background px-4 py-2 text-sm hover:opacity-90 transition-opacity"
        >
          Apply
        </button>
        {(q || role !== "ALL" || showAnon) && (
          <Link
            href="/admin/users"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Reset
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Sub</th>
                <th className="text-right px-4 py-3 font-medium">Tryouts</th>
                <th className="text-right px-4 py-3 font-medium">Paid</th>
                <th className="text-left px-4 py-3 font-medium">Joined</th>
                <th className="text-right px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.rows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    Belum ada user yang cocok filter.
                  </td>
                </tr>
              )}
              {result.rows.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-secondary/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-foreground">
                        {u.displayName ?? u.email ?? "(no name)"}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {u.email ?? truncateMiddle(u.id, 12, 4)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RolePill role={u.role} anon={u.isAnonymous} />
                  </td>
                  <td className="px-4 py-3">
                    {u.subscription ? (
                      <span
                        className={
                          u.subscription.status === "ACTIVE"
                            ? "text-[var(--gold)]"
                            : "text-muted-foreground"
                        }
                      >
                        {u.subscription.plan} · {u.subscription.status}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">
                    {u.attempts}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">
                    {u.paidOrders}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/users/${u.id}`}
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

      {/* Pagination */}
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
  sp: { q?: string; role?: string; showAnon?: string; page?: string },
  page: number,
): string {
  const params = new URLSearchParams();
  if (sp.q) params.set("q", sp.q);
  if (sp.role) params.set("role", sp.role);
  if (sp.showAnon) params.set("showAnon", sp.showAnon);
  params.set("page", String(page));
  return `/admin/users?${params.toString()}`;
}

function RolePill({ role, anon }: { role: Role; anon: boolean }) {
  if (anon) {
    return (
      <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full border border-border bg-secondary text-muted-foreground">
        anon
      </span>
    );
  }
  const colors: Record<Role, string> = {
    REGISTERED: "border-border text-foreground/70 bg-card",
    PREMIUM:
      "border-[var(--gold)]/40 text-[var(--gold)] bg-[var(--gold)]/[0.08]",
    MODERATOR: "border-blue-300/40 text-blue-700 bg-blue-50",
    ADMIN: "border-foreground/40 text-foreground bg-foreground/[0.06]",
  };
  return (
    <span
      className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${colors[role]}`}
    >
      {role}
    </span>
  );
}
