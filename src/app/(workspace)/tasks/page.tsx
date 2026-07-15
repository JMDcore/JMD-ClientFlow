import type { Metadata } from "next"

import { TasksView } from "@/components/tasks/tasks-view"

export const metadata: Metadata = {
  title: "Tareas",
}

export default function TasksPage() {
  return <TasksView />
}
