"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, parseISO } from "date-fns"
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
import { CLIENT_STATUS_CONFIG } from "@/lib/constants"
import type { ClientInput, ClientStatus } from "@/lib/types"
import { useClientFlowStore } from "@/store/use-clientflow-store"

const schema = z.object({
  name: z.string().trim().min(2, "Escribe el nombre del cliente."),
  email: z.email("Introduce un email válido."),
  phone: z.string().trim().min(6, "Introduce un teléfono válido."),
  company: z.string().trim().min(2, "Escribe el nombre de la empresa."),
  industry: z.string().trim().min(2, "Indica el sector."),
  status: z.enum(["prospect", "active", "inactive"]),
  lastContactDate: z.string().min(1, "Selecciona una fecha."),
  notes: z.string(),
})

type ClientFormValues = z.infer<typeof schema>

const defaultValues: ClientFormValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  industry: "",
  status: "prospect",
  lastContactDate: format(new Date(), "yyyy-MM-dd"),
  notes: "",
}

export function ClientDialog({
  open,
  onOpenChange,
  clientId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId?: string
}) {
  const clients = useClientFlowStore((state) => state.clients)
  const addClient = useClientFlowStore((state) => state.addClient)
  const updateClient = useClientFlowStore((state) => state.updateClient)
  const client = clients.find((item) => item.id === clientId)
  const editing = Boolean(client)
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return
    reset(
      client
        ? {
            name: client.name,
            email: client.email,
            phone: client.phone,
            company: client.company,
            industry: client.industry,
            status: client.status,
            lastContactDate: format(
              parseISO(client.lastContactAt),
              "yyyy-MM-dd",
            ),
            notes: client.notes,
          }
        : defaultValues,
    )
  }, [client, open, reset])

  const onSubmit = (values: ClientFormValues) => {
    const input: ClientInput = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      company: values.company,
      industry: values.industry,
      status: values.status,
      lastContactAt: new Date(
        `${values.lastContactDate}T12:00:00`,
      ).toISOString(),
      notes: values.notes,
    }

    if (client) {
      updateClient(client.id, input)
      toast.success("Cliente actualizado")
    } else {
      addClient(input)
      toast.success("Cliente creado")
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar cliente" : "Nuevo cliente"}
          </DialogTitle>
          <DialogDescription>
            Guarda los datos esenciales y el contexto de la relación.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Nombre"
              htmlFor="client-name"
              error={errors.name?.message}
            >
              <Input
                id="client-name"
                placeholder="Nombre y apellidos"
                {...register("name")}
              />
            </FormField>
            <FormField
              label="Empresa"
              htmlFor="client-company"
              error={errors.company?.message}
            >
              <Input
                id="client-company"
                placeholder="Nombre comercial"
                {...register("company")}
              />
            </FormField>
            <FormField
              label="Email"
              htmlFor="client-email"
              error={errors.email?.message}
            >
              <Input
                id="client-email"
                type="email"
                placeholder="cliente@empresa.com"
                {...register("email")}
              />
            </FormField>
            <FormField
              label="Teléfono"
              htmlFor="client-phone"
              error={errors.phone?.message}
            >
              <Input
                id="client-phone"
                placeholder="+34 600 000 000"
                {...register("phone")}
              />
            </FormField>
            <FormField
              label="Sector"
              htmlFor="client-industry"
              error={errors.industry?.message}
            >
              <Input
                id="client-industry"
                placeholder="Tecnología, salud..."
                {...register("industry")}
              />
            </FormField>
            <FormField
              label="Estado"
              htmlFor="client-status"
              error={errors.status?.message}
            >
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(value as ClientStatus)
                    }
                  >
                    <SelectTrigger id="client-status" className="w-full">
                      <SelectValue>
                        {CLIENT_STATUS_CONFIG[field.value].label}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CLIENT_STATUS_CONFIG).map(
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
              label="Último contacto"
              htmlFor="client-last-contact"
              error={errors.lastContactDate?.message}
            >
              <Input
                id="client-last-contact"
                type="date"
                {...register("lastContactDate")}
              />
            </FormField>
          </div>
          <FormField label="Notas" htmlFor="client-notes" optional>
            <Textarea
              id="client-notes"
              rows={3}
              placeholder="Preferencias, contexto o detalles importantes..."
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
            <Button type="submit" disabled={isSubmitting}>
              {editing ? "Guardar cambios" : "Crear cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
