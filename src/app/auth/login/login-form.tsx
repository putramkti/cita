"use client";

import { useState, useTransition } from "react";
import { sendMagicLink, signInWithGoogle } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  nextPath: string;
};

export function LoginForm({ nextPath }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isMagicPending, startMagicTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();

  const handleMagicSubmit = (formData: FormData) => {
    setError(null);
    formData.append("next", nextPath);
    startMagicTransition(async () => {
      const result = await sendMagicLink(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  const handleGoogle = () => {
    setError(null);
    startGoogleTransition(async () => {
      const result = await signInWithGoogle();
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  const isPending = isMagicPending || isGooglePending;

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      {/* Google OAuth */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogle}
        disabled={isPending}
      >
        <svg
          aria-hidden="true"
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M22.5 12.27c0-.78-.07-1.54-.2-2.27H12v4.3h5.93c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.21-4.74 3.21-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.29-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.12A6.6 6.6 0 0 1 5.5 12c0-.74.13-1.45.34-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.96l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
            fill="#EA4335"
          />
        </svg>
        {isGooglePending ? "Mengalihkan…" : "Masuk dengan Google"}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground">atau</span>
        </div>
      </div>

      {/* Magic link */}
      <form action={handleMagicSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="anda@email.com"
            disabled={isPending}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isMagicPending ? "Mengirim tautan…" : "Kirim tautan ajaib"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Tidak ada kata sandi. Anda akan menerima tautan sekali pakai di email.
      </p>
    </div>
  );
}
