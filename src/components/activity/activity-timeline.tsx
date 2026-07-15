import {
  ArrowRightLeft,
  CheckCheck,
  Mail,
  MessageSquareText,
  Phone,
  Users,
} from "lucide-react"
import { format, formatDistanceToNow, parseISO } from "date-fns"
import { es } from "date-fns/locale"

import { ACTIVITY_LABELS } from "@/lib/constants"
import type { Activity, ActivityType } from "@/lib/types"
import { cn } from "@/lib/utils"

const activityIcons = {
  note: MessageSquareText,
  email: Mail,
  call: Phone,
  meeting: Users,
  stage: ArrowRightLeft,
  task: CheckCheck,
} satisfies Record<ActivityType, typeof Mail>

const activityTone: Record<ActivityType, string> = {
  note: "bg-[#e0e9f3] text-[#35547f]",
  email: "bg-[#e7e1f0] text-[#665783]",
  call: "bg-[#dcebe5] text-[#0f6247]",
  meeting: "bg-[#f2e9d6] text-[#8a6315]",
  stage: "bg-[#f3e2dc] text-[#a44f39]",
  task: "bg-[#dcebe5] text-[#0f6247]",
}

export function ActivityTimeline({
  activities,
  compact = false,
}: {
  activities: Activity[]
  compact?: boolean
}) {
  const sorted = [...activities].sort(
    (a, b) =>
      parseISO(b.occurredAt).getTime() - parseISO(a.occurredAt).getTime(),
  )

  if (sorted.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center text-sm">
        Todavía no hay actividad registrada.
      </div>
    )
  }

  return (
    <ol className="relative space-y-0">
      {sorted.map((activity, index) => {
        const Icon = activityIcons[activity.type]
        const occurredAt = parseISO(activity.occurredAt)
        return (
          <li key={activity.id} className="relative flex gap-3 pb-5 last:pb-0">
            {index < sorted.length - 1 && (
              <span className="bg-border absolute top-8 bottom-0 left-[15px] w-px" />
            )}
            <span
              className={cn(
                "relative z-10 grid size-8 shrink-0 place-items-center rounded-lg",
                activityTone[activity.type],
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                <p className="text-xs font-semibold">
                  {ACTIVITY_LABELS[activity.type]}
                </p>
                <time
                  dateTime={activity.occurredAt}
                  title={format(occurredAt, "d 'de' MMMM 'de' yyyy, HH:mm", {
                    locale: es,
                  })}
                  className="text-muted-foreground text-[10px]"
                >
                  {formatDistanceToNow(occurredAt, {
                    addSuffix: true,
                    locale: es,
                  })}
                </time>
              </div>
              <p
                className={cn(
                  "text-muted-foreground mt-1 leading-5",
                  compact ? "line-clamp-2 text-xs" : "text-sm",
                )}
              >
                {activity.content}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
