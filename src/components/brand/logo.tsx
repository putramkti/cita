import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("size-8", className)}
    >
      <defs>
        <linearGradient
          id="cita-logo-gradient"
          x1="0"
          y1="0"
          x2="64"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="oklch(0.78 0.13 260)" />
          <stop offset="1" stopColor="oklch(0.82 0.13 220)" />
        </linearGradient>
      </defs>
      <circle
        cx="32"
        cy="32"
        r="28"
        stroke="url(#cita-logo-gradient)"
        strokeWidth="2"
        strokeOpacity="0.55"
      />
      <path
        d="M32 6 L36 28 L58 32 L36 36 L32 58 L28 36 L6 32 L28 28 Z"
        fill="url(#cita-logo-gradient)"
        fillOpacity="0.9"
      />
      <path
        d="M32 14 L34 30 L50 32 L34 34 L32 50 L30 34 L14 32 L30 30 Z"
        fill="oklch(0.13 0.015 265)"
        fillOpacity="0.7"
      />
      <circle cx="32" cy="32" r="3" fill="url(#cita-logo-gradient)" />
    </svg>
  )
}
