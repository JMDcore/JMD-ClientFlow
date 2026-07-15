"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { BriefcaseBusiness, Search, Users } from "lucide-react"

import { EntityAvatar } from "@/components/shared/entity-avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { STAGE_CONFIG } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { useClientFlowStore } from "@/store/use-clientflow-store"

export function GlobalSearch({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const clients = useClientFlowStore((state) => state.clients)
  const opportunities = useClientFlowStore((state) => state.opportunities)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        const target = event.target as HTMLElement
        if (["INPUT", "TEXTAREA"].includes(target.tagName)) return
        event.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es")
    if (!normalized)
      return {
        clients: clients.slice(0, 3),
        opportunities: opportunities.slice(0, 3),
      }
    return {
      clients: clients
        .filter((client) =>
          [client.name, client.company, client.email].some((value) =>
            value.toLocaleLowerCase("es").includes(normalized),
          ),
        )
        .slice(0, 5),
      opportunities: opportunities
        .filter((opportunity) =>
          opportunity.title.toLocaleLowerCase("es").includes(normalized),
        )
        .slice(0, 5),
    }
  }, [clients, opportunities, query])

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "h-10 w-full max-w-[420px] justify-start gap-2.5 px-3.5 shadow-none",
          dark
            ? "border-white/10 bg-white/[0.055] text-[#aab5af] hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
            : "text-muted-foreground border-[#e3e7e4] bg-[#f8f9f8] hover:bg-[#f5f7f6]",
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="truncate">Buscar clientes u oportunidades</span>
        <kbd
          className={cn(
            "ml-auto hidden min-w-5 items-center justify-center rounded border px-1.5 py-0.5 font-mono text-[10px] shadow-[0_1px_1px_rgba(20,27,23,0.04)] sm:inline-flex",
            dark ? "border-white/10 bg-black/15 text-[#aab5af]" : "bg-white",
          )}
        >
          /
        </kbd>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Buscar</DialogTitle>
            <DialogDescription>
              Busca clientes y oportunidades.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 border-b px-4">
            <Search className="text-muted-foreground size-4" />
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Escribe un nombre, empresa u oportunidad..."
              className="h-12 border-0 px-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="max-h-[420px] scrollbar-thin overflow-y-auto p-2">
            {results.clients.length > 0 && (
              <div className="mb-3">
                <p className="text-muted-foreground flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-semibold tracking-[0.08em] uppercase">
                  <Users className="size-3.5" /> Clientes
                </p>
                {results.clients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/clients?selected=${client.id}`}
                    onClick={() => setOpen(false)}
                    className="hover:bg-muted flex items-center gap-3 rounded-lg px-2 py-2"
                  >
                    <EntityAvatar
                      name={client.name}
                      color={client.avatarColor}
                      size="sm"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {client.name}
                      </span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {client.company}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
            {results.opportunities.length > 0 && (
              <div>
                <p className="text-muted-foreground flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-semibold tracking-[0.08em] uppercase">
                  <BriefcaseBusiness className="size-3.5" /> Oportunidades
                </p>
                {results.opportunities.map((opportunity) => {
                  const client = clients.find(
                    (item) => item.id === opportunity.clientId,
                  )
                  return (
                    <Link
                      key={opportunity.id}
                      href={`/opportunities?selected=${opportunity.id}`}
                      onClick={() => setOpen(false)}
                      className="hover:bg-muted flex items-center gap-3 rounded-lg px-2 py-2"
                    >
                      <span className="text-muted-foreground grid size-8 place-items-center rounded-lg bg-[#f0f3f1]">
                        <BriefcaseBusiness className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {opportunity.title}
                        </span>
                        <span className="text-muted-foreground block truncate text-xs">
                          {client?.company} ·{" "}
                          {STAGE_CONFIG[opportunity.stage].label}
                        </span>
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
            {results.clients.length === 0 &&
              results.opportunities.length === 0 && (
                <div className="text-muted-foreground px-4 py-12 text-center text-sm">
                  No hay resultados para “{query}”.
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
