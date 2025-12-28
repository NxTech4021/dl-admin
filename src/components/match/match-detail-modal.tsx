"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  IconPlus,
  IconClipboardCheck,
  IconShieldCheck,
  IconCheck,
  IconLayoutGrid,
  IconExternalLink,
  IconChevronDown,
  IconTargetArrow,
  IconPhoto,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, getStatusBadgeColor } from "@/components/data-table/constants";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

/** Get display name with fallback for undefined user names */
const getDisplayName = (user: { name?: string | null; username?: string | null } | null | undefined): string => {
  return user?.name || user?.username || "Unknown";
};

/** Format duration in minutes to human-readable string */
const formatDuration = (minutes: number | null | undefined): string | null => {
  if (!minutes || minutes <= 0) return null;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

/** Calculate match duration from start time to result submission */
const calculateMatchDuration = (match: Match): number | null => {
  // Only calculate for completed matches with a result submission time
  if (match.status !== "COMPLETED" || !match.resultSubmittedAt) return null;

  // Use actualStartTime if available, otherwise fall back to matchDate
  const startTime = match.actualStartTime || match.matchDate;
  if (!startTime) return null;

  const start = new Date(startTime);
  const end = new Date(match.resultSubmittedAt);

  // Calculate difference in minutes
  const diffMs = end.getTime() - start.getTime();

  // Return null if negative or unreasonably long (over 12 hours = 720 minutes)
  if (diffMs <= 0 || diffMs > 12 * 60 * 60 * 1000) return null;

  return Math.round(diffMs / (1000 * 60));
};

/** Format cancellation reason enum to readable text */
const formatCancellationReason = (reason: string | null | undefined): string => {
  if (!reason) return "Not specified";
  return reason.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

/** Format dispute category to readable text */
const formatDisputeCategory = (category: string | undefined): string => {
  if (!category) return "Dispute";
  return category.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

/** Format disputer score for display */
const formatDisputerScore = (score: unknown): string => {
  if (!score) return "N/A";
  try {
    const parsed = typeof score === 'string' ? JSON.parse(score) : score;
    if (typeof parsed === 'object' && parsed !== null) {
      if ('team1Score' in parsed && 'team2Score' in parsed) {
        return `${(parsed as {team1Score: number}).team1Score} - ${(parsed as {team2Score: number}).team2Score}`;
      }
      if (Array.isArray(parsed)) {
        return parsed.map((set: Record<string, number>) => {
          const s1 = set.team1Games ?? set.player1 ?? 0;
          const s2 = set.team2Games ?? set.player2 ?? 0;
          return `${s1}-${s2}`;
        }).join(', ');
      }
    }
    return JSON.stringify(parsed);
  } catch {
    return String(score);
  }
};

/** Format date with time for timeline display */
const formatTimelineDate = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return "";

    const now = new Date();
    const isToday = dateObj.toDateString() === now.toDateString();
    const isThisYear = dateObj.getFullYear() === now.getFullYear();

    const timeStr = dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (isToday) {
      return `Today at ${timeStr}`;
    }

    const dateStr = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      ...(isThisYear ? {} : { year: "numeric" }),
    });

    return `${dateStr} at ${timeStr}`;
  } catch {
    return "";
  }
};

/** Timeline Event interface */
interface TimelineEvent {
  id: string;
  timestamp: Date;
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  user?: { name: string; image?: string };
  details?: string;
}

