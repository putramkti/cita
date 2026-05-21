"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string };

interface MobileMenuProps {
  navLinks: NavLink[];
  loginLabel: string;
  logoutLabel: string;
  accountLabel: string;
  user: {
    label: string;
    role: string;
  } | null;
  closeLabel?: string;
}

/**
 * Mobile-only hamburger menu. Hidden on md+ (header nav handles desktop there).
 *
 * Click button → slide-down full-width panel below the header.
 * Auto-closes on route change. Body scroll locked while open.
 *
 * Auth state injected from server (RSC parent reads cookies/session).
 */
export function MobileMenu({
  navLinks,
  loginLabel,
  logoutLabel,
  accountLabel,
  user,
  closeLabel = "Tutup menu",
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "md:hidden inline-flex items-center justify-center rounded-md border border-border/60 bg-background size-9 text-foreground hover:border-foreground/40 transition-colors",
        )}
        aria-label={open ? closeLabel : "Buka menu"}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
      >
        {open ? (
          <X className="size-4" strokeWidth={1.75} />
        ) : (
          <Menu className="size-4" strokeWidth={1.75} />
        )}
      </button>

      {/* Backdrop + panel */}
      {open && (
        <div
          className="md:hidden fixed inset-0 top-16 z-30"
          aria-hidden={!open}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label={closeLabel}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-background/40 backdrop-blur-[2px]"
          />

          {/* Panel */}
          <div
            id="mobile-menu-panel"
            role="dialog"
            aria-modal="true"
            className="relative mx-auto max-w-6xl px-4 sm:px-8"
          >
            <div className="rounded-b-xl border border-t-0 border-border bg-card shadow-lg overflow-hidden animate-in slide-in-from-top-2 duration-200">
              <nav className="flex flex-col">
                {navLinks.map((link) => {
                  const active =
                    pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "px-5 py-4 text-base border-b border-border/60 last:border-b-0 transition-colors",
                        active
                          ? "text-foreground font-medium bg-secondary/40"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/30",
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                {/* Auth section */}
                <div className="border-t-2 border-border/60 bg-muted/40">
                  {user ? (
                    <>
                      <div className="px-5 py-3.5">
                        <div className="text-sm font-medium text-foreground">
                          {user.label}
                        </div>
                        <div className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider mt-0.5">
                          {user.role}
                        </div>
                      </div>
                      <Link
                        href="/akun"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-5 py-3.5 text-sm text-muted-foreground hover:text-foreground border-t border-border/60 transition-colors"
                      >
                        <User className="size-4" strokeWidth={1.5} />
                        {accountLabel}
                      </Link>
                      <a
                        href="/auth/logout"
                        className="flex items-center gap-3 px-5 py-3.5 text-sm text-muted-foreground hover:text-foreground border-t border-border/60 transition-colors"
                      >
                        <LogOut className="size-4" strokeWidth={1.5} />
                        {logoutLabel}
                      </a>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-5 py-4 text-sm text-foreground transition-colors hover:bg-secondary/40"
                    >
                      <LogIn className="size-4" strokeWidth={1.5} />
                      {loginLabel}
                    </Link>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
