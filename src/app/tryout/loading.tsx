import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function TryoutLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center space-y-4">
            <div className="mx-auto h-3 w-32 rounded bg-secondary animate-pulse" />
            <div className="mx-auto h-12 w-2/3 rounded bg-secondary animate-pulse" />
            <div className="mx-auto h-4 w-1/2 rounded bg-secondary animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-7 h-80 animate-pulse"
              />
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
