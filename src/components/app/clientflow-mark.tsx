import { cn } from "@/lib/utils"

export function ClientFlowMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="ClientFlow"
      className={cn("size-full", className)}
    >
      <rect width="64" height="64" rx="14" fill="#2d8a68" />
      <rect
        x="1"
        y="1"
        width="62"
        height="62"
        rx="13"
        fill="none"
        stroke="#ffffff"
        strokeOpacity=".16"
        strokeWidth="2"
      />
      <path
        d="M16 43c0-8 5-13 13-12 9 1 13-4 18-13"
        fill="none"
        stroke="#f4f7f5"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="43" r="5" fill="#f4f7f5" />
      <circle
        cx="30"
        cy="31"
        r="5"
        fill="#2d8a68"
        stroke="#f4f7f5"
        strokeWidth="3.5"
      />
      <circle
        cx="47"
        cy="18"
        r="6"
        fill="#e4b65b"
        stroke="#236f55"
        strokeWidth="2"
      />
    </svg>
  )
}
