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
} from "@tabler/icons-react";
import { Match } from "@/constants/zod/match-schema";

interface MatchRowActionsProps {
  match: Match;
  onView: (match: Match) => void;
  onEdit: (match: Match) => void;
  onVoid: (match: Match) => void;
  onConvertToWalkover: (match: Match) => void;
  onMessage: (match: Match) => void;
}

export function MatchRowActions({
  match,
  onView,
  onEdit,
  onVoid,
  onConvertToWalkover,
  onMessage,
}: MatchRowActionsProps) {
  const isVoided = match.status === "VOID";
  const isCancelled = match.status === "CANCELLED";
  const isCompleted = match.status === "COMPLETED";
  const canVoid = !isVoided && !isCancelled;
  const canConvertToWalkover = !isVoided && !isCancelled && !match.isWalkover;
  const canEdit = isCompleted || match.status === "ONGOING";

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

        {/* Message Participants */}
        <DropdownMenuItem onClick={() => onMessage(match)}>
          <IconMessage className="mr-2 size-4" />
          Message Participants
        </DropdownMenuItem>

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
