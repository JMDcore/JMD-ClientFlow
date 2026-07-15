"use client"

import { useMemo, useState } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import {
  BriefcaseBusiness,
  CalendarClock,
  Columns3,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { OpportunityDetailsSheet } from "@/components/opportunities/opportunity-details-sheet"
import { OpportunityDialog } from "@/components/opportunities/opportunity-dialog"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { EntityAvatar } from "@/components/shared/entity-avatar"
import { PageHeader } from "@/components/shared/page-header"
import { PriorityBadge, StageBadge } from "@/components/shared/status-badges"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ALL_STAGES, STAGE_CONFIG } from "@/lib/constants"
import { calculateMetrics, currencyFormatter } from "@/lib/metrics"
import type { OpportunityStage, Priority } from "@/lib/types"
import { useClientFlowStore } from "@/store/use-clientflow-store"

type StageFilter = OpportunityStage | "all" | "open" | "closed"
type PriorityFilter = Priority | "all"

export function OpportunitiesView({
  initialSelectedId,
}: {
  initialSelectedId?: string
}) {
  const [query, setQuery] = useState("")
  const [stage, setStage] = useState<StageFilter>("open")
  const [priority, setPriority] = useState<PriorityFilter>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string>()
  const [selectedId, setSelectedId] = useState<string | undefined>(
    initialSelectedId,
  )
  const [deletingId, setDeletingId] = useState<string>()
  const clients = useClientFlowStore((state) => state.clients)
  const opportunities = useClientFlowStore((state) => state.opportunities)
  const tasks = useClientFlowStore((state) => state.tasks)
  const deleteOpportunity = useClientFlowStore(
    (state) => state.deleteOpportunity,
  )
  const metrics = useMemo(
    () => calculateMetrics(clients, opportunities, tasks),
    [clients, opportunities, tasks],
  )

  const filteredOpportunities = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es")
    return opportunities
      .filter((opportunity) => {
        if (stage === "all") return true
        if (stage === "open")
          return !["won", "lost"].includes(opportunity.stage)
        if (stage === "closed")
          return ["won", "lost"].includes(opportunity.stage)
        return opportunity.stage === stage
      })
      .filter(
        (opportunity) =>
          priority === "all" || opportunity.priority === priority,
      )
      .filter((opportunity) => {
        if (!normalized) return true
        const client = clients.find((item) => item.id === opportunity.clientId)
        return [
          opportunity.title,
          client?.name ?? "",
          client?.company ?? "",
        ].some((value) => value.toLocaleLowerCase("es").includes(normalized))
      })
      .sort(
        (a, b) =>
          parseISO(a.expectedCloseDate).getTime() -
          parseISO(b.expectedCloseDate).getTime(),
      )
  }, [clients, opportunities, priority, query, stage])

  const openNew = () => {
    setEditingId(undefined)
    setDialogOpen(true)
  }
  const openEdit = (id: string) => {
    setEditingId(id)
    setDialogOpen(true)
  }
  const handleDelete = () => {
    if (!deletingId) return
    deleteOpportunity(deletingId)
    if (selectedId === deletingId) setSelectedId(undefined)
    setDeletingId(undefined)
    toast.success("Oportunidad eliminada")
  }

  return (
    <>
      <PageHeader
        title="Oportunidades"
        description={`${metrics.openCount} abiertas · ${currencyFormatter.format(metrics.pipelineValue)} en pipeline`}
        actions={
          <>
            <Link
              href="/pipeline"
              className={buttonVariants({ variant: "outline" })}
            >
              <Columns3 /> Ver pipeline
            </Link>
            <Button onClick={openNew}>
              <Plus /> Nueva oportunidad
            </Button>
          </>
        }
      />

      <section className="surface-panel overflow-hidden rounded-lg">
        <div className="flex flex-col gap-3 border-b bg-[#dce3e4] p-3.5 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1 lg:max-w-sm">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar oportunidad o cliente..."
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <Select
              value={stage}
              onValueChange={(value) => setStage(value as StageFilter)}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue>
                  {stage === "all"
                    ? "Todas las etapas"
                    : stage === "open"
                      ? "Solo abiertas"
                      : stage === "closed"
                        ? "Solo cerradas"
                        : STAGE_CONFIG[stage].label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las etapas</SelectItem>
                <SelectItem value="open">Solo abiertas</SelectItem>
                <SelectItem value="closed">Solo cerradas</SelectItem>
                {ALL_STAGES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {STAGE_CONFIG[item].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as PriorityFilter)}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue>
                  {priority === "all"
                    ? "Prioridad"
                    : priority === "high"
                      ? "Alta"
                      : priority === "medium"
                        ? "Media"
                        : "Baja"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Prioridad</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-muted-foreground rounded-md bg-[#f0f2f1] px-2 py-1 text-[11px] font-medium whitespace-nowrap">
            {filteredOpportunities.length} resultados
          </span>
        </div>

        {filteredOpportunities.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#d7e0e2] hover:bg-[#d7e0e2]">
                    <TableHead>Oportunidad</TableHead>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Cierre estimado</TableHead>
                    <TableHead>Seguimiento</TableHead>
                    <TableHead className="w-12">
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOpportunities.map((opportunity) => {
                    const client = clients.find(
                      (item) => item.id === opportunity.clientId,
                    )
                    return (
                      <TableRow key={opportunity.id}>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => setSelectedId(opportunity.id)}
                            className="hover:text-primary flex min-w-0 items-center gap-3 text-left"
                          >
                            {client && (
                              <EntityAvatar
                                name={client.name}
                                color={client.avatarColor}
                              />
                            )}
                            <span className="min-w-0">
                              <span className="block max-w-64 truncate text-sm font-semibold">
                                {opportunity.title}
                              </span>
                              <span className="text-muted-foreground mt-0.5 block truncate text-xs">
                                {client?.company}
                              </span>
                            </span>
                          </button>
                        </TableCell>
                        <TableCell>
                          <StageBadge stage={opportunity.stage} />
                        </TableCell>
                        <TableCell>
                          <PriorityBadge priority={opportunity.priority} />
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {currencyFormatter.format(opportunity.value)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {format(
                            parseISO(opportunity.expectedCloseDate),
                            "d MMM yyyy",
                            { locale: es },
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                            <CalendarClock className="size-3.5" />
                            {format(
                              parseISO(opportunity.nextFollowUpAt),
                              "d MMM",
                              { locale: es },
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={<Button variant="ghost" size="icon-sm" />}
                            >
                              <MoreHorizontal />
                              <span className="sr-only">
                                Acciones para {opportunity.title}
                              </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setSelectedId(opportunity.id)}
                              >
                                <BriefcaseBusiness /> Ver detalle
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openEdit(opportunity.id)}
                              >
                                <Pencil /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeletingId(opportunity.id)}
                              >
                                <Trash2 /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="divide-y md:hidden">
              {filteredOpportunities.map((opportunity) => {
                const client = clients.find(
                  (item) => item.id === opportunity.clientId,
                )
                return (
                  <button
                    key={opportunity.id}
                    type="button"
                    onClick={() => setSelectedId(opportunity.id)}
                    className="w-full px-4 py-3.5 text-left transition-colors hover:bg-[#f8faf9]"
                  >
                    <div className="flex items-start gap-3">
                      {client && (
                        <EntityAvatar
                          name={client.name}
                          color={client.avatarColor}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {opportunity.title}
                        </p>
                        <p className="text-muted-foreground mt-0.5 truncate text-xs">
                          {client?.company}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <StageBadge stage={opportunity.stage} />
                          <PriorityBadge priority={opportunity.priority} />
                          <span className="ml-auto text-sm font-semibold">
                            {currencyFormatter.format(opportunity.value)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <EmptyState
            icon={BriefcaseBusiness}
            title={
              opportunities.length === 0
                ? "Aún no hay oportunidades"
                : "No hay coincidencias"
            }
            description={
              opportunities.length === 0
                ? "Registra el primer posible trabajo y empieza a moverlo por tu pipeline."
                : "Prueba con otros términos o cambia los filtros."
            }
            action={
              opportunities.length === 0 ? (
                <Button onClick={openNew}>
                  <Plus /> Nueva oportunidad
                </Button>
              ) : undefined
            }
          />
        )}
      </section>

      <OpportunityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        opportunityId={editingId}
      />
      <OpportunityDetailsSheet
        opportunityId={selectedId}
        open={Boolean(selectedId)}
        onOpenChange={(open) => !open && setSelectedId(undefined)}
      />
      <ConfirmDeleteDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(undefined)}
        title="¿Eliminar esta oportunidad?"
        description="También se eliminarán sus tareas y actividad relacionada. Esta acción no se puede deshacer."
        onConfirm={handleDelete}
      />
    </>
  )
}
