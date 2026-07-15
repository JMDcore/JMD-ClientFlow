"use client"

import { useMemo, useState } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import {
  CalendarClock,
  Check,
  CircleX,
  GripVertical,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react"
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { toast } from "sonner"

import { OpportunityDetailsSheet } from "@/components/opportunities/opportunity-details-sheet"
import { OpportunityDialog } from "@/components/opportunities/opportunity-dialog"
import { EntityAvatar } from "@/components/shared/entity-avatar"
import { PageHeader } from "@/components/shared/page-header"
import { PriorityBadge } from "@/components/shared/status-badges"
import { Button } from "@/components/ui/button"
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  CLOSED_STAGES,
  OPEN_STAGES,
  PRIORITY_CONFIG,
  STAGE_CONFIG,
} from "@/lib/constants"
import { compactCurrencyFormatter, currencyFormatter } from "@/lib/metrics"
import type { Opportunity, OpportunityStage, Priority } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useClientFlowStore } from "@/store/use-clientflow-store"

type BoardMode = "open" | "closed"
type PriorityFilter = Priority | "all"

function OpportunityCard({
  opportunity,
  overlay = false,
  onOpen,
}: {
  opportunity: Opportunity
  overlay?: boolean
  onOpen?: () => void
}) {
  const clients = useClientFlowStore((state) => state.clients)
  const updateOpportunity = useClientFlowStore(
    (state) => state.updateOpportunity,
  )
  const client = clients.find((item) => item.id === opportunity.clientId)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: opportunity.id,
    data: { type: "opportunity", stage: opportunity.stage },
    disabled: overlay,
  })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const changeStage = (stage: OpportunityStage) => {
    const { id, createdAt, updatedAt, position, ...input } = opportunity
    void createdAt
    void updatedAt
    void position
    updateOpportunity(id, { ...input, stage })
    toast.success(
      stage === "won"
        ? "Oportunidad marcada como ganada"
        : "Oportunidad cerrada",
    )
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border border-white/50 bg-[#edf1ee] p-3.5 shadow-[0_1px_2px_rgba(23,33,29,0.035),0_5px_14px_rgba(23,33,29,0.04)] transition-all duration-150 hover:-translate-y-0.5 hover:border-white/80 hover:shadow-[0_8px_22px_rgba(23,33,29,0.08)]",
        isDragging && "opacity-30",
        overlay && "w-[272px] rotate-1 shadow-xl",
      )}
    >
      <div className="flex items-start gap-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                className="text-muted-foreground hover:bg-muted hover:text-foreground -ml-1 grid size-7 shrink-0 touch-none place-items-center rounded-md opacity-70 transition-opacity hover:opacity-100"
                aria-label={`Mover ${opportunity.title}`}
                {...attributes}
                {...listeners}
              />
            }
          >
            <GripVertical className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Mover oportunidad</TooltipContent>
        </Tooltip>
        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 text-left"
        >
          <h3 className="hover:text-primary line-clamp-2 text-[13px] leading-5 font-semibold">
            {opportunity.title}
          </h3>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-xs" />}
          >
            <MoreHorizontal />
            <span className="sr-only">Acciones</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onOpen}>Ver detalle</DropdownMenuItem>
            <DropdownMenuSeparator />
            {opportunity.stage !== "won" && (
              <DropdownMenuItem onClick={() => changeStage("won")}>
                <Check /> Marcar como ganada
              </DropdownMenuItem>
            )}
            {opportunity.stage !== "lost" && (
              <DropdownMenuItem onClick={() => changeStage("lost")}>
                <CircleX /> Marcar como perdida
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-3">
        <span className="text-[15px] font-semibold">
          {currencyFormatter.format(opportunity.value)}
        </span>
        <PriorityBadge priority={opportunity.priority} />
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-2 border-t pt-3">
        {client ? (
          <span className="flex min-w-0 items-center gap-2">
            <EntityAvatar
              name={client.name}
              color={client.avatarColor}
              size="sm"
            />
            <span className="text-muted-foreground truncate text-xs">
              {client.company}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">Sin cliente</span>
        )}
        <span className="text-muted-foreground flex shrink-0 items-center gap-1 text-[10px]">
          <CalendarClock className="size-3" />
          {format(parseISO(opportunity.nextFollowUpAt), "d MMM", {
            locale: es,
          })}
        </span>
      </div>
    </article>
  )
}

