import type { Metadata } from "next"

import { ClientsView } from "@/components/clients/clients-view"

export const metadata: Metadata = {
  title: "Clientes",
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ selected?: string }>
}) {
  const { selected } = await searchParams
  return <ClientsView initialSelectedId={selected} />
}
