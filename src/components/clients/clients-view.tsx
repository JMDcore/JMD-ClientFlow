"use client"

import { useMemo, useState } from "react"
import { format, formatDistanceToNow, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import {
  Download,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react"
import Papa from "papaparse"
import { toast } from "sonner"

import { ClientDetailsSheet } from "@/components/clients/client-details-sheet"
import { ClientDialog } from "@/components/clients/client-dialog"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { EntityAvatar } from "@/components/shared/entity-avatar"
import { PageHeader } from "@/components/shared/page-header"
import { ClientStatusBadge } from "@/components/shared/status-badges"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CLIENT_STATUS_CONFIG } from "@/lib/constants"
import { currencyFormatter } from "@/lib/metrics"
import type { ClientStatus } from "@/lib/types"
import { useClientFlowStore } from "@/store/use-clientflow-store"

type StatusFilter = ClientStatus | "all"

export function ClientsView({
  initialSelectedId,
}: {
  initialSelectedId?: string
}) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string>()
  const [selectedId, setSelectedId] = useState<string | undefined>(
    initialSelectedId,
  )
  const [deletingId, setDeletingId] = useState<string>()
  const clients = useClientFlowStore((state) => state.clients)
  const opportunities = useClientFlowStore((state) => state.opportunities)
  const deleteClient = useClientFlowStore((state) => state.deleteClient)

  const filteredClients = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es")
    return clients
      .filter((client) => status === "all" || client.status === status)
      .filter(
        (client) =>
          !normalized ||
          [client.name, client.company, client.email, client.industry].some(
            (value) => value.toLocaleLowerCase("es").includes(normalized),
          ),
      )
      .sort((a, b) => a.name.localeCompare(b.name, "es"))
  }, [clients, query, status])

  const openNew = () => {
    setEditingId(undefined)
    setDialogOpen(true)
  }

  const openEdit = (id: string) => {
    setEditingId(id)
    setDialogOpen(true)
  }

  const handleDelete = () => {
    if (!deletingId) return
    deleteClient(deletingId)
    if (selectedId === deletingId) setSelectedId(undefined)
    setDeletingId(undefined)
    toast.success("Cliente eliminado")
  }

  const exportClients = () => {
    const rows = clients.map((client) => ({
      Nombre: client.name,
      Email: client.email,
      Teléfono: client.phone,
      Empresa: client.company,
      Sector: client.industry,
      Estado: CLIENT_STATUS_CONFIG[client.status].label,
      "Último contacto": format(parseISO(client.lastContactAt), "yyyy-MM-dd"),
      Notas: client.notes,
    }))
    const csv = Papa.unparse(rows)
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `clientflow-clientes-${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`${clients.length} clientes exportados`)
  }

  return (
    <>
      <PageHeader
        title="Clientes"
        description={`${clients.length} contactos centralizados en tu espacio de trabajo`}
        actions={
          <>
            <Button
              variant="outline"
              onClick={exportClients}
              disabled={clients.length === 0}
            >
              <Download /> Exportar CSV
            </Button>
            <Button onClick={openNew}>
              <Plus /> Nuevo cliente
            </Button>
          </>
        }
      />

      <section className="surface-panel overflow-hidden rounded-lg">
        <div className="flex flex-col gap-3 border-b bg-[#dce6e0] p-3.5 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, empresa o email..."
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as StatusFilter)}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue>
                {status === "all"
                  ? "Todos los estados"
                  : CLIENT_STATUS_CONFIG[status].label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(CLIENT_STATUS_CONFIG).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground rounded-md bg-[#f0f2f1] px-2 py-1 text-[11px] font-medium whitespace-nowrap">
            {filteredClients.length} resultados
          </span>
        </div>

        {filteredClients.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#d8e3dd] hover:bg-[#d8e3dd]">
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Oportunidades</TableHead>
                    <TableHead className="text-right">Pipeline</TableHead>
                    <TableHead>Último contacto</TableHead>
                    <TableHead className="w-12">
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => {
                    const clientOpportunities = opportunities.filter(
                      (opportunity) => opportunity.clientId === client.id,
                    )
                    const pipeline = clientOpportunities
                      .filter(
                        (opportunity) =>
                          !["won", "lost"].includes(opportunity.stage),
                      )
                      .reduce(
                        (total, opportunity) => total + opportunity.value,
                        0,
                      )
                    return (
                      <TableRow key={client.id}>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => setSelectedId(client.id)}
                            className="hover:text-primary flex min-w-0 items-center gap-3 text-left"
                          >
                            <EntityAvatar
                              name={client.name}
                              color={client.avatarColor}
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold">
                                {client.name}
                              </span>
                              <span className="text-muted-foreground mt-0.5 block truncate text-xs">
                                {client.company} · {client.industry}
                              </span>
                            </span>
                          </button>
                        </TableCell>
                        <TableCell>
                          <a
                            href={`mailto:${client.email}`}
                            className="text-muted-foreground hover:text-primary flex items-center gap-2 text-xs"
                          >
                            <Mail className="size-3.5" />
                            <span className="max-w-48 truncate">
                              {client.email}
                            </span>
                          </a>
                        </TableCell>
                        <TableCell>
                          <ClientStatusBadge status={client.status} />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {clientOpportunities.length}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {currencyFormatter.format(pipeline)}
                        </TableCell>
                        <TableCell>
                          <span
                            className="text-muted-foreground text-xs"
                            title={format(
                              parseISO(client.lastContactAt),
                              "PPpp",
                              { locale: es },
                            )}
                          >
                            {formatDistanceToNow(
                              parseISO(client.lastContactAt),
                              { addSuffix: true, locale: es },
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={<Button variant="ghost" size="icon-sm" />}
                            >
                              <MoreHorizontal />
                              <span className="sr-only">
                                Acciones para {client.name}
                              </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setSelectedId(client.id)}
                              >
                                <Users /> Ver detalle
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openEdit(client.id)}
                              >
                                <Pencil /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeletingId(client.id)}
                              >
                                <Trash2 /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="divide-y md:hidden">
              {filteredClients.map((client) => {
                const clientOpportunities = opportunities.filter(
                  (opportunity) => opportunity.clientId === client.id,
                )
                return (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => setSelectedId(client.id)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#f8faf9]"
                  >
                    <EntityAvatar
                      name={client.name}
                      color={client.avatarColor}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {client.name}
                      </span>
                      <span className="text-muted-foreground mt-0.5 block truncate text-xs">
                        {client.company}
                      </span>
                      <span className="mt-1.5 flex items-center gap-2">
                        <ClientStatusBadge status={client.status} />
                        <span className="text-muted-foreground text-[10px]">
                          {clientOpportunities.length} oportunidades
                        </span>
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Users}
            title={
              clients.length === 0
                ? "Tu cartera está vacía"
                : "No encontramos clientes"
            }
            description={
              clients.length === 0
                ? "Crea el primer cliente para empezar a construir tu pipeline."
                : "Prueba con otra búsqueda o elimina algún filtro."
            }
            action={
              clients.length === 0 ? (
                <Button onClick={openNew}>
                  <Plus /> Nuevo cliente
                </Button>
              ) : undefined
            }
          />
        )}
      </section>

      <ClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        clientId={editingId}
      />
      <ClientDetailsSheet
        clientId={selectedId}
        open={Boolean(selectedId)}
        onOpenChange={(open) => !open && setSelectedId(undefined)}
      />
      <ConfirmDeleteDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(undefined)}
        title="¿Eliminar este cliente?"
        description="También se eliminarán sus oportunidades, tareas y actividad. Esta acción no se puede deshacer."
        onConfirm={handleDelete}
      />
    </>
  )
}
