"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconBan,
  IconWalk,
  IconMessage,
  IconUsers,
  IconClock,
  IconEyeOff,
  IconEyeCheck,
  IconFlag,
  IconFlagOff,
  IconCopy,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Match } from "@/constants/zod/match-schema";

interface MatchRowActionsProps {
  match: Match;
  onView: (match: Match) => void;
  onEdit: (match: Match) => void;
  onEditParticipants: (match: Match) => void;
  onVoid: (match: Match) => void;
  onConvertToWalkover: (match: Match) => void;
  onMessage: (match: Match) => void;
  onReviewCancellation?: (match: Match) => void;
  // Friendly match moderation
  onHideMatch?: (match: Match) => void;
  onUnhideMatch?: (match: Match) => void;
  onReportAbuse?: (match: Match) => void;
  onClearReport?: (match: Match) => void;
}

export function MatchRowActions({
  match,
  onView,
  onEdit,
  onEditParticipants,
  onVoid,
  onConvertToWalkover,
  onMessage,
  onReviewCancellation,
  onHideMatch,
  onUnhideMatch,
  onReportAbuse,
  onClearReport,
}: MatchRowActionsProps) {
  const isVoided = match.status === "VOID";
  const isCancelled = match.status === "CANCELLED";
  const isCompleted = match.status === "COMPLETED";
  const isOngoing = match.status === "ONGOING";
  const canVoid = !isVoided && !isCancelled;
  const canConvertToWalkover = !isVoided && !isCancelled && !match.isWalkover;
  const canEdit = isCompleted || isOngoing;
  const canEditParticipants = !isVoided && !isCancelled && !isOngoing;
  const canReviewCancellation = match.isLateCancellation && isCancelled;

  // Friendly match moderation - a match is "friendly" if it has no league/season/division
  const isFriendlyMatch = !match.divisionId && !match.leagueId && !match.seasonId;
  const isHidden = match.isHiddenFromPublic;
  const isReported = match.isReportedForAbuse;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <IconDotsVertical className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {/* View Match Details */}
        <DropdownMenuItem
          onClick={() => onView(match)}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          <IconEye className="mr-2 size-4" />
          View Details
        </DropdownMenuItem>

        {/* Edit Match Result */}
        {canEdit && (
          <DropdownMenuItem
            onClick={() => onEdit(match)}
            className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
          >
            <IconEdit className="mr-2 size-4" />
            Edit Result
          </DropdownMenuItem>
        )}

        {/* Edit Participants */}
        {canEditParticipants && (
          <DropdownMenuItem
            onClick={() => onEditParticipants(match)}
            className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
          >
            <IconUsers className="mr-2 size-4" />
            Edit Participants
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Copy Match ID */}
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(match.id);
            toast.success("Match ID copied to clipboard");
          }}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          <IconCopy className="mr-2 size-4" />
          Copy Match ID
        </DropdownMenuItem>

        {/* Message Participants */}
        <DropdownMenuItem
          onClick={() => onMessage(match)}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          <IconMessage className="mr-2 size-4" />
          Message Participants
        </DropdownMenuItem>

        {/* Review Late Cancellation */}
        {canReviewCancellation && onReviewCancellation && (
          <DropdownMenuItem
            onClick={() => onReviewCancellation(match)}
            className="cursor-pointer text-orange-600 focus:bg-accent focus:text-orange-600"
          >
            <IconClock className="mr-2 size-4" />
            Review Cancellation
          </DropdownMenuItem>
        )}

        {/* Convert to Walkover */}
        {canConvertToWalkover && (
          <DropdownMenuItem
            onClick={() => onConvertToWalkover(match)}
            className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
          >
            <IconWalk className="mr-2 size-4" />
            Convert to Walkover
          </DropdownMenuItem>
        )}

        {/* Friendly Match Moderation */}
        {isFriendlyMatch && (onHideMatch || onUnhideMatch || onReportAbuse || onClearReport) && (
          <>
            <DropdownMenuSeparator />
            {!isHidden && onHideMatch && (
              <DropdownMenuItem
                onClick={() => onHideMatch(match)}
                className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
              >
                <IconEyeOff className="mr-2 size-4" />
                Hide from Public
              </DropdownMenuItem>
            )}
            {isHidden && onUnhideMatch && (
              <DropdownMenuItem
                onClick={() => onUnhideMatch(match)}
                className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
              >
                <IconEyeCheck className="mr-2 size-4" />
                Unhide Match
              </DropdownMenuItem>
            )}
            {!isReported && onReportAbuse && (
              <DropdownMenuItem
                onClick={() => onReportAbuse(match)}
                className="cursor-pointer text-red-600 focus:bg-accent focus:text-red-600"
              >
                <IconFlag className="mr-2 size-4" />
                Report Abuse
              </DropdownMenuItem>
            )}
            {isReported && onClearReport && (
              <DropdownMenuItem
                onClick={() => onClearReport(match)}
                className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
              >
                <IconFlagOff className="mr-2 size-4" />
                Clear Report
              </DropdownMenuItem>
            )}
          </>
        )}

        {/* Void Match - Destructive */}
        {canVoid && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onVoid(match)}
              className="cursor-pointer focus:bg-destructive focus:text-destructive-foreground"
            >
              <IconBan className="mr-2 size-4" />
              Void Match
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
