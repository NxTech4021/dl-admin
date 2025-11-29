import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getStatusBadgeColor,
  getMatchStatusLabel,
} from "@/components/data-table/constants";
import { MatchStatus } from "@/constants/zod/match-schema";

interface MatchStatusBadgeProps {
  status: MatchStatus;
  className?: string;
}

export function MatchStatusBadge({
  status,
  className,
}: MatchStatusBadgeProps) {
  const colorClass = getStatusBadgeColor("MATCH", status);
  const label = getMatchStatusLabel(status);

  return (
    <Badge variant="outline" className={cn(colorClass, className)}>
      {label}
    </Badge>
  );
}
