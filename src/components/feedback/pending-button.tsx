"use client"

import { ButtonHTMLAttributes, ReactNode } from "react"
import { useFormStatus } from "react-dom"
import { cn } from "@/lib/utils"

/**
 * Pending-aware submit button — Academic Zen.
 *
 * Drop-in replacement for a plain <button type="submit"> inside a
 * <form action={serverAction}>. While the action is in flight, the
 * button:
 *   - swaps its label for a spinner + loading copy
 *   - sets aria-busy="true"
 *   - disables itself + applies a subdued style
 *
 * Uses React 19 / Next.js' useFormStatus, so it MUST be rendered as
 * a child of a <form> element. For non-form actions (plain links,
 * client click handlers) use <ActionButton/> below instead.
 */
export function PendingButton({
  children,
  loadingLabel,
  className,
  variant = "primary",
  ...rest
}: {
  children: ReactNode
  loadingLabel?: ReactNode
  variant?: "primary" | "secondary" | "ghost"
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending || rest.disabled}
      aria-busy={pending || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium",
        "transition-colors disabled:pointer-events-none disabled:opacity-70",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3",
        variant === "secondary" &&
          "bg-secondary text-foreground hover:bg-secondary/80 px-5 py-2.5",
        variant === "ghost" &&
          "text-foreground hover:bg-secondary px-3 py-2",
        className,
      )}
      {...rest}
    >
      {pending ? (
        <>
          <span className="zen-spinner" aria-hidden="true" />
          <span>{loadingLabel ?? "Memproses…"}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

/**
 * Action-pending button for non-form click handlers — drives its
 * pending state from a client useTransition() boolean passed in.
 *
 * Example:
 *   const [pending, start] = useTransition()
 *   <ActionButton pending={pending} onClick={() => start(() => doThing())}>
 *     Submit
 *   </ActionButton>
 */
export function ActionButton({
  pending,
  children,
  loadingLabel,
  className,
  variant = "primary",
  ...rest
}: {
  pending: boolean
  children: ReactNode
  loadingLabel?: ReactNode
  variant?: "primary" | "secondary" | "ghost" | "destructive"
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">) {
  return (
    <button
      type="button"
      disabled={pending || rest.disabled}
      aria-busy={pending || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium",
        "transition-colors disabled:pointer-events-none disabled:opacity-70",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3",
        variant === "secondary" &&
          "bg-secondary text-foreground hover:bg-secondary/80 px-5 py-2.5",
        variant === "ghost" &&
          "text-foreground hover:bg-secondary px-3 py-2",
        variant === "destructive" &&
          "bg-[var(--error-fg)] text-white hover:opacity-90 px-5 py-2.5",
        className,
      )}
      {...rest}
    >
      {pending ? (
        <>
          <span className="zen-spinner" aria-hidden="true" />
          <span>{loadingLabel ?? "Memproses…"}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
