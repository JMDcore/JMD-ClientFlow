"use client"

import { zodResolver } from "@hookform/resolvers/zod"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ACTIVITY_LABELS } from "@/lib/constants"
import type { ActivityType } from "@/lib/types"
import { useClientFlowStore } from "@/store/use-clientflow-store"

const schema = z.object({
  type: z.enum(["note", "email", "call", "meeting"]),
  content: z.string().trim().min(4, "Añade un poco más de contexto."),
})

type ActivityFormValues = z.infer<typeof schema>

export function ActivityDialog({
  open,
  onOpenChange,
  clientId,
  opportunityId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId?: string
  opportunityId?: string
}) {
  const addActivity = useClientFlowStore((state) => state.addActivity)
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "note", content: "" },
  })

  const onSubmit = (values: ActivityFormValues) => {
    addActivity({ ...values, clientId, opportunityId })
    toast.success("Actividad registrada")
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar actividad</DialogTitle>
          <DialogDescription>
            Añade una nota al historial para conservar el contexto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Tipo"
            htmlFor="activity-type"
            error={errors.type?.message}
          >
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(value as ActivityType)
                  }
                >
                  <SelectTrigger id="activity-type" className="w-full">
                    <SelectValue>{ACTIVITY_LABELS[field.value]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      ["note", "email", "call", "meeting"] as ActivityType[]
                    ).map((type) => (
                      <SelectItem key={type} value={type}>
                        {ACTIVITY_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField
            label="Detalle"
            htmlFor="activity-content"
            error={errors.content?.message}
          >
            <Textarea
              id="activity-content"
              rows={4}
              placeholder="¿Qué ocurrió y cuál es el siguiente paso?"
              {...register("content")}
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
            <Button type="submit">Guardar actividad</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
