import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function FormField({
  label,
  htmlFor,
  error,
  children,
  className,
  optional = false,
}: {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
  className?: string
  optional?: boolean
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        {optional && (
          <span className="text-muted-foreground text-[10px]">Opcional</span>
        )}
      </div>
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}
