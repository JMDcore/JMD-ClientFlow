import { Badge } from "@/components/ui/badge"
import {
  CLIENT_STATUS_CONFIG,
  PRIORITY_CONFIG,
  STAGE_CONFIG,
} from "@/lib/constants"
import type { ClientStatus, OpportunityStage, Priority } from "@/lib/types"
import { cn } from "@/lib/utils"

export function StageBadge({
  stage,
  className,
}: {
  stage: OpportunityStage
  className?: string
}) {
  const config = STAGE_CONFIG[stage]
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 gap-1.5 rounded-md px-1.5 text-[10px]",
        config.badgeClass,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.dotClass)} />
      {config.shortLabel}
    </Badge>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = PRIORITY_CONFIG[priority]
  return (
    <Badge
      variant="outline"
      className={cn("h-5 rounded-md px-1.5 text-[10px]", config.badgeClass)}
    >
      {config.label}
    </Badge>
  )
}

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  const config = CLIENT_STATUS_CONFIG[status]
  return (
    <Badge
      variant="outline"
      className={cn("h-5 rounded-md px-1.5 text-[10px]", config.badgeClass)}
    >
      {config.label}
    </Badge>
  )
}
