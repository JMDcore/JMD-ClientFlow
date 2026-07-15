import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createDemoData } from "@/lib/demo-data"
import {
  calculateMetrics,
  getClientInitials,
  getStageBreakdown,
  getTaskDateState,
  isFollowUpDue,
} from "@/lib/metrics"

describe("business metrics", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-15T09:00:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("calculates the main dashboard metrics from the demo workspace", () => {
    const { clients, opportunities, tasks } = createDemoData()

    expect(calculateMetrics(clients, opportunities, tasks)).toEqual({
      openCount: 8,
      pipelineValue: 28000,
      weightedForecast: 13925,
      proposalsCount: 2,
      activeClients: 4,
      pendingTasks: 8,
      overdueTasks: 1,
      wonValue: 2900,
      winRate: 67,
    })
  })

  it("groups open opportunities by pipeline stage", () => {
    const { opportunities } = createDemoData()
    const breakdown = getStageBreakdown(opportunities)

    expect(
      breakdown.map(({ name, count, value }) => ({ name, count, value })),
    ).toEqual([
      { name: "Nuevo", count: 1, value: 1900 },
      { name: "Contactado", count: 2, value: 6300 },
      { name: "Reunión", count: 2, value: 7600 },
      { name: "Propuesta", count: 2, value: 6800 },
      { name: "Negociación", count: 1, value: 5400 },
    ])
  })

  it("classifies task deadlines relative to today", () => {
    expect(getTaskDateState("2026-07-14")).toBe("overdue")
    expect(getTaskDateState("2026-07-15")).toBe("today")
    expect(getTaskDateState("2026-07-16")).toBe("upcoming")
  })

  it("detects follow-ups that require attention", () => {
    expect(isFollowUpDue("2026-07-15T18:00:00.000Z")).toBe(true)
    expect(isFollowUpDue("2026-07-16T09:00:00.000Z")).toBe(false)
  })

  it("builds compact initials for client avatars", () => {
    expect(getClientInitials("José Miguel Díaz")).toBe("JM")
    expect(getClientInitials("Lúmina")).toBe("L")
  })
})
