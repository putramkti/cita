import { redirect } from "next/navigation";
import { ArrowLeft, Sparkles, Receipt, Tag } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getCurrentPlan } from "@/lib/billing/get-plan";
import { PLANS, PREMIUM_DURATION_DAYS } from "@/lib/billing/plans";
import { getDict } from "@/lib/i18n";
import { CheckoutForm } from "./checkout-form";

export const dynamic = "force-dynamic";

interface CheckoutPageProps {
  searchParams?: Promise<{ voucher?: string }>;
}

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/checkout");

  const t = await getDict();
  const isEn = t.locale === "en";

  const currentPlan = await getCurrentPlan(user.id);
  if (currentPlan === "PREMIUM") {
    // Already Premium → bounce back to billing.
    redirect("/akun/billing?status=already_premium");
  }

  const sp = (await searchParams) ?? {};
  const initialVoucher = sp.voucher?.trim().toUpperCase() ?? "";

  const planMeta = PLANS.PREMIUM;
  const listPriceIdr = planMeta.priceIdr;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-10">
          {/* Back link + heading */}
          <div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="size-4" strokeWidth={1.5} />
              {isEn ? "Back to pricing" : "Kembali ke harga"}
            </Link>
            <p className="label-caps mb-3">
              {isEn ? "CHECKOUT" : "CHECKOUT"}
            </p>
            <h1 className="serif text-4xl tracking-tight text-foreground leading-tight">
              {isEn
                ? "Confirm your Premium upgrade"
                : "Konfirmasi langganan Premium"}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xl">
              {isEn
                ? "Review your order, apply a voucher if you have one, then proceed to payment."
                : "Periksa pesanan Anda, gunakan voucher jika ada, lalu lanjut ke pembayaran."}
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Order summary */}
            <aside className="lg:col-span-2 order-2 lg:order-1 space-y-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Receipt
                    className="size-4 text-muted-foreground"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <p className="label-caps">
                    {isEn ? "ORDER SUMMARY" : "RINGKASAN PESANAN"}
                  </p>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">
                      {isEn ? planMeta.labelEn : planMeta.labelId} ·{" "}
                      {PREMIUM_DURATION_DAYS}{" "}
                      {isEn ? "days" : "hari"}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {isEn ? planMeta.taglineEn : planMeta.taglineId}
                    </p>
                  </div>
                  <div className="border-t border-border pt-3 flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {isEn ? "Subtotal" : "Subtotal"}
                    </span>
                    <span className="tabular-nums">
                      Rp {listPriceIdr.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/40 p-5 text-xs text-muted-foreground space-y-2 leading-relaxed">
                <p>
                  {isEn
                    ? "Payment is processed by Midtrans. Cita does not store your card or e-wallet credentials."
                    : "Pembayaran diproses Midtrans. Cita tidak menyimpan data kartu atau e-wallet Anda."}
                </p>
                <p>
                  {isEn
                    ? "After payment, your subscription activates automatically."
                    : "Setelah pembayaran berhasil, langganan otomatis aktif."}
                </p>
              </div>
            </aside>

            {/* Voucher + pay form */}
            <section className="lg:col-span-3 order-1 lg:order-2">
              <div className="rounded-xl border border-border bg-card p-6 sm:p-7">
                <div className="flex items-center gap-2 mb-4">
                  <Tag
                    className="size-4 text-muted-foreground"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <p className="label-caps">
                    {isEn ? "VOUCHER" : "KODE VOUCHER"}
                  </p>
                </div>

                <CheckoutForm
                  locale={t.locale as "id" | "en"}
                  listPriceIdr={listPriceIdr}
                  initialVoucher={initialVoucher}
                  email={user.email ?? null}
                />
              </div>

              <p className="mt-4 text-xs text-muted-foreground inline-flex items-center gap-1.5 px-1">
                <Sparkles className="size-3.5" strokeWidth={1.5} aria-hidden />
                {isEn
                  ? "Have a code? Apply it before paying — discount is shown live."
                  : "Punya kode? Masukkan sebelum membayar — potongan tampil langsung."}
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
