"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  ListTodo,
  Plus,
  Send,
  Target,
  Users,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import { OpportunityDialog } from "@/components/opportunities/opportunity-dialog"
import { EntityAvatar } from "@/components/shared/entity-avatar"
import { PageHeader } from "@/components/shared/page-header"
import { PriorityBadge, StageBadge } from "@/components/shared/status-badges"
import { TaskDialog } from "@/components/tasks/task-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { OPEN_STAGES } from "@/lib/constants"
import {
  calculateMetrics,
  compactCurrencyFormatter,
  currencyFormatter,
  getMonthlyClosedRevenue,
  getStageBreakdown,
  getTaskDateState,
  isFollowUpDue,
} from "@/lib/metrics"
import { cn } from "@/lib/utils"
import { useClientFlowStore } from "@/store/use-clientflow-store"

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover rounded-lg border px-3 py-2 text-xs shadow-md">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground mt-1">
        Ingresos:{" "}
        <span className="text-foreground font-semibold">
          {currencyFormatter.format(payload[0].value)}
        </span>
      </p>
    </div>
  )
}

export function DashboardView() {
  const [opportunityOpen, setOpportunityOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)
  const clients = useClientFlowStore((state) => state.clients)
  const opportunities = useClientFlowStore((state) => state.opportunities)
  const tasks = useClientFlowStore((state) => state.tasks)
  const toggleTask = useClientFlowStore((state) => state.toggleTask)

  const metrics = useMemo(
    () => calculateMetrics(clients, opportunities, tasks),
    [clients, opportunities, tasks],
  )
  const stageBreakdown = useMemo(
    () => getStageBreakdown(opportunities),
    [opportunities],
  )
  const revenueData = useMemo(
    () => getMonthlyClosedRevenue(opportunities),
    [opportunities],
  )
  const revenueTotal = revenueData.reduce(
    (total, item) => total + item.value,
    0,
  )
  const pendingTasks = useMemo(
    () =>
      tasks
        .filter((task) => !task.completed)
        .sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 }
          const dateDifference =
            parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime()
          return (
            dateDifference ||
            priorityOrder[a.priority] - priorityOrder[b.priority]
          )
        })
        .slice(0, 5),
    [tasks],
  )
  const followUps = useMemo(
    () =>
      opportunities
        .filter(
          (opportunity) =>
            OPEN_STAGES.includes(opportunity.stage) &&
            isFollowUpDue(opportunity.nextFollowUpAt),
        )
        .sort(
          (a, b) =>
            parseISO(a.nextFollowUpAt).getTime() -
            parseISO(b.nextFollowUpAt).getTime(),
        )
        .slice(0, 5),
    [opportunities],
  )
  const attentionCount = metrics.overdueTasks + followUps.length
  const openClients = clients
    .filter((client) =>
      opportunities.some(
        (opportunity) =>
          opportunity.clientId === client.id &&
          OPEN_STAGES.includes(opportunity.stage),
      ),
    )
    .slice(0, 5)
  const forecastProgress = metrics.pipelineValue
    ? Math.round((metrics.weightedForecast / metrics.pipelineValue) * 100)
    : 0

  const dateLabel = format(new Date(), "EEEE, d 'de' MMMM", { locale: es })

  return (
    <>
      <PageHeader
        title="Buenos días, José"
        description={dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}
        actions={
          <>
            <Button variant="outline" onClick={() => setTaskOpen(true)}>
              <ListTodo /> Nueva tarea
            </Button>
            <Button onClick={() => setOpportunityOpen(true)}>
              <Plus /> Oportunidad
            </Button>
          </>
        }
      />

      <section className="mb-6 overflow-hidden rounded-lg bg-[#31453d] text-white shadow-[0_18px_42px_rgba(30,48,40,0.14)] ring-1 ring-black/5">
        <div className="grid lg:grid-cols-[1.35fr_1fr_1fr]">
          <div className="border-b border-white/10 p-5 sm:p-6 lg:border-r lg:border-b-0">
            <div className="flex items-center gap-2 text-[#95a39d]">
              <CircleDollarSign className="size-4 text-[#64c3a0]" />
              <span className="text-[10px] font-semibold uppercase">
                Valor en curso
              </span>
            </div>
            <p className="mt-4 text-[34px] leading-none font-semibold">
              {compactCurrencyFormatter.format(metrics.pipelineValue)}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3 text-xs">
              <span className="text-[#9eaaa5]">Previsión ponderada</span>
              <span className="font-semibold text-white">
                {compactCurrencyFormatter.format(metrics.weightedForecast)}
              </span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#52b890]"
                style={{ width: `${forecastProgress}%` }}
              />
            </div>
          </div>

          <div className="border-b border-white/10 p-5 sm:p-6 lg:border-r lg:border-b-0">
            <div className="flex items-center gap-2 text-[#95a39d]">
              <BriefcaseBusiness className="size-4 text-[#8fa7df]" />
              <span className="text-[10px] font-semibold uppercase">
                Oportunidades abiertas
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-4">
              <p className="text-[34px] leading-none font-semibold">
                {metrics.openCount}
              </p>
              <span className="text-xs text-[#9eaaa5]">
                {metrics.proposalsCount} en propuesta
              </span>
            </div>
            <div className="mt-5 flex items-center">
              <div className="flex -space-x-2">
                {openClients.map((client) => (
                  <EntityAvatar
                    key={client.id}
                    name={client.name}
                    color={client.avatarColor}
                    size="sm"
                    className="ring-2 ring-[#31453d]"
                  />
                ))}
              </div>
              <span className="ml-3 text-[11px] text-[#9eaaa5]">
                {openClients.length} relaciones activas
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 text-[#95a39d]">
              <Target className="size-4 text-[#e1846d]" />
              <span className="text-[10px] font-semibold uppercase">
                Rendimiento comercial
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-4">
              <p className="text-[34px] leading-none font-semibold">
                {metrics.winRate}%
              </p>
              <span className="text-xs text-[#9eaaa5]">Tasa de éxito</span>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="flex items-center gap-2 text-[11px] text-[#9eaaa5]">
                <Users className="size-3.5" /> {metrics.activeClients} clientes
                activos
              </span>
              <span className="text-[11px] font-semibold text-white">
                {currencyFormatter.format(metrics.wonValue)} ganados
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 border-t border-white/10 bg-white/[0.025] px-5 py-3 sm:px-6">
          <span className="mr-3 shrink-0 text-[10px] font-semibold text-[#8f9c96] uppercase">
            Distribución
          </span>
          {stageBreakdown.map((item) => (
            <span
              key={item.stage}
              className="h-1.5 min-w-3 rounded-full"
              style={{
                width: `${metrics.openCount ? Math.max(8, (item.count / metrics.openCount) * 100) : 8}%`,
                backgroundColor: item.color,
              }}
              title={`${item.name}: ${item.count}`}
            />
          ))}
        </div>
      </section>

      {attentionCount > 0 && (
        <section className="surface-panel surface-warm mb-6 flex flex-col gap-3 overflow-hidden rounded-lg border-l-[3px] border-l-[#c99a3b] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-[#f7edda] text-[#8a6315]">
              <AlertCircle className="size-4" strokeWidth={2} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#3d3526]">
                Hay {attentionCount} asuntos que necesitan atención
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {metrics.overdueTasks} tareas vencidas y {followUps.length}{" "}
                seguimientos para hoy.
              </p>
            </div>
          </div>
          <Link
            href="/tasks"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-[#e2d4b8] bg-[#fffdf8]",
            )}
          >
            Revisar agenda <ArrowRight />
          </Link>
        </section>
      )}

      <div className="grid gap-5 xl:grid-cols-12">
        <section className="surface-panel surface-sage overflow-hidden rounded-lg xl:col-span-8">
          <div className="flex items-center justify-between border-b px-5 py-[18px]">
            <div>
              <h2 className="text-[15px] font-semibold">Ingresos cerrados</h2>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Evolución de los últimos seis meses
              </p>
            </div>
            <div className="text-right">
              <p className="text-[15px] font-semibold">
                {compactCurrencyFormatter.format(revenueTotal)}
              </p>
              <p className="text-muted-foreground mt-0.5 text-[10px] font-medium uppercase">
                Total · {new Date().getFullYear()}
              </p>
            </div>
          </div>
          <div className="h-[288px] px-2 pt-6 pr-5 pb-4 sm:px-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 4, right: 4, left: -18, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#167b5b" stopOpacity={0.22} />
                    <stop
                      offset="100%"
                      stopColor="#167b5b"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="#e8ebe9"
                  strokeDasharray="4 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#718079", fontSize: 11 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#718079", fontSize: 11 }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <RechartsTooltip
                  content={<RevenueTooltip />}
                  cursor={{ stroke: "#a8b8b0", strokeDasharray: "3 3" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#167b5b"
                  strokeWidth={2.4}
                  fill="url(#revenueFill)"
                  isAnimationActive={false}
                  activeDot={{
                    r: 4,
                    fill: "#167b5b",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="surface-panel surface-lilac overflow-hidden rounded-lg xl:col-span-4">
          <div className="flex items-center justify-between border-b px-5 py-[18px]">
            <div>
              <h2 className="text-[15px] font-semibold">Estado del pipeline</h2>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Distribución de oportunidades
              </p>
            </div>
            <Link
              href="/pipeline"
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            >
              <ArrowRight />
              <span className="sr-only">Ver pipeline</span>
            </Link>
          </div>
          <div className="space-y-[18px] px-5 py-5">
            {stageBreakdown.map((item) => {
              const percentage = metrics.openCount
                ? (item.count / metrics.openCount) * 100
                : 0
              return (
                <div key={item.stage}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2 text-xs font-medium">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {item.count} ·{" "}
                      {compactCurrencyFormatter.format(item.value)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#edf0ee]">
                    <div
                      className="h-full rounded-full transition-[width]"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="surface-panel surface-warm overflow-hidden rounded-lg xl:col-span-7">
          <div className="flex items-center justify-between border-b px-5 py-[18px]">
            <div>
              <h2 className="text-[15px] font-semibold">Tareas prioritarias</h2>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Lo próximo que tienes que resolver
              </p>
            </div>
            <Link
              href="/tasks"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Ver todas <ArrowRight />
            </Link>
          </div>
          <div className="divide-y">
            {pendingTasks.map((task) => {
              const client = clients.find((item) => item.id === task.clientId)
              const dateState = getTaskDateState(task.dueDate)
              return (
                <div
                  key={task.id}
                  className="flex min-h-[62px] items-center gap-3 px-5 py-3 transition-colors hover:bg-[#f9faf9]"
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    aria-label={`Completar ${task.title}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="text-muted-foreground mt-0.5 truncate text-xs">
                      {client?.company ?? "Tarea independiente"}
                    </p>
                  </div>
                  <PriorityBadge priority={task.priority} />
                  <span
                    className={cn(
                      "hidden shrink-0 items-center gap-1 text-[11px] sm:flex",
                      dateState === "overdue" && "text-destructive font-medium",
                      dateState === "today" && "font-medium text-[#8a6315]",
                      dateState === "upcoming" && "text-muted-foreground",
                    )}
                  >
                    <Clock3 className="size-3.5" />
                    {dateState === "overdue"
                      ? "Vencida"
                      : dateState === "today"
                        ? "Hoy"
                        : format(parseISO(task.dueDate), "d MMM", {
                            locale: es,
                          })}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="surface-panel surface-mist overflow-hidden rounded-lg xl:col-span-5">
          <div className="flex items-center justify-between border-b px-5 py-[18px]">
            <div>
              <h2 className="text-[15px] font-semibold">Seguimientos</h2>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Conversaciones que no deben enfriarse
              </p>
            </div>
            <Send className="text-muted-foreground size-4" />
          </div>
          <div className="divide-y">
            {followUps.length > 0 ? (
              followUps.map((opportunity) => {
                const client = clients.find(
                  (item) => item.id === opportunity.clientId,
                )
                if (!client) return null
                const overdue =
                  parseISO(opportunity.nextFollowUpAt) <
                  new Date(new Date().setHours(0, 0, 0, 0))
                return (
                  <Link
                    key={opportunity.id}
                    href={`/opportunities?selected=${opportunity.id}`}
                    className="flex min-h-[68px] items-center gap-3 px-5 py-3 transition-colors hover:bg-[#f9faf9]"
                  >
                    <EntityAvatar
                      name={client.name}
                      color={client.avatarColor}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {client.name}
                      </p>
                      <p className="text-muted-foreground mt-0.5 truncate text-xs">
                        {opportunity.title}
                      </p>
                    </div>
                    <div className="text-right">
                      <StageBadge stage={opportunity.stage} />
                      <p
                        className={cn(
                          "mt-1 text-[10px]",
                          overdue
                            ? "text-destructive font-medium"
                            : "text-[#8a6315]",
                        )}
                      >
                        {overdue ? "Atrasado" : "Hoy"}
                      </p>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="flex min-h-52 flex-col items-center justify-center px-5 text-center">
                <CheckCircle2 className="text-primary size-6" />
                <p className="mt-2 text-sm font-medium">Seguimientos al día</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  No hay conversaciones pendientes para hoy.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <OpportunityDialog
        open={opportunityOpen}
        onOpenChange={setOpportunityOpen}
      />
      <TaskDialog open={taskOpen} onOpenChange={setTaskOpen} />
    </>
  )
}