function PipelineColumn({
  stage,
  opportunities,
  onOpen,
}: {
  stage: OpportunityStage
  opportunities: Opportunity[]
  onOpen: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${stage}`,
    data: { type: "column", stage },
  })
  const total = opportunities.reduce(
    (sum, opportunity) => sum + opportunity.value,
    0,
  )
  const config = STAGE_CONFIG[stage]

  return (
    <section
      className="flex min-h-[540px] min-w-0 flex-col overflow-hidden rounded-lg border border-t-2"
      style={{
        borderTopColor: config.color,
        backgroundColor: config.surfaceColor,
      }}
    >
      <header className="border-b border-black/[0.06] bg-white/35 px-3.5 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className={cn("size-2 rounded-full", config.dotClass)} />
            <h2 className="truncate text-xs font-semibold">{config.label}</h2>
            <span className="bg-muted text-muted-foreground grid h-5 min-w-5 place-items-center rounded-md px-1 text-[10px] font-semibold ring-1 ring-black/[0.025]">
              {opportunities.length}
            </span>
          </div>
          <span className="text-right">
            <span className="block text-[11px] font-semibold">
              {compactCurrencyFormatter.format(total)}
            </span>
            <span className="text-muted-foreground mt-0.5 block text-[9px]">
              {config.probability}% prob.
            </span>
          </span>
        </div>
      </header>
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 scrollbar-thin flex-col gap-2.5 overflow-y-auto p-2.5 transition-colors",
          isOver && "bg-[#e2f0ea]",
        )}
      >
        <SortableContext
          items={opportunities.map((opportunity) => opportunity.id)}
          strategy={verticalListSortingStrategy}
        >
          {opportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onOpen={() => onOpen(opportunity.id)}
            />
          ))}
        </SortableContext>
        {opportunities.length === 0 && (
          <div className="text-muted-foreground flex min-h-28 flex-1 items-center justify-center rounded-lg border border-dashed border-[#ccd4d0] bg-white/35 px-4 text-center text-xs">
            Sin oportunidades
          </div>
        )}
      </div>
    </section>
  )
}

export function PipelineView() {
  const [mode, setMode] = useState<BoardMode>("open")
  const [query, setQuery] = useState("")
  const [priority, setPriority] = useState<PriorityFilter>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [initialStage, setInitialStage] = useState<OpportunityStage>("new")
  const [selectedId, setSelectedId] = useState<string>()
  const [activeId, setActiveId] = useState<string>()
  const opportunities = useClientFlowStore((state) => state.opportunities)
  const clients = useClientFlowStore((state) => state.clients)
  const moveOpportunity = useClientFlowStore((state) => state.moveOpportunity)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )
  const stages = mode === "open" ? OPEN_STAGES : CLOSED_STAGES

  const visibleOpportunities = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es")
    return opportunities.filter((opportunity) => {
      const client = clients.find((item) => item.id === opportunity.clientId)
      return (
        stages.includes(opportunity.stage) &&
        (priority === "all" || opportunity.priority === priority) &&
        (!normalized ||
          [opportunity.title, client?.name ?? "", client?.company ?? ""].some(
            (value) => value.toLocaleLowerCase("es").includes(normalized),
          ))
      )
    })
  }, [clients, opportunities, priority, query, stages])

  const activeOpportunity = opportunities.find(
    (opportunity) => opportunity.id === activeId,
  )
  const boardTotal = visibleOpportunities.reduce(
    (total, opportunity) => total + opportunity.value,
    0,
  )

  const handleDragStart = (event: DragStartEvent) =>
    setActiveId(String(event.active.id))
  const handleDragEnd = (event: DragEndEvent) => {
    const activeOpportunity = opportunities.find(
      (opportunity) => opportunity.id === String(event.active.id),
    )
    const overId = event.over ? String(event.over.id) : undefined
    setActiveId(undefined)
    if (!activeOpportunity || !overId) return

    let targetStage: OpportunityStage
    let targetIndex: number
    if (overId.startsWith("column-")) {
      targetStage = overId.replace("column-", "") as OpportunityStage
      targetIndex = opportunities.filter(
        (item) => item.stage === targetStage,
      ).length
    } else {
      const overOpportunity = opportunities.find(
        (opportunity) => opportunity.id === overId,
      )
      if (!overOpportunity) return
      targetStage = overOpportunity.stage
      targetIndex = opportunities
        .filter((item) => item.stage === targetStage)
        .sort((a, b) => a.position - b.position)
        .findIndex((item) => item.id === overOpportunity.id)
    }
    moveOpportunity(activeOpportunity.id, targetStage, targetIndex)
  }

  const openNew = () => {
    setInitialStage(mode === "open" ? "new" : "won")
    setDialogOpen(true)
  }

  return (
    <>
      <PageHeader
        title="Pipeline"
        description={`${visibleOpportunities.length} oportunidades · ${currencyFormatter.format(boardTotal)} en esta vista`}
        actions={
          <Button onClick={openNew}>
            <Plus /> Nueva oportunidad
          </Button>
        }
      />

      <div className="surface-panel mb-5 flex flex-col gap-3 rounded-lg p-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="bg-muted/70 inline-flex w-fit rounded-lg border p-1">
          <button
            type="button"
            onClick={() => setMode("open")}
            className={cn(
              "h-8 rounded-md px-3.5 text-xs font-medium transition-colors",
              mode === "open"
                ? "bg-card text-foreground shadow-sm ring-1 ring-black/[0.035]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Abiertas
          </button>
          <button
            type="button"
            onClick={() => setMode("closed")}
            className={cn(
              "h-8 rounded-md px-3.5 text-xs font-medium transition-colors",
              mode === "closed"
                ? "bg-card text-foreground shadow-sm ring-1 ring-black/[0.035]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Cerradas
          </button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative sm:w-64">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar en el pipeline..."
              className="pl-9"
            />
          </div>
          <Select
            value={priority}
            onValueChange={(value) => setPriority(value as PriorityFilter)}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue>
                {priority === "all"
                  ? "Prioridad"
                  : PRIORITY_CONFIG[priority].label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Prioridad</SelectItem>
              {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(undefined)}
      >
        <div className="w-full max-w-full min-w-0 scrollbar-thin overflow-x-auto pb-3">
          <div
            className={cn(
              "grid gap-4",
              mode === "open"
                ? "min-w-[1320px] grid-cols-5"
                : "min-w-[680px] grid-cols-2",
            )}
          >
            {stages.map((stage) => (
              <PipelineColumn
                key={stage}
                stage={stage}
                opportunities={visibleOpportunities
                  .filter((opportunity) => opportunity.stage === stage)
                  .sort((a, b) => a.position - b.position)}
                onOpen={setSelectedId}
              />
            ))}
          </div>
        </div>
        <DragOverlay>
          {activeOpportunity ? (
            <OpportunityCard opportunity={activeOpportunity} overlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      <OpportunityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialStage={initialStage}
      />
      <OpportunityDetailsSheet
        opportunityId={selectedId}
        open={Boolean(selectedId)}
        onOpenChange={(open) => !open && setSelectedId(undefined)}
      />
    </>
  )
}
