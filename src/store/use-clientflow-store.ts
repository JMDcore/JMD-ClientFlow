"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { AVATAR_COLORS, STAGE_CONFIG } from "@/lib/constants"
import { createDemoData } from "@/lib/demo-data"
import type {
  Activity,
  ActivityInput,
  Client,
  ClientInput,
  Opportunity,
  OpportunityInput,
  OpportunityStage,
  Task,
  TaskInput,
} from "@/lib/types"

interface ClientFlowState {
  clients: Client[]
  opportunities: Opportunity[]
  tasks: Task[]
  activities: Activity[]
  addClient: (input: ClientInput) => string
  updateClient: (id: string, input: ClientInput) => void
  deleteClient: (id: string) => void
  addOpportunity: (input: OpportunityInput) => string
  updateOpportunity: (id: string, input: OpportunityInput) => void
  moveOpportunity: (
    id: string,
    targetStage: OpportunityStage,
    targetIndex: number,
  ) => void
  deleteOpportunity: (id: string) => void
  addTask: (input: TaskInput) => string
  updateTask: (id: string, input: TaskInput) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  addActivity: (input: ActivityInput) => string
  resetDemo: () => void
}

const initialData = createDemoData()

function makeId(prefix: string) {
  const value =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${prefix}-${value}`
}

function createActivity(input: ActivityInput): Activity {
  return {
    ...input,
    id: makeId("activity"),
    occurredAt: new Date().toISOString(),
  }
}

export const useClientFlowStore = create<ClientFlowState>()(
  persist(
    (set, get) => ({
      ...initialData,
      addClient: (input) => {
        const id = makeId("client")
        const client: Client = {
          ...input,
          id,
          avatarColor:
            AVATAR_COLORS[get().clients.length % AVATAR_COLORS.length],
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ clients: [client, ...state.clients] }))
        return id
      },
      updateClient: (id, input) =>
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === id ? { ...client, ...input } : client,
          ),
        })),
      deleteClient: (id) =>
        set((state) => {
          const opportunityIds = state.opportunities
            .filter((opportunity) => opportunity.clientId === id)
            .map((opportunity) => opportunity.id)
          return {
            clients: state.clients.filter((client) => client.id !== id),
            opportunities: state.opportunities.filter(
              (opportunity) => opportunity.clientId !== id,
            ),
            tasks: state.tasks.filter(
              (task) =>
                task.clientId !== id &&
                (!task.opportunityId ||
                  !opportunityIds.includes(task.opportunityId)),
            ),
            activities: state.activities.filter(
              (activity) =>
                activity.clientId !== id &&
                (!activity.opportunityId ||
                  !opportunityIds.includes(activity.opportunityId)),
            ),
          }
        }),
      addOpportunity: (input) => {
        const id = makeId("opportunity")
        const now = new Date().toISOString()
        const position = get().opportunities.filter(
          (opportunity) => opportunity.stage === input.stage,
        ).length
        const opportunity: Opportunity = {
          ...input,
          id,
          position,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          opportunities: [opportunity, ...state.opportunities],
          activities: [
            createActivity({
              type: "stage",
              content: `Oportunidad creada en ${STAGE_CONFIG[input.stage].label}.`,
              clientId: input.clientId,
              opportunityId: id,
            }),
            ...state.activities,
          ],
        }))
        return id
      },
      updateOpportunity: (id, input) =>
        set((state) => {
          const current = state.opportunities.find(
            (opportunity) => opportunity.id === id,
          )
          const stageChanged = current && current.stage !== input.stage
          return {
            opportunities: state.opportunities.map((opportunity) =>
              opportunity.id === id
                ? {
                    ...opportunity,
                    ...input,
                    updatedAt: new Date().toISOString(),
                  }
                : opportunity,
            ),
            activities: stageChanged
              ? [
                  createActivity({
                    type: "stage",
                    content: `La oportunidad pasó a ${STAGE_CONFIG[input.stage].label}.`,
                    clientId: input.clientId,
                    opportunityId: id,
                  }),
                  ...state.activities,
                ]
              : state.activities,
          }
        }),
      moveOpportunity: (id, targetStage, targetIndex) =>
        set((state) => {
          const current = state.opportunities.find(
            (opportunity) => opportunity.id === id,
          )
          if (!current) return state

          const targetItems = state.opportunities
            .filter(
              (opportunity) =>
                opportunity.stage === targetStage && opportunity.id !== id,
            )
            .sort((a, b) => a.position - b.position)
          const safeIndex = Math.max(
            0,
            Math.min(targetIndex, targetItems.length),
          )
          targetItems.splice(safeIndex, 0, { ...current, stage: targetStage })
          const targetPositions = new Map(
            targetItems.map((opportunity, index) => [opportunity.id, index]),
          )
          const oldStageItems = state.opportunities
            .filter(
              (opportunity) =>
                opportunity.stage === current.stage &&
                opportunity.id !== current.id,
            )
            .sort((a, b) => a.position - b.position)
          const oldPositions = new Map(
            oldStageItems.map((opportunity, index) => [opportunity.id, index]),
          )
          const stageChanged = current.stage !== targetStage

          return {
            opportunities: state.opportunities.map((opportunity) => {
              if (opportunity.id === id) {
                return {
                  ...opportunity,
                  stage: targetStage,
                  position: safeIndex,
                  updatedAt: new Date().toISOString(),
                }
              }
              if (targetPositions.has(opportunity.id)) {
                return {
                  ...opportunity,
                  position: targetPositions.get(opportunity.id)!,
                }
              }
              if (stageChanged && oldPositions.has(opportunity.id)) {
                return {
                  ...opportunity,
                  position: oldPositions.get(opportunity.id)!,
                }
              }
              return opportunity
            }),
            activities: stageChanged
              ? [
                  createActivity({
                    type: "stage",
                    content: `La oportunidad pasó a ${STAGE_CONFIG[targetStage].label}.`,
                    clientId: current.clientId,
                    opportunityId: id,
                  }),
                  ...state.activities,
                ]
              : state.activities,
          }
        }),
      deleteOpportunity: (id) =>
        set((state) => ({
          opportunities: state.opportunities.filter(
            (opportunity) => opportunity.id !== id,
          ),
          tasks: state.tasks.filter((task) => task.opportunityId !== id),
          activities: state.activities.filter(
            (activity) => activity.opportunityId !== id,
          ),
        })),
      addTask: (input) => {
        const id = makeId("task")
        const task: Task = {
          ...input,
          id,
          completed: false,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ tasks: [task, ...state.tasks] }))
        return id
      },
      updateTask: (id, input) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...input } : task,
          ),
        })),
      toggleTask: (id) =>
        set((state) => {
          const task = state.tasks.find((item) => item.id === id)
          if (!task) return state
          const completed = !task.completed
          return {
            tasks: state.tasks.map((item) =>
              item.id === id
                ? {
                    ...item,
                    completed,
                    completedAt: completed
                      ? new Date().toISOString()
                      : undefined,
                  }
                : item,
            ),
            activities:
              completed && (task.clientId || task.opportunityId)
                ? [
                    createActivity({
                      type: "task",
                      content: `Tarea completada: ${task.title}.`,
                      clientId: task.clientId,
                      opportunityId: task.opportunityId,
                    }),
                    ...state.activities,
                  ]
                : state.activities,
          }
        }),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      addActivity: (input) => {
        const activity = createActivity(input)
        set((state) => ({ activities: [activity, ...state.activities] }))
        return activity.id
      },
      resetDemo: () => set(createDemoData()),
    }),
    {
      name: "jmd-clientflow-demo-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        clients: state.clients,
        opportunities: state.opportunities,
        tasks: state.tasks,
        activities: state.activities,
      }),
    },
  ),
)
