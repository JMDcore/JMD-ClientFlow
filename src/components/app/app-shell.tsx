"use client"

import { useSyncExternalStore } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  Columns3,
  ListTodo,
  Menu,
  RotateCcw,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { Brand } from "@/components/app/brand"
import { GlobalSearch } from "@/components/app/global-search"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { OWNER_AVATAR } from "@/lib/avatar-images"
import { useClientFlowStore } from "@/store/use-clientflow-store"

const navigation = [
  { name: "Resumen", href: "/", icon: BarChart3 },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Oportunidades", href: "/opportunities", icon: BriefcaseBusiness },
  { name: "Pipeline", href: "/pipeline", icon: Columns3 },
  { name: "Tareas", href: "/tasks", icon: ListTodo },
]

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

function NavLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname()

  return (
    <nav
      className={cn("space-y-1.5", mobile && "mt-6")}
      aria-label="Navegación principal"
    >
      {navigation.map((item) => {
        const active = isActivePath(pathname, item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group relative flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors",
              mobile &&
                (active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"),
              !mobile &&
                (active
                  ? "bg-white/[0.075] text-white"
                  : "text-[#b1beb7] hover:bg-white/[0.055] hover:text-[#f1f5f2]"),
            )}
          >
            {!mobile && active && (
              <span className="bg-sidebar-primary absolute top-2 bottom-2 left-0 w-0.5 rounded-full" />
            )}
            <Icon
              className={cn(
                "size-[17px] transition-colors",
                !mobile && active && "text-[#74b99e]",
              )}
              strokeWidth={active ? 2.2 : 1.8}
            />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}

function WorkspaceMenu({ inverted = false }: { inverted?: boolean }) {
  const resetDemo = useClientFlowStore((state) => state.resetDemo)

  const handleReset = () => {
    resetDemo()
    toast.success("Datos de demostración restaurados")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className={cn(
              "h-11 w-full justify-start gap-2.5 px-2",
              inverted &&
                "text-white hover:bg-white/[0.06] hover:text-white aria-expanded:bg-white/[0.06]",
            )}
          />
        }
      >
        <span className="relative size-8 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/15">
          <Image
            src={OWNER_AVATAR}
            alt="José Miguel Díaz"
            fill
            sizes="32px"
            className="object-cover"
          />
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate text-xs font-semibold">
            José Miguel
          </span>
          <span
            className={cn(
              "block truncate text-[11px]",
              inverted ? "text-[#a2afa8]" : "text-muted-foreground",
            )}
          >
            Workspace personal
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-3.5",
            inverted ? "text-[#91a099]" : "text-muted-foreground",
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Demo local</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleReset}>
            <RotateCcw />
            Restaurar datos
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ShellSkeleton() {
  return (
    <div className="bg-background min-h-screen">
      <aside className="bg-sidebar fixed inset-y-0 left-0 hidden w-[248px] border-r p-4 lg:block">
        <Skeleton className="h-8 w-32" />
        <div className="mt-10 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-full" />
          ))}
        </div>
      </aside>
      <div className="lg:pl-[248px]">
        <Skeleton className="h-[72px] w-full rounded-none" />
        <div className="mx-auto max-w-[1480px] space-y-6 p-5 lg:p-8">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-28 w-full" />
          <div className="grid gap-5 lg:grid-cols-3">
            <Skeleton className="h-80 lg:col-span-2" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    </div>
  )
}

const subscribeToClient = () => () => undefined

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const mounted = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  )

  if (!mounted) return <ShellSkeleton />

  return (
    <div className="bg-background min-h-screen">
      <aside className="border-sidebar-border bg-sidebar fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r lg:flex lg:flex-col">
        <div className="flex h-[72px] items-center px-5">
          <Link href="/" aria-label="Ir al resumen">
            <Brand inverted />
          </Link>
        </div>
        <div className="flex-1 px-3 py-5">
          <p className="mb-3 px-3 text-[9px] font-semibold tracking-[0.1em] text-[#829188] uppercase">
            Operaciones
          </p>
          <NavLinks />
        </div>
        <div className="border-sidebar-border border-t p-3">
          <div className="mb-2 flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.045] px-3 py-2.5 text-[10px] text-[#adbbb3]">
            <CheckCircle2 className="size-3.5 text-[#55b591]" />
            Datos guardados localmente
          </div>
          <WorkspaceMenu inverted />
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="border-sidebar-border bg-sidebar/98 sticky top-0 z-20 flex h-[72px] items-center border-b px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex w-full items-center gap-3">
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-white/10 bg-white/[0.05] text-white hover:bg-white/10 hover:text-white lg:hidden"
                  />
                }
              >
                <Menu />
                <span className="sr-only">Abrir menú</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-4">
                <SheetTitle className="sr-only">Navegación</SheetTitle>
                <Brand />
                <NavLinks mobile />
              </SheetContent>
            </Sheet>
            <Link href="/" className="lg:hidden" aria-label="Ir al resumen">
              <Brand compact />
            </Link>
            <div className="hidden flex-1 sm:block">
              <GlobalSearch dark />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden h-8 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-2.5 text-[10px] font-semibold text-[#aab5af] md:flex">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#3ba47d] opacity-25" />
                  <span className="relative inline-flex size-2 rounded-full bg-[#258963]" />
                </span>
                Demo activa
              </span>
              <div className="hidden w-44 lg:block">
                <WorkspaceMenu inverted />
              </div>
            </div>
          </div>
        </header>

        <main className="app-canvas mx-auto min-h-[calc(100vh-4.5rem)] max-w-[1500px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-10">
          {children}
        </main>
      </div>

      <nav className="bg-card/95 fixed inset-x-0 bottom-0 z-30 grid h-[70px] grid-cols-5 border-t px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(20,27,23,0.04)] backdrop-blur-lg lg:hidden">
        {navigation.map((item) => {
          const active = isActivePath(pathname, item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-[19px]" strokeWidth={active ? 2.4 : 1.8} />
              <span className="max-w-full truncate">{item.name}</span>
              {active && (
                <span className="bg-primary absolute top-0 h-0.5 w-7 rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
