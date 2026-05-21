import { Suspense } from "react";
import Script from "next/script";
import { getPublicMidtransConfig } from "@/lib/billing/midtrans";

/**
 * Snap.js loader. Mounted in the root layout so any page can call
 * window.snap.pay(token) without re-loading the script.
 *
 * Sandbox vs Production URL is decided server-side from
 * MIDTRANS_IS_PRODUCTION. Client only sees the resolved URL + client key.
 */
export function MidtransSnapScript() {
  const cfg = getPublicMidtransConfig();
  if (!cfg.clientKey) {
    // No client key set yet — skip loading. Pricing page handles 503s.
    return null;
  }
  return (
    <Suspense fallback={null}>
      <Script
        src={cfg.snapJsUrl}
        data-client-key={cfg.clientKey}
        strategy="lazyOnload"
      />
    </Suspense>
  );
}
