import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MatchParticipant } from "@/constants/zod/match-schema";
import { getInitials, getStatusBadgeColor } from "@/components/data-table/constants";
import { cn } from "@/lib/utils";

/** Get display name with fallback for undefined user names */
const getDisplayName = (participant: MatchParticipant): string => {
  return participant.user?.name || participant.user?.username || "Unknown";
};

/** Get safe initials with fallback */
const getSafeInitials = (participant: MatchParticipant): string => {
  const name = getDisplayName(participant);
  return getInitials(name);
};

interface MatchParticipantsDisplayProps {
  participants: MatchParticipant[];
  matchType: "SINGLES" | "DOUBLES";
  maxDisplay?: number;
  showTeams?: boolean;
  showInvitationStatus?: boolean;
}

/** Get invitation status badge label */
const getInvitationStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    DECLINED: "Declined",
    EXPIRED: "Expired",
    CANCELLED: "Cancelled",
  };
  return labels[status] || status;
};

export function MatchParticipantsDisplay({
  participants,
  matchType,
  maxDisplay = 4,
  showTeams = false,
  showInvitationStatus = false,
}: MatchParticipantsDisplayProps) {
  if (!participants || participants.length === 0) {
    return <span className="text-muted-foreground text-xs">No participants</span>;
  }

  const displayParticipants = participants.slice(0, maxDisplay);
  const remainingCount = Math.max(0, participants.length - maxDisplay);

  if (matchType === "SINGLES") {
    return (
      <div className="flex items-center gap-2">
        {displayParticipants.map((participant) => (
          <div key={participant.id} className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage
                src={participant.user?.image || undefined}
                alt={getDisplayName(participant)}
              />
              <AvatarFallback className="text-xs">
                {getSafeInitials(participant)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{getDisplayName(participant)}</span>
            {showInvitationStatus && participant.invitationStatus && (
              <Badge
                variant="outline"
                className={cn("text-[10px] px-1.5 py-0", getStatusBadgeColor("INVITATION", participant.invitationStatus))}
              >
                {getInvitationStatusLabel(participant.invitationStatus)}
              </Badge>
            )}
          </div>
        ))}
        {remainingCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            +{remainingCount} more
          </Badge>
        )}
      </div>
    );
  }

  // Doubles - group by team
  const team1 = participants.filter((p) => p.team === "team1");
  const team2 = participants.filter((p) => p.team === "team2");

  // Helper to render invitation status for a team
  const renderTeamInvitationStatus = (teamParticipants: MatchParticipant[]) => {
    if (!showInvitationStatus) return null;
    const pendingCount = teamParticipants.filter(p => p.invitationStatus === "PENDING").length;
    const declinedCount = teamParticipants.filter(p => p.invitationStatus === "DECLINED").length;
    const expiredCount = teamParticipants.filter(p => p.invitationStatus === "EXPIRED").length;

    if (declinedCount > 0) {
      return (
        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 ml-1", getStatusBadgeColor("INVITATION", "DECLINED"))}>
          Declined
        </Badge>
      );
    }
    if (expiredCount > 0) {
      return (
        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 ml-1", getStatusBadgeColor("INVITATION", "EXPIRED"))}>
          Expired
        </Badge>
      );
    }
    if (pendingCount > 0) {
      return (
        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 ml-1", getStatusBadgeColor("INVITATION", "PENDING"))}>
          Pending
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="flex items-center gap-3">
      {/* Team 1 */}
      <div className="flex items-center gap-1">
        {team1.slice(0, 2).map((participant) => (
          <Avatar
            key={participant.id}
            className="size-6 -ml-1 first:ml-0 ring-2 ring-background"
          >
            <AvatarImage
              src={participant.user?.image || undefined}
              alt={getDisplayName(participant)}
            />
            <AvatarFallback className="text-[10px]">
              {getSafeInitials(participant)}
            </AvatarFallback>
          </Avatar>
        ))}
        {showTeams && (
          <span className="text-xs text-muted-foreground ml-1">(Team 1)</span>
        )}
        {renderTeamInvitationStatus(team1)}
      </div>

      <span className="text-muted-foreground">vs</span>

      {/* Team 2 */}
      <div className="flex items-center gap-1">
        {team2.slice(0, 2).map((participant) => (
          <Avatar
            key={participant.id}
            className="size-6 -ml-1 first:ml-0 ring-2 ring-background"
          >
            <AvatarImage
              src={participant.user?.image || undefined}
              alt={getDisplayName(participant)}
            />
            <AvatarFallback className="text-[10px]">
              {getSafeInitials(participant)}
            </AvatarFallback>
          </Avatar>
        ))}
        {showTeams && (
          <span className="text-xs text-muted-foreground ml-1">(Team 2)</span>
        )}
        {renderTeamInvitationStatus(team2)}
      </div>
    </div>
  );
}
