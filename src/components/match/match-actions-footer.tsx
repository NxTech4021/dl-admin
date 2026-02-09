import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  IconTrophy,
  IconCalendar,
  IconExternalLink,
  IconChevronDown,
  IconMessage,
  IconUsers,
  IconEdit,
  IconBan,
  IconLayoutGrid,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import type { Match } from "@/constants/zod/match-schema";

interface MatchActionsFooterProps {
  match: Match;
  isFriendlyMatch: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (match: Match) => void;
  onVoid?: (match: Match) => void;
  onMessage?: (match: Match) => void;
  onEditParticipants?: (match: Match) => void;
}

/** Quick Actions Footer */
export function MatchActionsFooter({
  match,
  isFriendlyMatch,
  onOpenChange,
  onEdit,
  onVoid,
  onMessage,
  onEditParticipants,
}: MatchActionsFooterProps) {
  const hasActions = onMessage || onEdit || onVoid || onEditParticipants || (!isFriendlyMatch && match.division);

  if (!hasActions) {
    return null;
  }

  return (
    <div className="px-6 pb-6 pt-3 border-t border-border/50">
      <div className="flex items-center justify-end gap-2 flex-wrap">
        {/* Go to Dropdown - only for league-linked matches */}
        {!isFriendlyMatch && match.division && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconExternalLink className="size-4 mr-1.5" />
                Go to
                <IconChevronDown className="size-3.5 ml-1.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {match.division.league && (
                <DropdownMenuItem asChild onClick={() => onOpenChange(false)}>
                  <Link to="/league/view/$leagueId" params={{ leagueId: match.division.league.id }}>
                    <IconTrophy className="size-4 mr-2" />
                    League
                  </Link>
                </DropdownMenuItem>
              )}
              {match.division.season && (
                <DropdownMenuItem asChild onClick={() => onOpenChange(false)}>
                  <Link to="/seasons/$seasonId" params={{ seasonId: match.division.season.id }}>
                    <IconCalendar className="size-4 mr-2" />
                    Season
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild onClick={() => onOpenChange(false)}>
                <Link to="/divisions/$divisionId" params={{ divisionId: match.division.id }}>
                  <IconLayoutGrid className="size-4 mr-2" />
                  Division
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Message Participants - always available */}
        {onMessage && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => { onMessage(match); onOpenChange(false); }}
          >
            <IconMessage className="size-4 mr-1.5" />
            Message
          </Button>
        )}

        {/* Edit Participants - when not completed/voided/cancelled/ongoing */}
        {onEditParticipants && !["COMPLETED", "VOID", "CANCELLED", "ONGOING"].includes(match.status) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => { onEditParticipants(match); onOpenChange(false); }}
          >
            <IconUsers className="size-4 mr-1.5" />
            Edit Participants
          </Button>
        )}

        {/* Edit Result - when completed or ongoing */}
        {onEdit && ["COMPLETED", "ONGOING"].includes(match.status) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => { onEdit(match); onOpenChange(false); }}
          >
            <IconEdit className="size-4 mr-1.5" />
            Edit Result
          </Button>
        )}

        {/* Void Match - destructive, when not already voided/cancelled */}
        {onVoid && !["VOID", "CANCELLED"].includes(match.status) && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => { onVoid(match); onOpenChange(false); }}
          >
            <IconBan className="size-4 mr-1.5" />
            Void Match
          </Button>
        )}
      </div>
    </div>
  );
}
