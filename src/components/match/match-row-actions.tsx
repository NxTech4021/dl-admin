"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
} from "@tabler/icons-react";
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <IconDotsVertical className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* View Match Details */}
        <DropdownMenuItem onClick={() => onView(match)}>
          <IconEye className="mr-2 size-4" />
          View Details
        </DropdownMenuItem>

        {/* Edit Match Result */}
        {canEdit && (
          <DropdownMenuItem onClick={() => onEdit(match)}>
            <IconEdit className="mr-2 size-4" />
            Edit Result
          </DropdownMenuItem>
        )}

        {/* Edit Participants */}
        {canEditParticipants && (
          <DropdownMenuItem onClick={() => onEditParticipants(match)}>
            <IconUsers className="mr-2 size-4" />
            Edit Participants
          </DropdownMenuItem>
        )}

        {/* Message Participants */}
        <DropdownMenuItem onClick={() => onMessage(match)}>
          <IconMessage className="mr-2 size-4" />
          Message Participants
        </DropdownMenuItem>

        {/* Review Late Cancellation */}
        {canReviewCancellation && onReviewCancellation && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onReviewCancellation(match)}
              className="text-orange-600 focus:text-orange-600"
            >
              <IconClock className="mr-2 size-4" />
              Review Cancellation
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Convert to Walkover */}
        {canConvertToWalkover && (
          <DropdownMenuItem onClick={() => onConvertToWalkover(match)}>
            <IconWalk className="mr-2 size-4" />
            Convert to Walkover
          </DropdownMenuItem>
        )}

        {/* Void Match */}
        {canVoid && (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onVoid(match)}
          >
            <IconBan className="mr-2 size-4" />
            Void Match
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
