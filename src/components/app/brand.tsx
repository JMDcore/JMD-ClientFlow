import { Waypoints } from "lucide-react"

import { cn } from "@/lib/utils"

export function Brand({
  compact = false,
  inverted = false,
  className,
}: {
  compact?: boolean
  inverted?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="bg-primary text-primary-foreground relative grid size-9 shrink-0 place-items-center rounded-lg shadow-[0_4px_12px_rgba(11,88,62,0.22)] ring-1 ring-white/10">
        <Waypoints className="size-[19px]" strokeWidth={2.15} />
        <span
          className={cn(
            "absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 bg-[#e7b34b]",
            inverted ? "border-sidebar" : "border-card",
          )}
        />
      </span>
      {!compact && (
        <span className="leading-none">
          <span
            className={cn(
              "block text-[15px] font-semibold",
              inverted ? "text-white" : "text-foreground",
            )}
          >
            ClientFlow
          </span>
          <span
            className={cn(
              "mt-1.5 block text-[9px] font-semibold tracking-[0.09em] uppercase",
              inverted ? "text-[#8f9c96]" : "text-muted-foreground",
            )}
          >
            JMD · Client ops
          </span>
        </span>
      )}
    </div>
  )
}
