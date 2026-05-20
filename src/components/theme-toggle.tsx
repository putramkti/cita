"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
  labelDark?: string
  labelLight?: string
}

export function ThemeToggle({
  className,
  labelDark = "Mode terang",
  labelLight = "Mode gelap",
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  // Prevent hydration mismatch by rendering a stable placeholder until mounted
  const isDark = mounted ? (resolvedTheme ?? theme) === "dark" : true
  const ariaLabel = isDark ? labelDark : labelLight

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md border border-border/60",
        "text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        className,
      )}
    >
      {mounted ? (
        isDark ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )
      ) : (
        <Sun className="size-4 opacity-0" />
      )}
    </button>
  )
}
