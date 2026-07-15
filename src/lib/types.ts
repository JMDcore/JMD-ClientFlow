export type ClientStatus = "prospect" | "active" | "inactive"

export type OpportunityStage =
  "new" | "contacted" | "meeting" | "proposal" | "negotiation" | "won" | "lost"

export type Priority = "low" | "medium" | "high"

export type ActivityType =
  "note" | "email" | "call" | "meeting" | "stage" | "task"

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  company: string
  industry: string
  notes: string
  status: ClientStatus
  avatarColor: string
  lastContactAt: string
  createdAt: string
}

export interface Opportunity {
  id: string
  title: string
  clientId: string
  value: number
  stage: OpportunityStage
  expectedCloseDate: string
  nextFollowUpAt: string
  priority: Priority
  notes: string
  position: number
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  clientId?: string
  opportunityId?: string
  dueDate: string
  priority: Priority
  completed: boolean
  completedAt?: string
  createdAt: string
}

export interface Activity {
  id: string
  type: ActivityType
  content: string
  clientId?: string
  opportunityId?: string
  occurredAt: string
}

export interface DemoData {
  clients: Client[]
  opportunities: Opportunity[]
  tasks: Task[]
  activities: Activity[]
}

export type ClientInput = Omit<Client, "id" | "createdAt" | "avatarColor">
export type OpportunityInput = Omit<
  Opportunity,
  "id" | "createdAt" | "updatedAt" | "position"
>
export type TaskInput = Omit<
  Task,
  "id" | "createdAt" | "completed" | "completedAt"
>
export type ActivityInput = Omit<Activity, "id" | "occurredAt">
