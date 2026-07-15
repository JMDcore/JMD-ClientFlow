"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  MessageSquarePlus,
  Pencil,
  Plus,
  UserRound,
} from "lucide-react"

import { ActivityDialog } from "@/components/activity/activity-dialog"
import { ActivityTimeline } from "@/components/activity/activity-timeline"
import { OpportunityDialog } from "@/components/opportunities/opportunity-dialog"
import { EntityAvatar } from "@/components/shared/entity-avatar"
import { PriorityBadge, StageBadge } from "@/components/shared/status-badges"
import { TaskDialog } from "@/components/tasks/task-dialog"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { STAGE_CONFIG } from "@/lib/constants"
import { currencyFormatter } from "@/lib/metrics"
import { useClientFlowStore } from "@/store/use-clientflow-store"

export function OpportunityDetailsSheet({
  opportunityId,
  open,
  onOpenChange,
}: {
  opportunityId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)
  const opportunities = useClientFlowStore((state) => state.opportunities)
  const clients = useClientFlowStore((state) => state.clients)
  const tasks = useClientFlowStore((state) => state.tasks)
  const activities = useClientFlowStore((state) => state.activities)
  const opportunity = opportunities.find((item) => item.id === opportunityId)

  if (!opportunity) return null

  const client = clients.find((item) => item.id === opportunity.clientId)
  const relatedTasks = tasks.filter(
    (task) => task.opportunityId === opportunity.id,
  )
  const relatedActivities = activities.filter(
    (activity) => activity.opportunityId === opportunity.id,
  )
  const weightedValue =
    opportunity.value * (STAGE_CONFIG[opportunity.stage].probability / 100)

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-xl">
          <SheetHeader className="border-b px-5 py-5 pr-12">
            <div className="flex flex-wrap items-center gap-2">
              <StageBadge stage={opportunity.stage} />
              <PriorityBadge priority={opportunity.priority} />
            </div>
            <SheetTitle className="mt-2 text-lg leading-6 font-semibold">
              {opportunity.title}
            </SheetTitle>
            <SheetDescription className="mt-1">
              {client?.company ?? "Cliente no disponible"}
            </SheetDescription>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setTaskOpen(true)}>
                <Plus /> Tarea
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActivityOpen(true)}
              >
                <MessageSquarePlus /> Actividad
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => setEditOpen(true)}
              >
                <Pencil />
                <span className="sr-only">Editar oportunidad</span>
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 scrollbar-thin overflow-y-auto">
            <section className="grid grid-cols-2 border-b sm:grid-cols-3">
              <div className="border-r px-5 py-4">
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.08em] uppercase">
                  Valor
                </p>
                <p className="mt-1.5 text-xl font-semibold">
                  {currencyFormatter.format(opportunity.value)}
                </p>
              </div>
              <div className="px-5 py-4 sm:border-r">
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.08em] uppercase">
                  Ponderado
                </p>
                <p className="mt-1.5 text-xl font-semibold">
                  {currencyFormatter.format(weightedValue)}
                </p>
              </div>
              <div className="col-span-2 border-t px-5 py-4 sm:col-span-1 sm:border-t-0">
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.08em] uppercase">
                  Probabilidad
                </p>
                <p className="mt-1.5 text-xl font-semibold">
                  {STAGE_CONFIG[opportunity.stage].probability}%
                </p>
              </div>
            </section>

            <section className="border-b px-5 py-5">
              <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-[0.06em] uppercase">
                Detalles
              </h3>
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="text-muted-foreground size-4 shrink-0" />
                  <span>
                    Cierre{" "}
                    {format(
                      parseISO(opportunity.expectedCloseDate),
                      "d MMM yyyy",
                      { locale: es },
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CalendarClock className="text-muted-foreground size-4 shrink-0" />
                  <span>
                    Seguimiento{" "}
                    {format(parseISO(opportunity.nextFollowUpAt), "d MMM", {
                      locale: es,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CircleDollarSign className="text-muted-foreground size-4 shrink-0" />
                  <span>
                    {currencyFormatter.format(opportunity.value)} estimados
                  </span>
                </div>
                <div className="flex min-w-0 items-center gap-2.5">
                  <UserRound className="text-muted-foreground size-4 shrink-0" />
                  {client && (
                    <span className="flex min-w-0 items-center gap-2">
                      <EntityAvatar
                        name={client.name}
                        color={client.avatarColor}
                        size="sm"
                      />
                      <span className="truncate">{client.name}</span>
                    </span>
                  )}
                </div>
              </div>
              {opportunity.notes && (
                <div className="mt-4 rounded-lg border-l-2 border-[#4a6fa5] bg-[#e0e9f3]/50 px-3 py-2.5 text-sm leading-5 text-[#35465d]">
                  {opportunity.notes}
                </div>
              )}
            </section>

            <section className="border-b px-5 py-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
                  Tareas relacionadas
                </h3>
                <CheckCircle2 className="text-muted-foreground size-4" />
              </div>
              <div className="divide-y rounded-lg border">
                {relatedTasks.length > 0 ? (
                  relatedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 px-3 py-3"
                    >
                      <span
                        className={`size-2 rounded-full ${task.completed ? "bg-[#167b5b]" : "bg-[#d39b2f]"}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-medium ${task.completed ? "text-muted-foreground line-through" : ""}`}
                        >
                          {task.title}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {format(parseISO(task.dueDate), "d MMM yyyy", {
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground px-3 py-6 text-center text-sm">
                    No hay tareas relacionadas.
                  </p>
                )}
              </div>
            </section>

            <section className="px-5 py-5">
              <h3 className="text-muted-foreground mb-4 text-xs font-semibold tracking-[0.06em] uppercase">
                Historial
              </h3>
              <ActivityTimeline activities={relatedActivities} />
            </section>
          </div>
        </SheetContent>
      </Sheet>
      <OpportunityDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        opportunityId={opportunity.id}
      />
      <TaskDialog
        open={taskOpen}
        onOpenChange={setTaskOpen}
        initialClientId={opportunity.clientId}
        initialOpportunityId={opportunity.id}
      />
      <ActivityDialog
        open={activityOpen}
        onOpenChange={setActivityOpen}
        clientId={opportunity.clientId}
        opportunityId={opportunity.id}
      />
    </>
  )
}
