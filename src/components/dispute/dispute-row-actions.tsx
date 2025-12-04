"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical, IconEye, IconGavel, IconNotes, IconMessage } from "@tabler/icons-react";
import { Dispute } from "@/constants/zod/dispute-schema";

interface DisputeRowActionsProps {
  dispute: Dispute;
  onView: (dispute: Dispute) => void;
  onResolve: (dispute: Dispute) => void;
  onAddNote: (dispute: Dispute) => void;
  onMessage?: (dispute: Dispute) => void;
}

export function DisputeRowActions({
  dispute,
  onView,
  onResolve,
  onAddNote,
  onMessage,
}: DisputeRowActionsProps) {
  const isResolved = dispute.status === "RESOLVED" || dispute.status === "REJECTED";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <IconDotsVertical className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onView(dispute)}>
          <IconEye className="size-4 mr-2" />
          View Details
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onAddNote(dispute)}>
          <IconNotes className="size-4 mr-2" />
          Add Note
        </DropdownMenuItem>

        {onMessage && (
          <DropdownMenuItem onClick={() => onMessage(dispute)}>
            <IconMessage className="size-4 mr-2" />
            Message Parties
          </DropdownMenuItem>
        )}

        {!isResolved && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onResolve(dispute)}
              className="text-primary"
            >
              <IconGavel className="size-4 mr-2" />
              Resolve Dispute
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
