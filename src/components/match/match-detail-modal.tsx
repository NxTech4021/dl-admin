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
import {
  IconCalendar,
  IconMapPin,
  IconAlertTriangle,
  IconWalk,
  IconClock,
  IconChevronRight,
  IconUser,
  IconUsers,
  IconHash,
  IconNotes,
  IconHeartHandshake,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  getDisplayName,
  formatDuration,
  calculateMatchDuration,
} from "@/lib/utils/format";
import {
  SinglesDisplay,
  DoublesDisplay,
  SetScoresDisplay,
  InfoCard,
  getSportStyles,
} from "./match-score-display";
import { MatchTimelineSection } from "./match-timeline-tab";
import { MatchDisputesSection } from "./match-disputes-tab";
import { MatchWalkoverSection } from "./match-walkover-section";
import { MatchCancellationSection } from "./match-cancellation-section";
import { MatchActionsFooter } from "./match-actions-footer";

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
          <MatchTimelineSection match={match} />

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
          <MatchDisputesSection match={match} />

          {/* Walkover Info */}
          <MatchWalkoverSection match={match} />

          {/* Cancellation Details */}
          <MatchCancellationSection match={match} />
        </div>

        {/* Quick Actions Footer */}
        <MatchActionsFooter
          match={match}
          isFriendlyMatch={isFriendlyMatch}
          onOpenChange={onOpenChange}
          onEdit={onEdit}
          onVoid={onVoid}
          onMessage={onMessage}
          onEditParticipants={onEditParticipants}
        />
      </DialogContent>
    </Dialog>
  );
}
