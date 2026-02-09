import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitials, getAvatarColor } from "./utils";

export interface PartnershipAvatarsProps {
  captain: { name: string | null; image?: string | null } | null;
  partner: { name: string | null; image?: string | null } | null;
  size?: "sm" | "md";
}

export function PartnershipAvatars({
  captain,
  partner,
  size = "sm",
}: PartnershipAvatarsProps) {
  const sizeClass = size === "sm" ? "size-7" : "size-9";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <div className="flex items-center">
      <Avatar className={cn(sizeClass, "ring-2 ring-background z-10")}>
        {captain?.image && <AvatarImage src={captain.image} alt={captain?.name || "Captain"} />}
        <AvatarFallback className={cn("text-white font-semibold", textSize, getAvatarColor(captain?.name))}>
          {getInitials(captain?.name)}
        </AvatarFallback>
      </Avatar>
      <Avatar className={cn(sizeClass, "ring-2 ring-background -ml-2")}>
        {partner?.image && <AvatarImage src={partner.image} alt={partner?.name || "Partner"} />}
        <AvatarFallback className={cn("text-white font-semibold", textSize, partner ? getAvatarColor(partner?.name) : "bg-slate-300")}>
          {partner ? getInitials(partner?.name) : "?"}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
