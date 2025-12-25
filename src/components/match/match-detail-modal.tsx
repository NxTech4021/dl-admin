"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Match } from "@/constants/zod/match-schema";
import { MatchStatusBadge } from "./match-status-badge";
import { formatTableDate } from "@/components/data-table/constants";
import {
  IconCalendar,
  IconMapPin,
  IconTrophy,
  IconAlertTriangle,
  IconWalk,
  IconClock,
  IconChevronRight,
  IconUser,
  IconUsers,
  IconHash,
  IconNotes,
  IconHeartHandshake,
  IconCrown,
  IconX,
  IconMessage,
  IconEdit,
  IconBan,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, getStatusBadgeColor } from "@/components/data-table/constants";
import { cn } from "@/lib/utils";

/** Get display name with fallback for undefined user names */
const getDisplayName = (user: { name?: string | null; username?: string | null } | null | undefined): string => {
  return user?.name || user?.username || "Unknown";
};

/** Format duration in minutes to human-readable string */
const formatDuration = (minutes: number | null | undefined): string | null => {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

/** Format cancellation reason enum to readable text */
const formatCancellationReason = (reason: string | null | undefined): string => {
  if (!reason) return "Not specified";
  return reason.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

/** Get sport-specific styling */
const getSportStyles = (sport: string | null | undefined) => {
  switch (sport?.toLowerCase()) {
    case "tennis":
      return {
        badge: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
        accent: "bg-emerald-500",
        bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20",
      };
    case "badminton":
      return {
        badge: "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
        accent: "bg-rose-500",
        bg: "bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/20",
      };
    case "pickleball":
      return {
        badge: "text-violet-700 bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800",
        accent: "bg-violet-500",
        bg: "bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/20",
      };
    case "padel":
      return {
        badge: "text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800",
        accent: "bg-sky-500",
        bg: "bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/30 dark:to-sky-900/20",
      };
    default:
      return {
        badge: "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700",
        accent: "bg-slate-500",
        bg: "bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/30 dark:to-slate-800/20",
      };
  }
};

interface MatchDetailModalProps {
  match: Match | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Action callbacks (optional)
  onEdit?: (match: Match) => void;
  onVoid?: (match: Match) => void;
  onMessage?: (match: Match) => void;
  onEditParticipants?: (match: Match) => void;
}

export function MatchDetailModal({
  match,
  open,
  onOpenChange,
  onEdit,
  onVoid,
  onMessage,
  onEditParticipants,
}: MatchDetailModalProps) {
  if (!match) return null;

  const sportStyles = getSportStyles(match.sport);
  const isFriendlyMatch = !match.divisionId && !match.leagueId && !match.seasonId;
  const participants = match.participants || [];
  const isDraft = match.status === "DRAFT";

  // Determine winner for highlighting
  const winningSide = match.status === "COMPLETED" && typeof match.team1Score === "number" && typeof match.team2Score === "number"
    ? match.team1Score > match.team2Score ? "team1" : match.team2Score > match.team1Score ? "team2" : null
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 space-y-3">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div className="space-y-1.5 min-w-0">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                {match.matchType === "DOUBLES" ? "Doubles" : "Singles"} Match
              </DialogTitle>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <IconHash className="size-3" />
                <code className="font-mono text-[11px] select-all">{match.id}</code>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <MatchStatusBadge status={match.status} />
              {match.isDisputed && (
                <Badge variant="destructive" className="gap-1 text-xs px-2">
                  <IconAlertTriangle className="size-3" />
                  Disputed
                </Badge>
              )}
              {match.isWalkover && (
                <Badge variant="outline" className="gap-1 text-xs px-2">
                  <IconWalk className="size-3" />
                  W/O
                </Badge>
              )}
            </div>
          </div>

          {/* Context Banner - Friendly or League */}
          {isFriendlyMatch ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800">
              <IconHeartHandshake className="size-4 text-pink-500" />
              <span className="text-sm font-medium text-pink-700 dark:text-pink-300">Friendly Match</span>
              <span className="text-xs text-pink-600/70 dark:text-pink-400/70">• Not linked to any league</span>
            </div>
          ) : match.division ? (
            <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border", sportStyles.bg, "border-transparent")}>
              <Badge variant="outline" className={cn("text-xs font-medium", sportStyles.badge)}>
                {match.sport}
              </Badge>
              {match.division.league && (
                <>
                  <IconChevronRight className="size-3 text-muted-foreground/50" />
                  <span className="text-sm font-medium">{match.division.league.name}</span>
                </>
              )}
              {match.division.season && (
                <>
                  <IconChevronRight className="size-3 text-muted-foreground/50" />
                  <span className="text-xs text-muted-foreground">{match.division.season.name}</span>
                </>
              )}
              {match.division.name && (
                <>
                  <IconChevronRight className="size-3 text-muted-foreground/50" />
                  <span className="text-xs text-muted-foreground">{match.division.name}</span>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
              <Badge variant="outline" className={cn("text-xs", sportStyles.badge)}>
                {match.sport}
              </Badge>
            </div>
          )}
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {/* VS Display - The Hero Section */}
          <div className={cn("rounded-xl p-4", sportStyles.bg, "border border-border/50")}>
            {match.matchType === "SINGLES" ? (
              <SinglesDisplay
                participants={participants}
                isDraft={isDraft}
                score={match.status === "COMPLETED" && typeof match.team1Score === "number" && typeof match.team2Score === "number"
                  ? { team1: match.team1Score, team2: match.team2Score }
                  : null
                }
                winningSide={winningSide}
              />
            ) : (
              <DoublesDisplay
                participants={participants}
                isDraft={isDraft}
                score={match.status === "COMPLETED" && typeof match.team1Score === "number" && typeof match.team2Score === "number"
                  ? { team1: match.team1Score, team2: match.team2Score }
                  : null
                }
                winningSide={winningSide}
              />
            )}

            {/* Set Scores if available */}
            {match.status === "COMPLETED" && (() => {
              const scores = match.setScores as Array<{
                setNumber?: number;
                team1Games?: number;
                team2Games?: number;
              }> | null | undefined;
              if (scores && Array.isArray(scores) && scores.length > 0) {
                return (
                  <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-center gap-3">
                    {scores.map((set, idx) => (
                      <div key={idx} className="text-center">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                          Set {set.setNumber || idx + 1}
                        </div>
                        <div className="font-mono text-sm font-semibold">
                          {set.team1Games}-{set.team2Games}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* DRAFT status explanation */}
          {match.status === "DRAFT" && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Awaiting Responses</strong>
                {match.participants?.some(p => p.invitationStatus === "DECLINED") && (
                  <span className="block mt-1 text-red-600 dark:text-red-400">
                    • Some invitations declined - creator needs to invite new players
                  </span>
                )}
                {match.participants?.some(p => p.invitationStatus === "EXPIRED") && (
                  <span className="block mt-1 text-muted-foreground">
                    • Some invitations expired - needs resending
                  </span>
                )}
                {match.participants?.every(p => p.invitationStatus === "PENDING" || p.invitationStatus === "ACCEPTED") &&
                 match.participants?.some(p => p.invitationStatus === "PENDING") && (
                  <span className="block mt-1 text-muted-foreground">
                    • Waiting for all players to accept
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <InfoCard
              icon={<IconCalendar className="size-4" />}
              label="Date"
              value={new Date(match.matchDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            />
            <InfoCard
              icon={<IconMapPin className="size-4" />}
              label="Venue"
              value={match.venue || match.location || "TBD"}
            />
            {match.duration && (
              <InfoCard
                icon={<IconClock className="size-4" />}
                label="Duration"
                value={formatDuration(match.duration) || "—"}
              />
            )}
            <InfoCard
              icon={match.matchType === "DOUBLES" ? <IconUsers className="size-4" /> : <IconUser className="size-4" />}
              label="Format"
              value={match.matchType === "DOUBLES" ? "Doubles" : "Singles"}
            />
          </div>

          {/* Match Activity */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Activity</h4>
            <div className="rounded-lg border border-border/50 divide-y divide-border/50">
              {match.createdBy && (
                <ActivityItem
                  user={{
                    name: match.createdBy.name || match.createdBy.username || "Unknown",
                    image: (match.createdBy as { image?: string }).image,
                  }}
                  action="created this match"
                  date={formatTableDate(match.createdAt)}
                />
              )}
              {match.status === "COMPLETED" && match.resultSubmittedBy && (
                <ActivityItem
                  user={{
                    name: match.resultSubmittedBy.name || match.resultSubmittedBy.username || "Unknown",
                    image: (match.resultSubmittedBy as { image?: string }).image,
                  }}
                  action="submitted result"
                  date={match.resultSubmittedAt ? formatTableDate(match.resultSubmittedAt) : undefined}
                />
              )}
              {match.updatedAt && match.updatedAt !== match.createdAt && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2.5 bg-muted/30">
                  <IconClock className="size-3" />
                  <span>Last updated {formatTableDate(match.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          {(match.adminNotes || match.notes) && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <IconNotes className="size-3.5" />
                Notes
              </h4>
              <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                {match.adminNotes || match.notes}
              </p>
            </div>
          )}

          {/* Dispute Info */}
          {match.isDisputed && match.disputes && match.disputes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium uppercase tracking-wider text-destructive flex items-center gap-1.5">
                <IconAlertTriangle className="size-3.5" />
                Disputes
              </h4>
              {match.disputes.map((dispute) => (
                <div
                  key={dispute.id}
                  className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg text-sm"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-medium">{dispute.disputeCategory}</span>
                    <Badge variant="outline" className="text-[10px]">{dispute.status}</Badge>
                  </div>
                  {dispute.notes && (
                    <p className="mt-1.5 text-muted-foreground text-xs">{dispute.notes}</p>
                  )}
                  <p className="mt-1.5 text-[10px] text-muted-foreground">
                    Filed by {dispute.disputedBy?.name ?? "Unknown"} • {formatTableDate(dispute.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Walkover Info */}
          {match.isWalkover && match.walkover && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <IconWalk className="size-3.5" />
                Walkover
              </h4>
              <div className="p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  {match.walkover.reason}
                </p>
                <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                  Recorded {formatTableDate(match.walkover.recordedAt)}
                </p>
              </div>
            </div>
          )}

          {/* Cancellation Details */}
          {match.status === "CANCELLED" && (
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
          )}
        </div>

        {/* Quick Actions Footer */}
        {(onMessage || onEdit || onVoid || onEditParticipants) && (
          <div className="px-6 pb-6 pt-3 border-t border-border/50">
            <div className="flex items-center justify-end gap-2 flex-wrap">
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
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Singles VS Display */
function SinglesDisplay({
  participants,
  isDraft,
  score,
  winningSide
}: {
  participants: Match["participants"];
  isDraft: boolean;
  score: { team1: number; team2: number } | null;
  winningSide: "team1" | "team2" | null;
}) {
  const player1 = participants?.[0];
  const player2 = participants?.[1];

  return (
    <div className="flex items-center gap-3">
      {/* Player 1 */}
      <div className="flex-1 flex items-center gap-3">
        <div className="relative">
          {winningSide === "team1" && (
            <IconCrown className="absolute -top-3 left-1/2 -translate-x-1/2 size-5 text-amber-500 fill-amber-400 drop-shadow-sm" />
          )}
          <Avatar className={cn(
            "size-14 ring-2 ring-background shadow-sm",
            winningSide === "team1" && "ring-amber-400 ring-4"
          )}>
            <AvatarImage src={player1?.user?.image || undefined} />
            <AvatarFallback className="text-base font-medium bg-muted">
              {getInitials(getDisplayName(player1?.user))}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("font-semibold truncate", winningSide === "team1" && "text-amber-600 dark:text-amber-400")}>
            {getDisplayName(player1?.user)}
          </p>
          {isDraft && player1?.invitationStatus && (
            <Badge
              variant="outline"
              className={cn("text-[10px] mt-0.5", getStatusBadgeColor("INVITATION", player1.invitationStatus))}
            >
              {player1.invitationStatus}
            </Badge>
          )}
        </div>
      </div>

      {/* VS / Score */}
      <div className="flex-shrink-0 text-center px-2">
        {score ? (
          <div className="space-y-0.5">
            <div className="font-mono text-2xl font-bold tracking-tight">
              <span className={winningSide === "team1" ? "text-amber-600 dark:text-amber-400" : ""}>{score.team1}</span>
              <span className="text-muted-foreground mx-1">-</span>
              <span className={winningSide === "team2" ? "text-amber-600 dark:text-amber-400" : ""}>{score.team2}</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Final</div>
          </div>
        ) : (
          <div className="text-xl font-bold text-muted-foreground/50">VS</div>
        )}
      </div>

      {/* Player 2 */}
      <div className="flex-1 flex items-center gap-3 justify-end text-right">
        <div className="min-w-0 flex-1">
          <p className={cn("font-semibold truncate", winningSide === "team2" && "text-amber-600 dark:text-amber-400")}>
            {player2 ? getDisplayName(player2?.user) : "TBD"}
          </p>
          {isDraft && player2?.invitationStatus && (
            <Badge
              variant="outline"
              className={cn("text-[10px] mt-0.5", getStatusBadgeColor("INVITATION", player2.invitationStatus))}
            >
              {player2.invitationStatus}
            </Badge>
          )}
        </div>
        <div className="relative">
          {winningSide === "team2" && (
            <IconCrown className="absolute -top-3 left-1/2 -translate-x-1/2 size-5 text-amber-500 fill-amber-400 drop-shadow-sm" />
          )}
          <Avatar className={cn(
            "size-14 ring-2 ring-background shadow-sm",
            winningSide === "team2" && "ring-amber-400 ring-4"
          )}>
            <AvatarImage src={player2?.user?.image || undefined} />
            <AvatarFallback className="text-base font-medium bg-muted">
              {player2 ? getInitials(getDisplayName(player2?.user)) : "?"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}

/** Doubles VS Display */
function DoublesDisplay({
  participants,
  isDraft,
  score,
  winningSide
}: {
  participants: Match["participants"];
  isDraft: boolean;
  score: { team1: number; team2: number } | null;
  winningSide: "team1" | "team2" | null;
}) {
  const team1 = participants?.filter(p => p.team === "team1") || [];
  const team2 = participants?.filter(p => p.team === "team2") || [];

  const getTeamStatus = (team: typeof team1) => {
    if (!isDraft) return null;
    const declined = team.some(p => p.invitationStatus === "DECLINED");
    const expired = team.some(p => p.invitationStatus === "EXPIRED");
    const pending = team.some(p => p.invitationStatus === "PENDING");

    if (declined) return { status: "DECLINED", color: getStatusBadgeColor("INVITATION", "DECLINED") };
    if (expired) return { status: "EXPIRED", color: getStatusBadgeColor("INVITATION", "EXPIRED") };
    if (pending) return { status: "PENDING", color: getStatusBadgeColor("INVITATION", "PENDING") };
    return null;
  };

  const team1Status = getTeamStatus(team1);
  const team2Status = getTeamStatus(team2);

  return (
    <div className="flex items-center gap-3">
      {/* Team 1 */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="relative">
            {winningSide === "team1" && (
              <IconCrown className="absolute -top-3 left-1/2 -translate-x-1/2 size-5 text-amber-500 fill-amber-400 drop-shadow-sm z-10" />
            )}
            <div className={cn(
              "flex -space-x-2 rounded-full",
              winningSide === "team1" && "ring-4 ring-amber-400"
            )}>
              {team1.slice(0, 2).map((player) => (
                <Avatar key={player.id} className="size-10 ring-2 ring-background shadow-sm">
                  <AvatarImage src={player.user?.image || undefined} />
                  <AvatarFallback className="text-xs font-medium bg-muted">
                    {getInitials(getDisplayName(player.user))}
                  </AvatarFallback>
                </Avatar>
              ))}
              {team1.length === 0 && (
                <Avatar className="size-10 ring-2 ring-background">
                  <AvatarFallback className="text-xs">?</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn(
              "font-semibold text-sm truncate",
              winningSide === "team1" && "text-amber-600 dark:text-amber-400"
            )}>
              {team1.length > 0
                ? team1.map(p => getDisplayName(p.user).split(' ')[0]).join(' & ')
                : "TBD"
              }
            </p>
            {team1Status && (
              <Badge variant="outline" className={cn("text-[10px] mt-0.5", team1Status.color)}>
                {team1Status.status}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* VS / Score */}
      <div className="flex-shrink-0 text-center px-2">
        {score ? (
          <div className="space-y-0.5">
            <div className="font-mono text-2xl font-bold tracking-tight">
              <span className={winningSide === "team1" ? "text-amber-600 dark:text-amber-400" : ""}>{score.team1}</span>
              <span className="text-muted-foreground mx-1">-</span>
              <span className={winningSide === "team2" ? "text-amber-600 dark:text-amber-400" : ""}>{score.team2}</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Final</div>
          </div>
        ) : (
          <div className="text-xl font-bold text-muted-foreground/50">VS</div>
        )}
      </div>

      {/* Team 2 */}
      <div className="flex-1">
        <div className="flex items-center gap-2 justify-end text-right">
          <div className="min-w-0 flex-1">
            <p className={cn(
              "font-semibold text-sm truncate",
              winningSide === "team2" && "text-amber-600 dark:text-amber-400"
            )}>
              {team2.length > 0
                ? team2.map(p => getDisplayName(p.user).split(' ')[0]).join(' & ')
                : "TBD"
              }
            </p>
            {team2Status && (
              <Badge variant="outline" className={cn("text-[10px] mt-0.5", team2Status.color)}>
                {team2Status.status}
              </Badge>
            )}
          </div>
          <div className="relative">
            {winningSide === "team2" && (
              <IconCrown className="absolute -top-3 left-1/2 -translate-x-1/2 size-5 text-amber-500 fill-amber-400 drop-shadow-sm z-10" />
            )}
            <div className={cn(
              "flex -space-x-2 rounded-full",
              winningSide === "team2" && "ring-4 ring-amber-400"
            )}>
              {team2.slice(0, 2).map((player) => (
                <Avatar key={player.id} className="size-10 ring-2 ring-background shadow-sm">
                  <AvatarImage src={player.user?.image || undefined} />
                  <AvatarFallback className="text-xs font-medium bg-muted">
                    {getInitials(getDisplayName(player.user))}
                  </AvatarFallback>
                </Avatar>
              ))}
              {team2.length === 0 && (
                <Avatar className="size-10 ring-2 ring-background">
                  <AvatarFallback className="text-xs">?</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Info Card Component */
function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-medium truncate">{value}</p>
    </div>
  );
}

/** Activity Item Component */
function ActivityItem({
  user,
  action,
  date
}: {
  user: { name: string; image?: string };
  action: string;
  date?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <Avatar className="size-7 flex-shrink-0">
        <AvatarImage src={user.image || undefined} />
        <AvatarFallback className="text-[10px] bg-muted">{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <span className="text-sm">
          <span className="font-medium">{user.name}</span>
          <span className="text-muted-foreground"> {action}</span>
        </span>
      </div>
      {date && (
        <span className="text-[11px] text-muted-foreground flex-shrink-0">{date}</span>
      )}
    </div>
  );
}
