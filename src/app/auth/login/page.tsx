import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-user";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk · Cita",
  description:
    "Masuk ke Cita untuk menyimpan progres, melanjutkan tryout, dan membuka fitur premium.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  const user = await getCurrentUser();
  if (user) {
    redirect(next || "/");
  }

  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-8">
      <header className="mb-8 text-center">
        <h1 className="serif text-3xl font-medium tracking-tight">
          Masuk ke Cita
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Simpan progres latihan Anda. Tanpa kata sandi — kami kirim tautan ajaib
          ke email.
        </p>
      </header>

      {error && (
        <div className="mb-6 rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
          {decodeURIComponent(error)}
        </div>
      )}

      <LoginForm nextPath={next ?? "/"} />

      <footer className="mt-8 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
        <p>
          Dengan masuk, Anda menyetujui{" "}
          <Link
            href="/persyaratan"
            className="underline-offset-4 hover:underline"
          >
            Syarat & Ketentuan
          </Link>{" "}
          dan{" "}
          <Link href="/privacy" className="underline-offset-4 hover:underline">
            Kebijakan Privasi
          </Link>{" "}
          Cita.
        </p>
      </footer>
    </main>
  );
}
