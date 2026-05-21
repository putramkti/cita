import { SiteHeader } from "@/components/layout/site-header";

export default function TryoutResultLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center space-y-6">
            <div className="mx-auto h-6 w-40 rounded-full bg-secondary animate-pulse" />
            <div className="mx-auto h-12 w-2/3 rounded bg-secondary animate-pulse" />
            <div className="mx-auto rounded-xl border border-border bg-card h-64 max-w-md animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card h-44 animate-pulse"
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
