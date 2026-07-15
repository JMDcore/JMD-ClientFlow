"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Mail,
  MessageSquarePlus,
  Pencil,
  Phone,
  Plus,
} from "lucide-react"

import { ActivityDialog } from "@/components/activity/activity-dialog"
import { ActivityTimeline } from "@/components/activity/activity-timeline"
import { ClientDialog } from "@/components/clients/client-dialog"
import { OpportunityDialog } from "@/components/opportunities/opportunity-dialog"
import { EntityAvatar } from "@/components/shared/entity-avatar"
import {
  ClientStatusBadge,
  StageBadge,
} from "@/components/shared/status-badges"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { currencyFormatter } from "@/lib/metrics"
import { useClientFlowStore } from "@/store/use-clientflow-store"

export function ClientDetailsSheet({
  clientId,
  open,
  onOpenChange,
}: {
  clientId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [opportunityOpen, setOpportunityOpen] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)
  const clients = useClientFlowStore((state) => state.clients)
  const opportunities = useClientFlowStore((state) => state.opportunities)
  const activities = useClientFlowStore((state) => state.activities)
  const client = clients.find((item) => item.id === clientId)

  if (!client) return null

  const clientOpportunities = opportunities.filter(
    (opportunity) => opportunity.clientId === client.id,
  )
  const clientActivities = activities.filter(
    (activity) => activity.clientId === client.id,
  )
  const openValue = clientOpportunities
    .filter((opportunity) => !["won", "lost"].includes(opportunity.stage))
    .reduce((total, opportunity) => total + opportunity.value, 0)

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-xl">
          <SheetHeader className="border-b px-5 py-5 pr-12">
            <div className="flex items-start gap-3">
              <EntityAvatar
                name={client.name}
                color={client.avatarColor}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <SheetTitle className="truncate text-lg font-semibold">
                    {client.name}
                  </SheetTitle>
                  <ClientStatusBadge status={client.status} />
                </div>
                <SheetDescription className="mt-1">
                  {client.company} · {client.industry}
                </SheetDescription>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setOpportunityOpen(true)}>
                <Plus /> Oportunidad
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
                <span className="sr-only">Editar cliente</span>
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 scrollbar-thin overflow-y-auto">
            <section className="grid grid-cols-2 border-b sm:grid-cols-3">
              <div className="border-r px-5 py-4">
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.08em] uppercase">
                  Oportunidades
                </p>
                <p className="mt-1.5 text-xl font-semibold">
                  {clientOpportunities.length}
                </p>
              </div>
              <div className="px-5 py-4 sm:border-r">
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.08em] uppercase">
                  Pipeline abierto
                </p>
                <p className="mt-1.5 text-xl font-semibold">
                  {currencyFormatter.format(openValue)}
                </p>
              </div>
              <div className="col-span-2 border-t px-5 py-4 sm:col-span-1 sm:border-t-0">
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.08em] uppercase">
                  Último contacto
                </p>
                <p className="mt-1.5 text-sm font-semibold">
                  {format(parseISO(client.lastContactAt), "d MMM yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
            </section>

            <section className="border-b px-5 py-5">
              <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-[0.06em] uppercase">
                Contacto
              </h3>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <a
                  href={`mailto:${client.email}`}
                  className="hover:text-primary flex min-w-0 items-center gap-2.5"
                >
                  <Mail className="text-muted-foreground size-4 shrink-0" />
                  <span className="truncate">{client.email}</span>
                </a>
                <a
                  href={`tel:${client.phone}`}
                  className="hover:text-primary flex items-center gap-2.5"
                >
                  <Phone className="text-muted-foreground size-4 shrink-0" />
                  {client.phone}
                </a>
                <div className="flex items-center gap-2.5">
                  <Building2 className="text-muted-foreground size-4 shrink-0" />
                  {client.company}
                </div>
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="text-muted-foreground size-4 shrink-0" />
                  Cliente desde{" "}
                  {format(parseISO(client.createdAt), "MMM yyyy", {
                    locale: es,
                  })}
                </div>
              </div>
              {client.notes && (
                <div className="mt-4 rounded-lg border-l-2 border-[#d39b2f] bg-[#f2e9d6]/45 px-3 py-2.5 text-sm leading-5 text-[#5c5139]">
                  {client.notes}
                </div>
              )}
            </section>

            <section className="border-b px-5 py-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
                  Oportunidades
                </h3>
                <BriefcaseBusiness className="text-muted-foreground size-4" />
              </div>
              <div className="divide-y rounded-lg border">
                {clientOpportunities.length > 0 ? (
                  clientOpportunities.map((opportunity) => (
                    <div
                      key={opportunity.id}
                      className="flex items-center gap-3 px-3 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {opportunity.title}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <StageBadge stage={opportunity.stage} />
                          <span className="text-muted-foreground text-xs">
                            {currencyFormatter.format(opportunity.value)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground px-3 py-6 text-center text-sm">
                    No hay oportunidades asociadas.
                  </p>
                )}
              </div>
            </section>

            <section className="px-5 py-5">
              <h3 className="text-muted-foreground mb-4 text-xs font-semibold tracking-[0.06em] uppercase">
                Actividad reciente
              </h3>
              <ActivityTimeline activities={clientActivities} />
            </section>
          </div>
        </SheetContent>
      </Sheet>
      <ClientDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        clientId={client.id}
      />
      <OpportunityDialog
        open={opportunityOpen}
        onOpenChange={setOpportunityOpen}
        initialClientId={client.id}
      />
      <ActivityDialog
        open={activityOpen}
        onOpenChange={setActivityOpen}
        clientId={client.id}
      />
    </>
  )
}
