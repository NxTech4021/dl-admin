"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Match } from "@/constants/zod/match-schema";
import { MatchStatusBadge } from "./match-status-badge";
import { MatchParticipantsDisplay } from "./match-participants-display";
import { formatTableDate } from "@/components/data-table/constants";
import { Separator } from "@/components/ui/separator";
import {
  IconCalendar,
  IconMapPin,
  IconTrophy,
  IconUsers,
  IconAlertTriangle,
  IconWalk,
} from "@tabler/icons-react";

interface MatchDetailModalProps {
  match: Match | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MatchDetailModal({
  match,
  open,
  onOpenChange,
}: MatchDetailModalProps) {
  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconTrophy className="size-5" />
            Match Details
          </DialogTitle>
          <DialogDescription>
            Match ID: <span className="font-mono">{match.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Section */}
          <div className="flex flex-wrap items-center gap-2">
            <MatchStatusBadge status={match.status} />
            {match.isDisputed && (
              <Badge variant="destructive" className="gap-1">
                <IconAlertTriangle className="size-3" />
                Disputed
              </Badge>
            )}
            {match.isWalkover && (
              <Badge variant="outline" className="gap-1">
                <IconWalk className="size-3" />
                Walkover
              </Badge>
            )}
            <Badge variant="secondary">{match.matchType}</Badge>
            <Badge variant="outline">{match.sport}</Badge>
          </div>

          <Separator />

          {/* Participants */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <IconUsers className="size-4" />
              Participants
            </h4>
            <div className="p-3 bg-muted/50 rounded-lg">
              <MatchParticipantsDisplay
                participants={match.participants}
                matchType={match.matchType}
                showTeams
                maxDisplay={10}
              />
            </div>
          </div>

          {/* Score (if completed) */}
          {match.status === "COMPLETED" &&
            match.team1Score !== null &&
            match.team2Score !== null && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <IconTrophy className="size-4" />
                  Final Score
                </h4>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <span className="text-3xl font-bold font-mono">
                    {match.team1Score} - {match.team2Score}
                  </span>
                  {match.setScores && match.setScores.length > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {match.setScores.map((set, idx) => (
                        <span key={idx} className="mr-2">
                          Set {set.setNumber}: {set.team1Games}-{set.team2Games}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Date & Location */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <IconCalendar className="size-4" />
                Match Date
              </h4>
              <p className="text-sm text-muted-foreground">
                {formatTableDate(match.matchDate)}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <IconMapPin className="size-4" />
                Venue
              </h4>
              <p className="text-sm text-muted-foreground">
                {match.venue || match.location || "TBD"}
              </p>
            </div>
          </div>

          {/* Division Info */}
          {match.division && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Division Information</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Division:</span>
                    <span className="font-medium">{match.division.name}</span>
                  </div>
                  {match.division.season && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Season:</span>
                      <span className="font-medium">
                        {match.division.season.name}
                      </span>
                    </div>
                  )}
                  {match.division.league && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">League:</span>
                      <span className="font-medium">
                        {match.division.league.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Admin Notes */}
          {(match.adminNotes || match.notes) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Notes</h4>
                <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                  {match.adminNotes || match.notes}
                </p>
              </div>
            </>
          )}

          {/* Dispute Info */}
          {match.isDisputed && match.disputes && match.disputes.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-destructive flex items-center gap-2">
                  <IconAlertTriangle className="size-4" />
                  Dispute Information
                </h4>
                {match.disputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    className="p-3 bg-destructive/10 rounded-lg text-sm"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {dispute.disputeCategory}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {dispute.status}
                      </Badge>
                    </div>
                    {dispute.notes && (
                      <p className="mt-2 text-muted-foreground">
                        {dispute.notes}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Filed by {dispute.disputedBy.name} on{" "}
                      {formatTableDate(dispute.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Walkover Info */}
          {match.isWalkover && match.walkover && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <IconWalk className="size-4" />
                  Walkover Information
                </h4>
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reason:</span>
                    <span className="font-medium">{match.walkover.reason}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-muted-foreground">Recorded:</span>
                    <span>{formatTableDate(match.walkover.recordedAt)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
