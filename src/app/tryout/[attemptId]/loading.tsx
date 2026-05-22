import { SiteHeader } from "@/components/layout/site-header";

export default function TryoutAttemptLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 order-2 lg:order-1">
            <div className="rounded-xl border border-border bg-card p-5 h-96 animate-pulse" />
          </aside>
          <article className="lg:col-span-7 order-1 lg:order-2">
            <div className="rounded-xl border border-border bg-card px-6 py-7 sm:px-10 sm:py-10 h-[28rem] animate-pulse" />
          </article>
          <aside className="lg:col-span-2 order-3">
            <div className="rounded-xl border border-border bg-card p-3 h-72 animate-pulse" />
          </aside>
        </div>
      </main>
    </>
  );
}
