import Link from "next/link";
import { Sparkles, Lock, UserPlus } from "lucide-react";

interface AnonBlurOverlayProps {
  locale: "id" | "en";
  nextPath: string;
}

/**
 * Full-card blur overlay rendered when an anonymous viewer reaches /study.
 *
 * The actual question + chat are rendered behind the overlay (visually
 * teased) while a centered card prompts login or sign-up. After auth,
 * the user lands back on this same study URL via /auth/login?next=...
 */
export function AnonBlurOverlay({ locale, nextPath }: AnonBlurOverlayProps) {
  const loginHref = `/auth/login?next=${encodeURIComponent(nextPath)}`;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="absolute inset-0 z-30 flex items-center justify-center px-4 py-10"
    >
      {/* Backdrop blur — covers the entire study area */}
      <div className="absolute inset-0 backdrop-blur-md bg-background/40" />

      {/* CTA card */}
      <div className="relative max-w-md w-full rounded-xl border border-border bg-card p-8 shadow-lg text-center">
        <div className="inline-flex items-center justify-center size-12 rounded-full bg-foreground/10 mb-5">
          <Lock
            className="size-5 text-foreground"
            strokeWidth={1.5}
            aria-hidden
          />
        </div>
        <p className="label-caps mb-3">
          {locale === "en" ? "TUTOR REQUIRES ACCOUNT" : "TUTOR PERLU AKUN"}
        </p>
        <h2 className="serif text-2xl tracking-tight mb-3">
          {locale === "en"
            ? "Sign in to ask Cita Tutor"
            : "Login dulu untuk pakai Cita Tutor"}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {locale === "en"
            ? "Cita Tutor remembers context across questions and tracks your daily quota — that needs an account."
            : "Cita Tutor mengingat konteks tiap soal dan menghitung kuota harian Anda. Karena itu butuh akun."}
        </p>
        <div className="flex flex-col gap-2.5">
          <Link
            href={loginHref}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="size-4" strokeWidth={1.75} />
            {locale === "en" ? "Sign in" : "Login"}
          </Link>
          <Link
            href={loginHref}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border text-sm font-medium px-4 py-2.5 text-foreground hover:bg-secondary/50 transition-colors"
          >
            <UserPlus className="size-4" strokeWidth={1.75} />
            {locale === "en" ? "Create account" : "Buat akun gratis"}
          </Link>
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          {locale === "en"
            ? "Free tier: 5 tutor messages per day."
            : "Paket gratis: 5 pesan tutor per hari."}
        </p>
      </div>
    </div>
  );
}
