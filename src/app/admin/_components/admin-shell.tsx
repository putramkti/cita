"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  BarChart3,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CitaUser } from "@/lib/auth/get-user";

interface AdminShellProps {
  admin: CitaUser;
  children: React.ReactNode;
}

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
  { href: "/admin/orders", label: "Orders", icon: Receipt, exact: false },
  {
    href: "/admin/subscriptions",
    label: "Subscriptions",
    icon: CreditCard,
    exact: false,
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: BarChart3,
    exact: false,
  },
] as const;

export function AdminShell({ admin, children }: AdminShellProps) {
  const pathname = usePathname() ?? "/admin";

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" strokeWidth={1.5} />
              Kembali ke Cita
            </Link>
            <span className="text-muted-foreground/50">·</span>
            <span className="serif text-sm text-foreground inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-[var(--gold)]" strokeWidth={1.5} />
              Admin Panel
            </span>
          </div>
          <div className="text-xs text-muted-foreground tabular-nums">
            {admin.email}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl flex-1 grid lg:grid-cols-[14rem_1fr] gap-6 lg:gap-10 px-4 sm:px-8 py-6 sm:py-10">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible -mx-1 px-1 pb-2 lg:pb-0">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors whitespace-nowrap",
                    active
                      ? "bg-foreground text-background"
                      : "text-foreground/70 hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
