import type { Metadata } from "next"

import { OpportunitiesView } from "@/components/opportunities/opportunities-view"

export const metadata: Metadata = {
  title: "Oportunidades",
}

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ selected?: string }>
}) {
  const { selected } = await searchParams
  return <OpportunitiesView initialSelectedId={selected} />
}
