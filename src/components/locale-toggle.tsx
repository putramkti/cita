"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Languages } from "lucide-react"
import { cn } from "@/lib/utils"

interface LocaleToggleProps {
  current: "id" | "en"
  className?: string
  ariaLabel?: string
}

export function LocaleToggle({ current, className, ariaLabel = "Bahasa / Language" }: LocaleToggleProps) {
  const router = useRouter()
  const [pending, setPending] = React.useState(false)

  const switchTo = (next: "id" | "en") => {
    if (next === current || pending) return
    setPending(true)
    // Set cookie (1 year, root path)
    document.cookie = `cita_locale=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    router.refresh()
    // small async to let server re-render
    setTimeout(() => setPending(false), 600)
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md border border-border/60 p-0.5 text-xs",
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <Languages className="size-3.5 ml-1.5 mr-0.5 text-muted-foreground" />
      <button
        type="button"
        onClick={() => switchTo("id")}
        className={cn(
          "px-2 py-1 rounded transition-colors font-medium",
          current === "id"
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/40",
        )}
        aria-pressed={current === "id"}
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => switchTo("en")}
        className={cn(
          "px-2 py-1 rounded transition-colors font-medium",
          current === "en"
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/40",
        )}
        aria-pressed={current === "en"}
      >
        EN
      </button>
    </div>
  )
}
