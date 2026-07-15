"use client"

import { useMemo, useState } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import {
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  ListTodo,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { EntityAvatar } from "@/components/shared/entity-avatar"
import { PageHeader } from "@/components/shared/page-header"
import { PriorityBadge } from "@/components/shared/status-badges"
import { TaskDialog } from "@/components/tasks/task-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { getTaskDateState } from "@/lib/metrics"
import type { Priority } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useClientFlowStore } from "@/store/use-clientflow-store"

type TaskMode = "pending" | "completed"
type DateFilter = "all" | "overdue" | "today" | "upcoming"
type PriorityFilter = Priority | "all"

export function TasksView() {
  const [mode, setMode] = useState<TaskMode>("pending")
  const [query, setQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<DateFilter>("all")
  const [priority, setPriority] = useState<PriorityFilter>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string>()
  const [deletingId, setDeletingId] = useState<string>()
  const tasks = useClientFlowStore((state) => state.tasks)
  const clients = useClientFlowStore((state) => state.clients)
  const opportunities = useClientFlowStore((state) => state.opportunities)
  const toggleTask = useClientFlowStore((state) => state.toggleTask)
  const deleteTask = useClientFlowStore((state) => state.deleteTask)

  const counts = useMemo(() => {
    const pending = tasks.filter((task) => !task.completed)
    return {
      pending: pending.length,
      overdue: pending.filter(
        (task) => getTaskDateState(task.dueDate) === "overdue",
      ).length,
      today: pending.filter(
        (task) => getTaskDateState(task.dueDate) === "today",
      ).length,
      upcoming: pending.filter(
        (task) => getTaskDateState(task.dueDate) === "upcoming",
      ).length,
      completed: tasks.filter((task) => task.completed).length,
    }
  }, [tasks])

  const filteredTasks = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es")
    return tasks
      .filter((task) =>
        mode === "completed" ? task.completed : !task.completed,
      )
      .filter(
        (task) =>
          dateFilter === "all" || getTaskDateState(task.dueDate) === dateFilter,
      )
      .filter((task) => priority === "all" || task.priority === priority)
      .filter((task) => {
        if (!normalized) return true
        const client = clients.find((item) => item.id === task.clientId)
        const opportunity = opportunities.find(
          (item) => item.id === task.opportunityId,
        )
        return [
          task.title,
          client?.name ?? "",
          client?.company ?? "",
          opportunity?.title ?? "",
        ].some((value) => value.toLocaleLowerCase("es").includes(normalized))
      })
      .sort(
        (a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime(),
      )
  }, [clients, dateFilter, mode, opportunities, priority, query, tasks])

  const openNew = () => {
    setEditingId(undefined)
    setDialogOpen(true)
  }
  const openEdit = (id: string) => {
    setEditingId(id)
    setDialogOpen(true)
  }
  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    toggleTask(id)
    toast.success(currentlyCompleted ? "Tarea reabierta" : "Tarea completada")
  }
  const handleDelete = () => {
    if (!deletingId) return
    deleteTask(deletingId)
    setDeletingId(undefined)
    toast.success("Tarea eliminada")
  }

  return (
    <>
      <PageHeader
        title="Tareas"
        description={`${counts.pending} pendientes · ${counts.overdue} vencidas`}
        actions={
          <Button onClick={openNew}>
            <Plus /> Nueva tarea
          </Button>
        }
      />

      <section className="surface-panel mb-6 grid grid-cols-2 overflow-hidden rounded-lg sm:grid-cols-4">
        <button
          type="button"
          onClick={() => {
            setMode("pending")
            setDateFilter("overdue")
          }}
          className="flex min-h-[82px] items-center gap-3 border-r border-b bg-[#e7dedb] px-4 py-4 text-left transition-colors hover:bg-[#e1d4d0] sm:border-b-0"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-[#f3e2dc] text-[#a44f39] ring-1 ring-[#a44f39]/5">
            <CalendarClock className="size-4" />
          </span>
          <span>
            <span className="block text-[22px] leading-6 font-semibold">
              {counts.overdue}
            </span>
            <span className="text-muted-foreground block text-[11px]">
              Vencidas
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("pending")
            setDateFilter("today")
          }}
          className="flex min-h-[82px] items-center gap-3 border-b bg-[#e8e3d9] px-4 py-4 text-left transition-colors hover:bg-[#e1dacd] sm:border-r sm:border-b-0"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-[#f2e9d6] text-[#8a6315] ring-1 ring-[#8a6315]/5">
            <CalendarCheck2 className="size-4" />
          </span>
          <span>
            <span className="block text-[22px] leading-6 font-semibold">
              {counts.today}
            </span>
            <span className="text-muted-foreground block text-[11px]">
              Para hoy
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("pending")
            setDateFilter("upcoming")
          }}
          className="flex min-h-[82px] items-center gap-3 border-r bg-[#dfe6e7] px-4 py-4 text-left transition-colors hover:bg-[#d5e0e2]"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-[#e0e9f3] text-[#35547f] ring-1 ring-[#35547f]/5">
            <ListTodo className="size-4" />
          </span>
          <span>
            <span className="block text-[22px] leading-6 font-semibold">
              {counts.upcoming}
            </span>
            <span className="text-muted-foreground block text-[11px]">
              Próximas
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("completed")
            setDateFilter("all")
          }}
          className="flex min-h-[82px] items-center gap-3 bg-[#dbe7e1] px-4 py-4 text-left transition-colors hover:bg-[#d0ddd7]"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-[#dcebe5] text-[#0f6247] ring-1 ring-[#0f6247]/5">
            <CheckCircle2 className="size-4" />
          </span>
          <span>
            <span className="block text-[22px] leading-6 font-semibold">
              {counts.completed}
            </span>
            <span className="text-muted-foreground block text-[11px]">
              Completadas
            </span>
          </span>
        </button>
      </section>

      <section className="surface-panel overflow-hidden rounded-lg">
        <div className="flex flex-col gap-3 border-b bg-[#dce6e0] p-3.5 lg:flex-row lg:items-center">
          <div className="bg-muted/45 inline-flex w-fit rounded-lg border p-1">
            <button
              type="button"
              onClick={() => setMode("pending")}
              className={cn(
                "h-8 rounded-md px-3 text-xs font-medium",
                mode === "pending"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              Pendientes
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("completed")
                setDateFilter("all")
              }}
              className={cn(
                "h-8 rounded-md px-3 text-xs font-medium",
                mode === "completed"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              Completadas
            </button>
          </div>
          <div className="relative min-w-0 flex-1 lg:max-w-xs">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar tarea..."
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <Select
              value={dateFilter}
              onValueChange={(value) => setDateFilter(value as DateFilter)}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue>
                  {dateFilter === "all"
                    ? "Cualquier fecha"
                    : dateFilter === "overdue"
                      ? "Vencidas"
                      : dateFilter === "today"
                        ? "Para hoy"
                        : "Próximas"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cualquier fecha</SelectItem>
                <SelectItem value="overdue">Vencidas</SelectItem>
                <SelectItem value="today">Para hoy</SelectItem>
                <SelectItem value="upcoming">Próximas</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as PriorityFilter)}
            >
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue>
                  {priority === "all"
                    ? "Prioridad"
                    : priority === "high"
                      ? "Alta"
                      : priority === "medium"
                        ? "Media"
                        : "Baja"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Prioridad</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredTasks.length > 0 ? (
          <div className="divide-y">
            {filteredTasks.map((task) => {
              const client = clients.find((item) => item.id === task.clientId)
              const opportunity = opportunities.find(
                (item) => item.id === task.opportunityId,
              )
              const dateState = getTaskDateState(task.dueDate)
              return (
                <div
                  key={task.id}
                  className="flex min-h-[76px] items-center gap-3 px-4 py-3 transition-colors hover:bg-[#f9faf9] sm:px-5"
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() =>
                      handleToggle(task.id, task.completed)
                    }
                    aria-label={`Completar ${task.title}`}
                  />
                  {client && (
                    <div className="hidden sm:block">
                      <EntityAvatar
                        name={client.name}
                        color={client.avatarColor}
                        size="sm"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm font-medium",
                        task.completed && "text-muted-foreground line-through",
                      )}
                    >
                      {task.title}
                    </p>
                    <p className="text-muted-foreground mt-1 truncate text-xs">
                      {client?.company ?? "Sin cliente"}
                      {opportunity ? ` · ${opportunity.title}` : ""}
                    </p>
                  </div>
                  <PriorityBadge priority={task.priority} />
                  <span
                    className={cn(
                      "hidden w-24 shrink-0 text-right text-xs sm:block",
                      task.completed && "text-muted-foreground",
                      !task.completed &&
                        dateState === "overdue" &&
                        "text-destructive font-medium",
                      !task.completed &&
                        dateState === "today" &&
                        "font-medium text-[#8a6315]",
                      !task.completed &&
                        dateState === "upcoming" &&
                        "text-muted-foreground",
                    )}
                  >
                    {task.completed && task.completedAt
                      ? `Hecha ${format(parseISO(task.completedAt), "d MMM", { locale: es })}`
                      : dateState === "overdue"
                        ? `Venció ${format(parseISO(task.dueDate), "d MMM", { locale: es })}`
                        : dateState === "today"
                          ? "Hoy"
                          : format(parseISO(task.dueDate), "d MMM yyyy", {
                              locale: es,
                            })}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-sm" />}
                    >
                      <MoreHorizontal />
                      <span className="sr-only">Acciones</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(task.id)}>
                        <Pencil /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeletingId(task.id)}
                      >
                        <Trash2 /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={mode === "completed" ? CheckCircle2 : ListTodo}
            title={tasks.length === 0 ? "No hay tareas" : "Todo despejado"}
            description={
              tasks.length === 0
                ? "Añade una próxima acción para mantener tus oportunidades en movimiento."
                : "No hay tareas que coincidan con esta vista."
            }
            action={
              tasks.length === 0 ? (
                <Button onClick={openNew}>
                  <Plus /> Nueva tarea
                </Button>
              ) : undefined
            }
          />
        )}
      </section>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        taskId={editingId}
      />
      <ConfirmDeleteDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(undefined)}
        title="¿Eliminar esta tarea?"
        description="La tarea desaparecerá de tu agenda. Esta acción no se puede deshacer."
        onConfirm={handleDelete}
      />
    </>
  )
}
