"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { addDays, format } from "date-fns"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { FormField } from "@/components/shared/form-field"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ALL_STAGES, PRIORITY_CONFIG, STAGE_CONFIG } from "@/lib/constants"
import type { OpportunityInput, OpportunityStage, Priority } from "@/lib/types"
import { useClientFlowStore } from "@/store/use-clientflow-store"

const schema = z.object({
  title: z.string().trim().min(3, "Describe brevemente la oportunidad."),
  clientId: z.string().min(1, "Selecciona un cliente."),
  value: z.number().positive("El valor debe ser mayor que cero."),
  stage: z.enum([
    "new",
    "contacted",
    "meeting",
    "proposal",
    "negotiation",
    "won",
    "lost",
  ]),
  expectedCloseDate: z.string().min(1, "Selecciona una fecha."),
  nextFollowUpDate: z.string().min(1, "Selecciona una fecha."),
  priority: z.enum(["low", "medium", "high"]),
  notes: z.string(),
})

type OpportunityFormValues = z.infer<typeof schema>

function makeDefaults(
  clientId?: string,
  stage: OpportunityStage = "new",
): OpportunityFormValues {
  return {
    title: "",
    clientId: clientId ?? "",
    value: 1200,
    stage,
    expectedCloseDate: format(addDays(new Date(), 21), "yyyy-MM-dd"),
    nextFollowUpDate: format(addDays(new Date(), 2), "yyyy-MM-dd"),
    priority: "medium",
    notes: "",
  }
}

export function OpportunityDialog({
  open,
  onOpenChange,
  opportunityId,
  initialClientId,
  initialStage,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunityId?: string
  initialClientId?: string
  initialStage?: OpportunityStage
}) {
  const clients = useClientFlowStore((state) => state.clients)
  const opportunities = useClientFlowStore((state) => state.opportunities)
  const addOpportunity = useClientFlowStore((state) => state.addOpportunity)
  const updateOpportunity = useClientFlowStore(
    (state) => state.updateOpportunity,
  )
  const opportunity = opportunities.find((item) => item.id === opportunityId)
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OpportunityFormValues>({
    resolver: zodResolver(schema),
    defaultValues: makeDefaults(initialClientId, initialStage),
  })

  useEffect(() => {
    if (!open) return
    reset(
      opportunity
        ? {
            title: opportunity.title,
            clientId: opportunity.clientId,
            value: opportunity.value,
            stage: opportunity.stage,
            expectedCloseDate: opportunity.expectedCloseDate,
            nextFollowUpDate: opportunity.nextFollowUpAt.slice(0, 10),
            priority: opportunity.priority,
            notes: opportunity.notes,
          }
        : makeDefaults(initialClientId, initialStage),
    )
  }, [initialClientId, initialStage, open, opportunity, reset])

  const onSubmit = (values: OpportunityFormValues) => {
    const input: OpportunityInput = {
      title: values.title,
      clientId: values.clientId,
      value: values.value,
      stage: values.stage,
      expectedCloseDate: values.expectedCloseDate,
      nextFollowUpAt: new Date(
        `${values.nextFollowUpDate}T10:00:00`,
      ).toISOString(),
      priority: values.priority,
      notes: values.notes,
    }
    if (opportunity) {
      updateOpportunity(opportunity.id, input)
      toast.success("Oportunidad actualizada")
    } else {
      addOpportunity(input)
      toast.success("Oportunidad creada")
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {opportunity ? "Editar oportunidad" : "Nueva oportunidad"}
          </DialogTitle>
          <DialogDescription>
            Define el valor, la etapa y la próxima acción comercial.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Título"
            htmlFor="opportunity-title"
            error={errors.title?.message}
          >
            <Input
              id="opportunity-title"
              placeholder="Web corporativa para asesoría"
              {...register("title")}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Cliente"
              htmlFor="opportunity-client"
              error={errors.clientId?.message}
            >
              <Controller
                control={control}
                name="clientId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="opportunity-client" className="w-full">
                      <SelectValue placeholder="Seleccionar cliente">
                        {clients.find((client) => client.id === field.value)
                          ?.name ?? "Seleccionar cliente"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} · {client.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField
              label="Valor estimado (€)"
              htmlFor="opportunity-value"
              error={errors.value?.message}
            >
              <Input
                id="opportunity-value"
                type="number"
                min="1"
                step="50"
                {...register("value", { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              label="Etapa"
              htmlFor="opportunity-stage"
              error={errors.stage?.message}
            >
              <Controller
                control={control}
                name="stage"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(value as OpportunityStage)
                    }
                  >
                    <SelectTrigger id="opportunity-stage" className="w-full">
                      <SelectValue>
                        {STAGE_CONFIG[field.value].label}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {STAGE_CONFIG[stage].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField
              label="Prioridad"
              htmlFor="opportunity-priority"
              error={errors.priority?.message}
            >
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value as Priority)}
                  >
                    <SelectTrigger id="opportunity-priority" className="w-full">
                      <SelectValue>
                        {PRIORITY_CONFIG[field.value].label}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_CONFIG).map(
                        ([value, config]) => (
                          <SelectItem key={value} value={value}>
                            {config.label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField
              label="Cierre estimado"
              htmlFor="opportunity-close"
              error={errors.expectedCloseDate?.message}
            >
              <Input
                id="opportunity-close"
                type="date"
                {...register("expectedCloseDate")}
              />
            </FormField>
            <FormField
              label="Próximo seguimiento"
              htmlFor="opportunity-follow-up"
              error={errors.nextFollowUpDate?.message}
            >
              <Input
                id="opportunity-follow-up"
                type="date"
                {...register("nextFollowUpDate")}
              />
            </FormField>
          </div>
          <FormField label="Notas" htmlFor="opportunity-notes" optional>
            <Textarea
              id="opportunity-notes"
              rows={3}
              placeholder="Alcance, objeciones o próximos pasos..."
              {...register("notes")}
            />
          </FormField>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || clients.length === 0}
            >
              {opportunity ? "Guardar cambios" : "Crear oportunidad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
