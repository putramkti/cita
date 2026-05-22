import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Tiny "Premium" badge for headers, leaderboard, profile.
 *
 * Two sizes: "sm" inline (text rows, headers) and "md" pill (cards).
 *
 * Render conditionally based on entitlement flag — never render on FREE
 * profiles. Server-decided to avoid a flash on load.
 */
export function PremiumBadge({
  size = "sm",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  if (size === "sm") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-foreground text-background text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5",
          className,
        )}
        aria-label="Premium"
      >
        <Sparkles className="size-2.5" strokeWidth={2.5} aria-hidden />
        Premium
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-foreground text-background text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1",
        className,
      )}
      aria-label="Premium"
    >
      <Sparkles className="size-3" strokeWidth={2.5} aria-hidden />
      Premium
    </span>
  );
}
