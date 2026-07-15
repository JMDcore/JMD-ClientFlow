"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { addDays, format } from "date-fns"
import { Controller, useForm, useWatch } from "react-hook-form"
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
import { PRIORITY_CONFIG } from "@/lib/constants"
import type { Priority, TaskInput } from "@/lib/types"
import { useClientFlowStore } from "@/store/use-clientflow-store"

const schema = z.object({
  title: z.string().trim().min(3, "Describe la tarea."),
  dueDate: z.string().min(1, "Selecciona una fecha."),
  priority: z.enum(["low", "medium", "high"]),
  clientId: z.string(),
  opportunityId: z.string(),
})

type TaskFormValues = z.infer<typeof schema>

function makeDefaults(
  clientId?: string,
  opportunityId?: string,
): TaskFormValues {
  return {
    title: "",
    dueDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    priority: "medium",
    clientId: clientId ?? "none",
    opportunityId: opportunityId ?? "none",
  }
}

export function TaskDialog({
  open,
  onOpenChange,
  taskId,
  initialClientId,
  initialOpportunityId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId?: string
  initialClientId?: string
  initialOpportunityId?: string
}) {
  const clients = useClientFlowStore((state) => state.clients)
  const opportunities = useClientFlowStore((state) => state.opportunities)
  const tasks = useClientFlowStore((state) => state.tasks)
  const addTask = useClientFlowStore((state) => state.addTask)
  const updateTask = useClientFlowStore((state) => state.updateTask)
  const task = tasks.find((item) => item.id === taskId)
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(schema),
    defaultValues: makeDefaults(initialClientId, initialOpportunityId),
  })
  const selectedClientId = useWatch({ control, name: "clientId" })

  useEffect(() => {
    if (!open) return
    reset(
      task
        ? {
            title: task.title,
            dueDate: task.dueDate,
            priority: task.priority,
            clientId: task.clientId ?? "none",
            opportunityId: task.opportunityId ?? "none",
          }
        : makeDefaults(initialClientId, initialOpportunityId),
    )
  }, [initialClientId, initialOpportunityId, open, reset, task])

  const onSubmit = (values: TaskFormValues) => {
    const selectedOpportunity = opportunities.find(
      (opportunity) => opportunity.id === values.opportunityId,
    )
    const input: TaskInput = {
      title: values.title,
      dueDate: values.dueDate,
      priority: values.priority,
      clientId:
        selectedOpportunity?.clientId ??
        (values.clientId === "none" ? undefined : values.clientId),
      opportunityId:
        values.opportunityId === "none" ? undefined : values.opportunityId,
    }
    if (task) {
      updateTask(task.id, input)
      toast.success("Tarea actualizada")
    } else {
      addTask(input)
      toast.success("Tarea creada")
    }
    onOpenChange(false)
  }

  const availableOpportunities = opportunities.filter(
    (opportunity) =>
      selectedClientId === "none" || opportunity.clientId === selectedClientId,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Editar tarea" : "Nueva tarea"}</DialogTitle>
          <DialogDescription>
            Define una próxima acción y relaciónala con el trabajo adecuado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Tarea"
            htmlFor="task-title"
            error={errors.title?.message}
          >
            <Input
              id="task-title"
              placeholder="Enviar propuesta revisada"
              {...register("title")}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Fecha límite"
              htmlFor="task-due"
              error={errors.dueDate?.message}
            >
              <Input id="task-due" type="date" {...register("dueDate")} />
            </FormField>
            <FormField
              label="Prioridad"
              htmlFor="task-priority"
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
                    <SelectTrigger id="task-priority" className="w-full">
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
            <FormField label="Cliente" htmlFor="task-client" optional>
              <Controller
                control={control}
                name="clientId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value)
                      setValue("opportunityId", "none")
                    }}
                  >
                    <SelectTrigger id="task-client" className="w-full">
                      <SelectValue>
                        {field.value === "none"
                          ? "Sin cliente"
                          : clients.find((client) => client.id === field.value)
                              ?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin cliente</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField label="Oportunidad" htmlFor="task-opportunity" optional>
              <Controller
                control={control}
                name="opportunityId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="task-opportunity" className="w-full">
                      <SelectValue>
                        {field.value === "none"
                          ? "Sin oportunidad"
                          : opportunities.find(
                              (opportunity) => opportunity.id === field.value,
                            )?.title}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin oportunidad</SelectItem>
                      {availableOpportunities.map((opportunity) => (
                        <SelectItem key={opportunity.id} value={opportunity.id}>
                          {opportunity.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {task ? "Guardar cambios" : "Crear tarea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
