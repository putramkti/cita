import { cn } from "@/lib/utils"

/**
 * Cita academic logo — Academic Zen design source.
 *
 * Circle arc (Ink Blue) suggests scholarly cycle / continuity.
 * Clock hand (Academic Gold) signals study-time discipline.
 * Pin dot (gold) marks aspiration / a fixed cita-cita target.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("size-8", className)}
    >
      <path
        d="M20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35C28.2843 35 35 28.2843 35 20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M20 12V20L25 23"
        stroke="var(--gold)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="12" r="3" fill="var(--gold)" />
    </svg>
  )
}
