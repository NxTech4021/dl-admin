import { Badge } from "@/components/ui/badge";
import { IconAlertTriangle, IconX } from "@tabler/icons-react";
import { formatTableDate } from "@/components/data-table/constants";
import { cn } from "@/lib/utils";
import { formatCancellationReason } from "@/lib/utils/format";
import type { Match } from "@/constants/zod/match-schema";

/** Cancellation Details Section */
export function MatchCancellationSection({ match }: { match: Match }) {
  if (match.status !== "CANCELLED") {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <IconX className="size-3.5" />
        Cancellation Details
      </h4>
      <div className={cn(
        "p-3 rounded-lg border",
        match.isLateCancellation
          ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
          : "bg-muted/50 border-border/50"
      )}>
        {match.isLateCancellation && (
          <Badge variant="destructive" className="mb-2 text-xs gap-1">
            <IconAlertTriangle className="size-3" />
            Late Cancellation
          </Badge>
        )}

        <div className="space-y-2 text-sm">
          {/* Reason Badge */}
          {(match as { cancellationReason?: string }).cancellationReason && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Reason:</span>
              <Badge variant="outline">
                {formatCancellationReason((match as { cancellationReason?: string }).cancellationReason)}
              </Badge>
            </div>
          )}

          {/* Comment if exists */}
          {(match as { cancellationComment?: string }).cancellationComment && (
            <p className="text-muted-foreground italic">
              &ldquo;{(match as { cancellationComment?: string }).cancellationComment}&rdquo;
            </p>
          )}

          {/* When cancelled */}
          {(match as { cancelledAt?: Date }).cancelledAt && (
            <p className="text-xs text-muted-foreground">
              Cancelled {formatTableDate((match as { cancelledAt?: Date }).cancelledAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
