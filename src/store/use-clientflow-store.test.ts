import { beforeEach, describe, expect, it } from "vitest"

import { useClientFlowStore } from "@/store/use-clientflow-store"

describe("clientflow store", () => {
  beforeEach(() => {
    localStorage.clear()
    useClientFlowStore.getState().resetDemo()
  })

  it("creates a client and removes all related records when deleted", () => {
    const store = useClientFlowStore.getState()
    const clientId = store.addClient({
      name: "Cliente de prueba",
      email: "cliente@example.com",
      phone: "+34 600 000 000",
      company: "Example Studio",
      industry: "Diseño",
      notes: "",
      status: "prospect",
      lastContactAt: new Date().toISOString(),
    })
    const opportunityId = useClientFlowStore.getState().addOpportunity({
      title: "Nueva identidad visual",
      clientId,
      value: 1800,
      stage: "new",
      expectedCloseDate: "2026-08-01",
      nextFollowUpAt: "2026-07-18T10:00:00.000Z",
      priority: "medium",
      notes: "",
    })
    useClientFlowStore.getState().addTask({
      title: "Preparar propuesta",
      clientId,
      opportunityId,
      dueDate: "2026-07-18",
      priority: "high",
    })

    useClientFlowStore.getState().deleteClient(clientId)
    const state = useClientFlowStore.getState()

    expect(state.clients.some((client) => client.id === clientId)).toBe(false)
    expect(
      state.opportunities.some(
        (opportunity) => opportunity.id === opportunityId,
      ),
    ).toBe(false)
    expect(state.tasks.some((task) => task.clientId === clientId)).toBe(false)
    expect(
      state.activities.some((activity) => activity.clientId === clientId),
    ).toBe(false)
  })

  it("records activity when a related task is completed", () => {
    const initialCount = useClientFlowStore.getState().activities.length

    useClientFlowStore.getState().toggleTask("task-northpeak-scope")

    const state = useClientFlowStore.getState()
    expect(
      state.tasks.find((task) => task.id === "task-northpeak-scope")?.completed,
    ).toBe(true)
    expect(state.activities).toHaveLength(initialCount + 1)
    expect(state.activities[0].content).toContain(
      "Confirmar alcance del dashboard",
    )
  })

  it("moves an opportunity between pipeline stages and reorders it", () => {
    useClientFlowStore
      .getState()
      .moveOpportunity("opp-lucia-booking", "contacted", 1)

    const state = useClientFlowStore.getState()
    const moved = state.opportunities.find(
      (opportunity) => opportunity.id === "opp-lucia-booking",
    )

    expect(moved?.stage).toBe("contacted")
    expect(moved?.position).toBe(1)
    expect(state.activities[0].content).toContain("Contactado")
  })
})
