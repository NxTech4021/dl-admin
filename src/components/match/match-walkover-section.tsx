import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconWalk } from "@tabler/icons-react";
import { getInitials, formatTableDate } from "@/components/data-table/constants";
import {
  getDisplayName,
  formatCancellationReason,
} from "@/lib/utils/format";
import type { Match } from "@/constants/zod/match-schema";

/** Walkover Info Section */
export function MatchWalkoverSection({ match }: { match: Match }) {
  if (!match.isWalkover || !match.walkover) {
    return null;
  }

  // Get player names from walkover relation or fall back to participants
  const defaultingPlayer = match.walkover.defaultingPlayer
    || match.participants?.find(p => p.userId === match.walkover?.defaultingPlayerId)?.user;
  const winningPlayer = match.walkover.winningPlayer
    || match.participants?.find(p => p.userId === match.walkover?.winningPlayerId)?.user;

  return (
    <div className="-mx-6 -mb-6 mt-4 pt-4 px-6 pb-4 bg-muted border-t border-border">
      <div className="space-y-2">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <IconWalk className="size-3.5" />
          Walkover
        </h4>
        <div className="rounded-lg border border-border bg-background divide-y divide-border/50">
          {/* Reason row */}
          <div className="px-3 py-2.5 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Reason</span>
            <Badge variant="outline" className="font-medium">
              {formatCancellationReason(match.walkover.walkoverReason || match.walkover.reason)}
            </Badge>
          </div>

          {/* Players row */}
          <div className="px-3 py-2.5 flex items-center justify-between gap-4">
            {/* Forfeited */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Avatar className="size-6 border border-border">
                <AvatarImage src={defaultingPlayer?.image || undefined} />
                <AvatarFallback className="text-[10px] bg-muted">
                  {getInitials(defaultingPlayer?.name || "?")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-[10px] text-red-500 font-medium">Forfeited</p>
                <p className="text-sm font-medium truncate">
                  {getDisplayName(defaultingPlayer)}
                </p>
              </div>
            </div>

            <span className="text-[10px] text-muted-foreground font-medium shrink-0">VS</span>

            {/* Awarded win */}
            <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
              <div className="min-w-0 text-right">
                <p className="text-[10px] text-green-600 font-medium">Awarded Win</p>
                <p className="text-sm font-medium truncate">
                  {getDisplayName(winningPlayer)}
                </p>
              </div>
              <Avatar className="size-6 border border-border">
                <AvatarImage src={winningPlayer?.image || undefined} />
                <AvatarFallback className="text-[10px] bg-muted">
                  {getInitials(winningPlayer?.name || "?")}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Details row (if exists) */}
          {(match.walkover.walkoverReasonDetail || match.walkover.reasonDetail) && (
            <div className="px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Details</p>
              <p className="text-sm text-muted-foreground italic">
                &ldquo;{match.walkover.walkoverReasonDetail || match.walkover.reasonDetail}&rdquo;
              </p>
            </div>
          )}

          {/* Footer row */}
          <div className="px-3 py-2 flex items-center justify-between text-[11px] text-muted-foreground bg-muted/30">
            <span>Recorded {formatTableDate(match.walkover.createdAt || match.walkover.recordedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
