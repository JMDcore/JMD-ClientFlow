import type {
  ActivityType,
  ClientStatus,
  OpportunityStage,
  Priority,
} from "@/lib/types"

export const OPEN_STAGES: OpportunityStage[] = [
  "new",
  "contacted",
  "meeting",
  "proposal",
  "negotiation",
]

export const CLOSED_STAGES: OpportunityStage[] = ["won", "lost"]
export const ALL_STAGES: OpportunityStage[] = [...OPEN_STAGES, ...CLOSED_STAGES]

export const STAGE_CONFIG: Record<
  OpportunityStage,
  {
    label: string
    shortLabel: string
    probability: number
    color: string
    surfaceColor: string
    dotClass: string
    badgeClass: string
  }
> = {
  new: {
    label: "Nuevo lead",
    shortLabel: "Nuevo",
    probability: 10,
    color: "#647b91",
    surfaceColor: "#dfe7e9",
    dotClass: "bg-[#4a6fa5]",
    badgeClass: "border-[#4a6fa5]/20 bg-[#4a6fa5]/10 text-[#35547f]",
  },
  contacted: {
    label: "Contactado",
    shortLabel: "Contactado",
    probability: 25,
    color: "#77758e",
    surfaceColor: "#e4e3e7",
    dotClass: "bg-[#7a6fa3]",
    badgeClass: "border-[#7a6fa3]/20 bg-[#7a6fa3]/10 text-[#5f5680]",
  },
  meeting: {
    label: "Reunión agendada",
    shortLabel: "Reunión",
    probability: 45,
    color: "#aa8a4d",
    surfaceColor: "#e9e5dc",
    dotClass: "bg-[#d39b2f]",
    badgeClass: "border-[#d39b2f]/25 bg-[#d39b2f]/12 text-[#8a6315]",
  },
  proposal: {
    label: "Propuesta enviada",
    shortLabel: "Propuesta",
    probability: 65,
    color: "#b77260",
    surfaceColor: "#e9e1dd",
    dotClass: "bg-[#df7357]",
    badgeClass: "border-[#df7357]/20 bg-[#df7357]/10 text-[#a44f39]",
  },
  negotiation: {
    label: "Negociación",
    shortLabel: "Negociación",
    probability: 80,
    color: "#926d7d",
    surfaceColor: "#e7e0e3",
    dotClass: "bg-[#b05c7d]",
    badgeClass: "border-[#b05c7d]/20 bg-[#b05c7d]/10 text-[#87435e]",
  },
  won: {
    label: "Ganado",
    shortLabel: "Ganado",
    probability: 100,
    color: "#39765e",
    surfaceColor: "#dce8e1",
    dotClass: "bg-[#167b5b]",
    badgeClass: "border-[#167b5b]/20 bg-[#167b5b]/10 text-[#0f6247]",
  },
  lost: {
    label: "Perdido",
    shortLabel: "Perdido",
    probability: 0,
    color: "#707b76",
    surfaceColor: "#e0e5e2",
    dotClass: "bg-[#7b8280]",
    badgeClass: "border-[#7b8280]/20 bg-[#7b8280]/10 text-[#59605e]",
  },
}

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; badgeClass: string; dotClass: string }
> = {
  high: {
    label: "Alta",
    badgeClass: "border-[#df7357]/20 bg-[#df7357]/10 text-[#a44f39]",
    dotClass: "bg-[#df7357]",
  },
  medium: {
    label: "Media",
    badgeClass: "border-[#d39b2f]/25 bg-[#d39b2f]/10 text-[#8a6315]",
    dotClass: "bg-[#d39b2f]",
  },
  low: {
    label: "Baja",
    badgeClass: "border-border bg-muted text-muted-foreground",
    dotClass: "bg-[#8b9691]",
  },
}

export const CLIENT_STATUS_CONFIG: Record<
  ClientStatus,
  { label: string; badgeClass: string }
> = {
  prospect: {
    label: "Prospecto",
    badgeClass: "border-[#4a6fa5]/20 bg-[#4a6fa5]/10 text-[#35547f]",
  },
  active: {
    label: "Activo",
    badgeClass: "border-[#167b5b]/20 bg-[#167b5b]/10 text-[#0f6247]",
  },
  inactive: {
    label: "Inactivo",
    badgeClass: "border-border bg-muted text-muted-foreground",
  },
}

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  note: "Nota",
  email: "Email",
  call: "Llamada",
  meeting: "Reunión",
  stage: "Cambio de etapa",
  task: "Tarea",
}

export const AVATAR_COLORS = [
  "#dcebe5",
  "#e7e1f0",
  "#f3e2dc",
  "#e0e9f3",
  "#f2e9d6",
  "#dce8ea",
]
