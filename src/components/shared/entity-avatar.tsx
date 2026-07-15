import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CLIENT_AVATARS } from "@/lib/avatar-images"
import { getClientInitials } from "@/lib/metrics"
import { cn } from "@/lib/utils"

export function EntityAvatar({
  name,
  color,
  size = "md",
  className,
}: {
  name: string
  color: string
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  return (
    <Avatar
      className={cn(
        "shrink-0 rounded-lg shadow-[0_1px_2px_rgba(20,27,23,0.04)] ring-1 ring-black/[0.04]",
        size === "sm" && "size-8",
        size === "md" && "size-9",
        size === "lg" && "size-12",
        className,
      )}
    >
      {CLIENT_AVATARS[name] && (
        <AvatarImage src={CLIENT_AVATARS[name]} alt={name} />
      )}
      <AvatarFallback
        className={cn(
          "rounded-lg font-semibold text-[#26342e]",
          size === "sm" && "text-[11px]",
          size === "md" && "text-xs",
          size === "lg" && "text-sm",
        )}
        style={{ backgroundColor: color }}
      >
        {getClientInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
