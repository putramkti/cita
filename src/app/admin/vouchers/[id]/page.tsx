import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getVoucherDetail } from "@/lib/admin/vouchers";
import { formatDate, formatDateTime, formatIdr } from "@/lib/admin/format";
import { VoucherEditForm } from "./voucher-edit-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminVoucherDetailPage({ params }: PageProps) {
  const { id } = await params;
  const voucher = await getVoucherDetail(id);
  if (!voucher) notFound();

  return (
    <div className="space-y-8">
      <Link
        href="/admin/vouchers"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.5} />
        Kembali ke daftar voucher
      </Link>

      <header>
        <p className="label-caps mb-2">VOUCHER</p>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="serif text-3xl text-foreground leading-tight font-mono">
            {voucher.code}
          </h1>
          {!voucher.isActive && (
            <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground bg-muted">
              Nonaktif
            </span>
          )}
          {voucher.validUntil < new Date() && (
            <span className="text-xs px-2 py-0.5 rounded-full border border-amber-300/40 text-amber-700 bg-amber-50">
              Expired
            </span>
          )}
        </div>
        {voucher.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {voucher.description}
          </p>
        )}
      </header>

      {/* Stat cards */}
      <section className="grid sm:grid-cols-3 gap-3">
        <StatCard
          label="Diskon"
          value={
            voucher.discountType === "PERCENTAGE"
              ? `${voucher.discountValue}%`
              : `Rp ${voucher.discountValue.toLocaleString("id-ID")}`
          }
          hint={voucher.discountType === "PERCENTAGE" ? "Persen" : "Nominal"}
        />
        <StatCard
          label="Redemption"
          value={
            voucher.maxRedemptions
              ? `${voucher.redemptionsCount} / ${voucher.maxRedemptions}`
              : `${voucher.redemptionsCount}`
          }
          hint={voucher.maxRedemptions ? "dari cap global" : "tanpa cap"}
        />
        <StatCard
          label="Berlaku sampai"
          value={formatDate(voucher.validUntil)}
          hint={`Mulai ${formatDate(voucher.validFrom)}`}
        />
      </section>

      {/* Edit form */}
      <section>
        <h2 className="text-sm font-medium text-foreground mb-3">
          Edit konfigurasi
        </h2>
        <VoucherEditForm
          voucherId={voucher.id}
          defaults={{
            description: voucher.description,
            validUntil: voucher.validUntil,
            maxRedemptions: voucher.maxRedemptions,
            maxPerUser: voucher.maxPerUser,
            minPurchase: voucher.minPurchase,
            isActive: voucher.isActive,
          }}
          redemptionsCount={voucher.redemptionsCount}
        />
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          Kode dan nilai diskon tidak dapat diubah setelah voucher dibuat,
          untuk menjaga catatan redemption tetap akurat. Untuk diskon
          berbeda, nonaktifkan voucher ini lalu buat yang baru.
        </p>
      </section>

      {/* Redemptions */}
      <section>
        <h2 className="text-sm font-medium text-foreground mb-3">
          Riwayat redemption ({voucher.redemptionsCount})
        </h2>
        {voucher.redemptions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            Belum ada user yang memakai voucher ini.
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <ul className="divide-y divide-border">
              {voucher.redemptions.map((r) => (
                <li
                  key={r.id}
                  className="px-4 py-3.5 flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {r.userEmail ?? r.userId}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                      {formatDateTime(r.redeemedAt)}
                    </p>
                  </div>
                  <div className="text-right tabular-nums">
                    <p className="text-foreground">
                      {formatIdr(r.originalAmount)} → {formatIdr(r.finalAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      hemat {formatIdr(r.discountAmount)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="serif text-2xl text-foreground mt-2 tabular-nums">
        {value}
      </p>
      {hint && (
        <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>
      )}
    </div>
  );
}
