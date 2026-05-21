import Link from "next/link";
import type { Metadata } from "next";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Cek email · Cita",
  description: "Tautan masuk telah dikirim ke email Anda.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ email?: string }>;
};

export default async function CheckEmailPage({ searchParams }: Props) {
  const { email } = await searchParams;
  const safeEmail = email ? decodeURIComponent(email) : null;

  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-md flex-col justify-center px-4 py-12 text-center sm:px-8">
      <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-muted">
        <Mail className="size-7 text-foreground" aria-hidden="true" />
      </div>
      <h1 className="serif text-3xl font-medium tracking-tight">Cek email Anda</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Kami mengirim tautan masuk ke{" "}
        {safeEmail ? (
          <span className="font-medium text-foreground">{safeEmail}</span>
        ) : (
          <span className="font-medium text-foreground">email Anda</span>
        )}
        . Klik tautan di email untuk masuk ke Cita.
      </p>
      <ul className="mt-6 space-y-2 text-left text-xs text-muted-foreground">
        <li>· Tautan berlaku selama 1 jam.</li>
        <li>· Cek folder spam jika tidak masuk dalam 2 menit.</li>
        <li>· Buka tautan di peramban yang sama dengan saat meminta.</li>
      </ul>
      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/auth/login"
          className="text-sm text-foreground underline-offset-4 hover:underline"
        >
          Kirim ulang ke email lain
        </Link>
        <Link
          href="/"
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}
