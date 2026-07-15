import {
  endOfDay,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
} from "date-fns"

import { OPEN_STAGES, STAGE_CONFIG } from "@/lib/constants"
import type { Client, Opportunity, Task } from "@/lib/types"

export const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
})

export const compactCurrencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1,
})

export function calculateMetrics(
  clients: Client[],
  opportunities: Opportunity[],
  tasks: Task[],
) {
  const openOpportunities = opportunities.filter((opportunity) =>
    OPEN_STAGES.includes(opportunity.stage),
  )
  const won = opportunities.filter((opportunity) => opportunity.stage === "won")
  const lost = opportunities.filter(
    (opportunity) => opportunity.stage === "lost",
  )
  const closedCount = won.length + lost.length
  const pendingTasks = tasks.filter((task) => !task.completed)
  const today = startOfDay(new Date())

  return {
    openCount: openOpportunities.length,
    pipelineValue: openOpportunities.reduce(
      (total, opportunity) => total + opportunity.value,
      0,
    ),
    weightedForecast: openOpportunities.reduce(
      (total, opportunity) =>
        total +
        opportunity.value * (STAGE_CONFIG[opportunity.stage].probability / 100),
      0,
    ),
    proposalsCount: opportunities.filter(
      (opportunity) => opportunity.stage === "proposal",
    ).length,
    activeClients: clients.filter((client) => client.status === "active")
      .length,
    pendingTasks: pendingTasks.length,
    overdueTasks: pendingTasks.filter((task) =>
      isBefore(parseISO(task.dueDate), today),
    ).length,
    wonValue: won.reduce((total, opportunity) => total + opportunity.value, 0),
    winRate: closedCount ? Math.round((won.length / closedCount) * 100) : 0,
  }
}

export function getTaskDateState(dueDate: string) {
  const date = parseISO(dueDate)
  const today = startOfDay(new Date())

  if (isBefore(date, today)) return "overdue"
  if (isSameDay(date, today)) return "today"
  return "upcoming"
}

export function isFollowUpDue(date: string) {
  return !isAfter(parseISO(date), endOfDay(new Date()))
}

export function getClientInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export function getStageBreakdown(opportunities: Opportunity[]) {
  return OPEN_STAGES.map((stage) => ({
    stage,
    name: STAGE_CONFIG[stage].shortLabel,
    count: opportunities.filter((opportunity) => opportunity.stage === stage)
      .length,
    value: opportunities
      .filter((opportunity) => opportunity.stage === stage)
      .reduce((total, opportunity) => total + opportunity.value, 0),
    color: STAGE_CONFIG[stage].color,
  }))
}

export function getMonthlyClosedRevenue(opportunities: Opportunity[]) {
  const now = new Date()
  const monthNames = ["Feb", "Mar", "Abr", "May", "Jun", "Jul"]
  const base = [2100, 3400, 2800, 5200, 4300, 0]
  const currentWon = opportunities
    .filter((opportunity) => opportunity.stage === "won")
    .reduce((total, opportunity) => total + opportunity.value, 0)

  return monthNames.map((month, index) => ({
    month,
    value: index === monthNames.length - 1 ? currentWon : base[index],
    current: index === monthNames.length - 1,
    year: now.getFullYear(),
  }))
}