/** Build timeline events from match data */
const buildTimelineEvents = (match: Match): TimelineEvent[] => {
  const events: TimelineEvent[] = [];

  // Match Created
  if (match.createdAt) {
    events.push({
      id: 'created',
      timestamp: new Date(match.createdAt),
      icon: <IconPlus className="size-3.5" />,
      iconColor: 'text-muted-foreground bg-muted',
      title: 'created this match',
      user: match.createdBy ? {
        name: match.createdBy.name || match.createdBy.username || 'Unknown',
        image: (match.createdBy as { image?: string }).image,
      } : undefined,
    });
  }

  // Result Submitted
  if (match.resultSubmittedAt) {
    // Find who submitted - use resultSubmittedBy if available, else find by resultSubmittedById
    const submitter = match.resultSubmittedBy
      || match.participants?.find(p => p.userId === match.resultSubmittedById)?.user;

    events.push({
      id: 'result-submitted',
      timestamp: new Date(match.resultSubmittedAt),
      icon: <IconClipboardCheck className="size-3.5" />,
      iconColor: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
      title: 'submitted the result',
      user: submitter ? {
        name: submitter.name || submitter.username || 'Unknown',
        image: (submitter as { image?: string }).image,
      } : undefined,
      details: match.team1Score !== null && match.team2Score !== null
        ? `Score: ${match.team1Score} - ${match.team2Score}`
        : undefined,
    });
  }

  // Result Confirmed (by opponent or auto-approved)
  if (match.resultConfirmedAt) {
    // Find opponent - must exclude the submitter AND the creator (if same person)
    const submitterId = match.resultSubmittedById || match.createdById;
    const confirmingPlayer = submitterId
      ? match.participants?.find(
          p => p.userId !== submitterId && p.invitationStatus === 'ACCEPTED'
        )
      : null; // If we can't identify submitter, don't guess

    events.push({
      id: 'result-confirmed',
      timestamp: new Date(match.resultConfirmedAt),
      icon: <IconShieldCheck className="size-3.5" />,
      iconColor: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      title: match.isAutoApproved
        ? 'Result auto-confirmed'
        : confirmingPlayer?.user
          ? 'confirmed the result'
          : 'Result confirmed',
      user: !match.isAutoApproved && confirmingPlayer?.user ? {
        name: confirmingPlayer.user.name || confirmingPlayer.user.username || 'Opponent',
        image: confirmingPlayer.user.image || undefined,
      } : undefined,
    });
  }

  // Always show final status as last event
  if (match.status === 'COMPLETED') {
    const completedTime = match.resultConfirmedAt || match.resultSubmittedAt || match.updatedAt;
    events.push({
      id: 'completed',
      timestamp: new Date(completedTime),
      icon: <IconTrophy className="size-3.5" />,
      iconColor: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      title: 'Match completed',
    });
  }

  // Cancelled - find who cancelled
  if (match.status === 'CANCELLED' && match.cancelledAt) {
    const cancelledByPlayer = match.participants?.find(
      p => p.userId === match.cancelledById
    );

    events.push({
      id: 'cancelled',
      timestamp: new Date(match.cancelledAt),
      icon: <IconX className="size-3.5" />,
      iconColor: 'text-red-600 bg-red-100 dark:bg-red-900/30',
      title: cancelledByPlayer?.user ? 'cancelled the match' : 'Match cancelled',
      user: cancelledByPlayer?.user ? {
        name: cancelledByPlayer.user.name || cancelledByPlayer.user.username || 'Unknown',
        image: cancelledByPlayer.user.image || undefined,
      } : undefined,
      details: match.cancellationReason
        ? formatCancellationReason(match.cancellationReason)
        : undefined,
    });
  }

  // Walkover - find who recorded it
  if (match.isWalkover && match.walkover?.recordedAt) {
    const recordedByPlayer = match.participants?.find(
      p => p.userId === match.walkover?.recordedById
    );

    events.push({
      id: 'walkover',
      timestamp: new Date(match.walkover.recordedAt),
      icon: <IconWalk className="size-3.5" />,
      iconColor: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
      title: recordedByPlayer?.user ? 'recorded walkover' : 'Walkover recorded',
      user: recordedByPlayer?.user ? {
        name: recordedByPlayer.user.name || recordedByPlayer.user.username || 'Unknown',
        image: recordedByPlayer.user.image || undefined,
      } : undefined,
      details: match.walkover.reason
        ? formatCancellationReason(match.walkover.reason)
        : undefined,
    });
  }

  // Disputes
  match.disputes?.forEach((dispute, idx) => {
    // Use submittedAt with fallback to createdAt
    const filedAt = dispute.submittedAt || dispute.createdAt;
    // Use raisedByUser with fallback to disputedBy
    const filedByUser = dispute.raisedByUser || dispute.disputedBy;

    if (filedAt) {
      events.push({
        id: `dispute-${idx}`,
        timestamp: new Date(filedAt),
        icon: <IconAlertTriangle className="size-3.5" />,
        iconColor: 'text-red-600 bg-red-100 dark:bg-red-900/30',
        title: filedByUser ? 'filed a dispute' : 'Dispute filed',
        user: filedByUser ? {
          name: filedByUser.name || filedByUser.username || 'Unknown',
        } : undefined,
        details: dispute.disputeCategory
          ? formatDisputeCategory(dispute.disputeCategory)
          : undefined,
      });
    }

    if (dispute.resolvedAt) {
      const statusText = dispute.status?.toLowerCase() || 'resolved';
      events.push({
        id: `dispute-resolved-${idx}`,
        timestamp: new Date(dispute.resolvedAt),
        icon: <IconCheck className="size-3.5" />,
        iconColor: 'text-green-600 bg-green-100 dark:bg-green-900/30',
        title: `Dispute ${statusText}`,
      });
    }
  });

  // Voided (admin action)
  if (match.status === 'VOID') {
    events.push({
      id: 'voided',
      timestamp: new Date(match.updatedAt),
      icon: <IconBan className="size-3.5" />,
      iconColor: 'text-red-600 bg-red-100 dark:bg-red-900/30',
      title: 'Match voided by admin',
      details: match.adminNotes || undefined,
    });
  }

  // Sort by timestamp ascending
  return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
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
            {match.status === "COMPLETED" && <SetScoresDisplay setScores={match.setScores} sport={match.sport} />}
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
            {(() => {
              const calculatedDuration = calculateMatchDuration(match);
              return calculatedDuration ? (
                <InfoCard
                  icon={<IconClock className="size-4" />}
                  label="Duration"
                  value={formatDuration(calculatedDuration) || "—"}
                />
              ) : null;
            })()}
            <InfoCard
              icon={match.matchType === "DOUBLES" ? <IconUsers className="size-4" /> : <IconUser className="size-4" />}
              label="Format"
              value={match.matchType === "DOUBLES" ? "Doubles" : "Singles"}
            />
          </div>

          {/* Match Activity Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Activity
            </h4>
            <div className="rounded-lg border border-border/50 p-4">
              {(() => {
                const events = buildTimelineEvents(match);
                return events.length > 0 ? (
                  <div className="space-y-0">
                    {events.map((event, index) => (
                      <TimelineItem
                        key={event.id}
                        event={event}
                        isLast={index === events.length - 1}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No activity recorded
                  </p>
                );
              })()}
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
              {match.disputes.map((dispute) => {
                const filedByUser = dispute.raisedByUser || dispute.disputedBy;
                const filedByName = filedByUser?.name || filedByUser?.username || "Unknown";
                const filedByUsername = filedByUser?.username;
                const filedByImage = filedByUser?.image;
                const disputeReason = dispute.disputeComment ?? dispute.notes ?? "";
                const filedAt = dispute.submittedAt || dispute.createdAt;

                return (
                  <div
                    key={dispute.id}
                    className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/20 overflow-hidden"
                  >
                    {/* Header: User + Badges */}
                    <div className="flex items-center gap-2.5 px-3 py-2 bg-white/60 dark:bg-white/5 border-b border-orange-100 dark:border-orange-900/30">
                      <Avatar className="size-7 ring-1 ring-orange-200 dark:ring-orange-800">
                        <AvatarImage src={filedByImage || undefined} alt={filedByName} />
                        <AvatarFallback className="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 font-medium text-[10px]">
                          {getInitials(filedByName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-xs truncate text-orange-900 dark:text-orange-100">{filedByName}</span>
                          {filedByUsername && (
                            <span className="text-[10px] text-orange-600 dark:text-orange-400">@{filedByUsername}</span>
                          )}
                        </div>
                        <p className="text-[10px] text-orange-600 dark:text-orange-400">{formatTableDate(filedAt)}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {dispute.priority && ["HIGH", "URGENT"].includes(dispute.priority) && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] px-1.5 py-0 h-4 font-semibold",
                              dispute.priority === "URGENT"
                                ? "border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                                : "border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                            )}
                          >
                            {dispute.priority}
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] px-1.5 py-0 h-4 font-medium",
                            dispute.status === "RESOLVED" && "border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
                            dispute.status === "REJECTED" && "border-slate-300 bg-slate-50 text-slate-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-400",
                            dispute.status === "UNDER_REVIEW" && "border-sky-300 bg-sky-50 text-sky-600 dark:border-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
                            dispute.status === "OPEN" && "border-orange-300 bg-orange-50 text-orange-600 dark:border-orange-600 dark:bg-orange-950/40 dark:text-orange-400"
                          )}
                        >
                          {dispute.status?.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>

                    <div className="px-3 py-2.5 space-y-2">
                      {/* Category */}
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-800 dark:text-orange-200">
                        <IconAlertTriangle className="size-3.5" />
                        {formatDisputeCategory(dispute.disputeCategory)}
                      </div>

                      {/* Description */}
                      {disputeReason && (
                        <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
                          {disputeReason}
                        </p>
                      )}

                      {/* Claimed Score & Evidence Row */}
                      {(dispute.disputerScore != null || dispute.evidenceUrl) && (
                        <div className="flex items-center gap-3 pt-1">
                          {dispute.disputerScore != null && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <IconTargetArrow className="size-3.5 text-orange-500 dark:text-orange-400" />
                              <span className="text-orange-600 dark:text-orange-400">Claimed:</span>
                              <span className="font-mono font-semibold text-orange-900 dark:text-orange-100">
                                {formatDisputerScore(dispute.disputerScore)}
                              </span>
                            </div>
                          )}
                          {dispute.evidenceUrl && (
                            <a
                              href={dispute.evidenceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100 hover:underline"
                            >
                              <IconPhoto className="size-3.5" />
                              Evidence
                              <IconExternalLink className="size-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Walkover Info */}
          {match.isWalkover && match.walkover && (() => {
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
          })()}

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
        {(onMessage || onEdit || onVoid || onEditParticipants || (!isFriendlyMatch && match.division)) && (
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

/** Parse and normalize set scores from various backend formats */
interface NormalizedSetScore {
  setNumber: number;
  team1Score: number;
  team2Score: number;
  team1Tiebreak?: number;
  team2Tiebreak?: number;
  hasTiebreak?: boolean;
}

function parseSetScores(setScores: unknown, _sport?: string | null): NormalizedSetScore[] {
  if (!setScores) return [];

  try {
    // Parse if it's a JSON string
    const parsed = typeof setScores === 'string' ? JSON.parse(setScores) : setScores;

    // Handle array format (most common): [{ setNumber, team1Games, team2Games }, ...]
    if (Array.isArray(parsed)) {
      return parsed.map((set, idx) => ({
        setNumber: set.setNumber ?? idx + 1,
        team1Score: set.team1Games ?? set.player1Games ?? set.player1 ?? set.team1Points ?? set.player1Points ?? 0,
        team2Score: set.team2Games ?? set.player2Games ?? set.player2 ?? set.team2Points ?? set.player2Points ?? 0,
        team1Tiebreak: set.team1Tiebreak ?? set.player1Tiebreak,
        team2Tiebreak: set.team2Tiebreak ?? set.player2Tiebreak,
        hasTiebreak: set.hasTiebreak ?? (set.team1Tiebreak !== undefined || set.player1Tiebreak !== undefined),
      }));
    }

    // Handle object with sets array: { sets: [{ player1, player2 }, ...] }
    if (parsed.sets && Array.isArray(parsed.sets)) {
      return parsed.sets.map((set: any, idx: number) => ({
        setNumber: idx + 1,
        team1Score: set.player1 ?? set.team1 ?? 0,
        team2Score: set.player2 ?? set.team2 ?? 0,
      }));
    }

    // Handle object with games array (pickleball): { games: [{ player1, player2 }, ...] }
    if (parsed.games && Array.isArray(parsed.games)) {
      return parsed.games.map((game: any, idx: number) => ({
        setNumber: idx + 1,
        team1Score: game.player1 ?? game.team1 ?? game.player1Points ?? game.team1Points ?? 0,
        team2Score: game.player2 ?? game.team2 ?? game.player2Points ?? game.team2Points ?? 0,
      }));
    }

    return [];
  } catch {
    return [];
  }
}

/** Set Scores Display Component */
function SetScoresDisplay({ setScores, sport }: { setScores: unknown; sport?: string | null }) {
  const normalizedScores = parseSetScores(setScores, sport);

  if (normalizedScores.length === 0) return null;

  const isPickleball = sport?.toLowerCase() === 'pickleball';
  const setLabel = isPickleball ? 'Game' : 'Set';

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <div className="flex items-center justify-center gap-4">
        {normalizedScores.map((set) => (
          <div key={set.setNumber} className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
              {setLabel} {set.setNumber}
            </div>
            <div className="font-mono text-sm font-semibold">
              {set.team1Score}-{set.team2Score}
              {set.hasTiebreak && set.team1Tiebreak !== undefined && set.team2Tiebreak !== undefined && (
                <span className="text-xs text-muted-foreground ml-0.5">
                  ({set.team1Tiebreak}-{set.team2Tiebreak})
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Timeline Item Component */
function TimelineItem({
  event,
  isLast,
}: {
  event: TimelineEvent;
  isLast: boolean;
}) {
  return (
    <div className="relative flex gap-3">
      {/* Connecting line - positioned absolutely to run behind the icon */}
      {!isLast && (
        <div
          className="absolute left-3 top-6 w-px bg-border -translate-x-1/2"
          style={{ height: "calc(100% - 6px)" }}
        />
      )}

      {/* Icon dot */}
      <div className="relative z-10 flex-shrink-0">
        <div className={cn(
          "size-6 rounded-full flex items-center justify-center",
          event.iconColor
        )}>
          {event.icon}
        </div>
      </div>

      {/* Content */}
      <div className={cn("flex-1 min-w-0", !isLast && "pb-4")}>
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm min-w-0">
            {event.user ? (
              <>
                <span className="font-medium">{event.user.name}</span>
                <span className="text-muted-foreground"> {event.title}</span>
              </>
            ) : (
              <span className="font-medium">{event.title}</span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground flex-shrink-0 whitespace-nowrap">
            {formatTimelineDate(event.timestamp)}
          </span>
        </div>
        {event.details && (
          <p className="text-xs text-muted-foreground mt-0.5">{event.details}</p>
        )}
      </div>
    </div>
  );
}
