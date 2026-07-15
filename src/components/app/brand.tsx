import { ClientFlowMark } from "@/components/app/clientflow-mark"
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
      <span className="relative grid size-9 shrink-0 place-items-center drop-shadow-[0_4px_10px_rgba(11,88,62,0.24)]">
        <ClientFlowMark />
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
