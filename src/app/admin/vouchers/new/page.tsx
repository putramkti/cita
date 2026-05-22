import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VoucherNewForm } from "./voucher-new-form";

export const dynamic = "force-dynamic";

export default function NewVoucherPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/vouchers"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.5} />
        Kembali ke daftar voucher
      </Link>

      <header>
        <h1 className="serif text-3xl text-foreground leading-tight">
          Buat voucher
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-xl">
          Voucher berlaku untuk plan Premium. Diskon bisa berupa persen
          atau nominal rupiah. Kode aktif segera setelah disimpan.
        </p>
      </header>

      <VoucherNewForm />
    </div>
  );
}
