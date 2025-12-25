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
  IconTrash,
  IconExternalLink,
  IconUsers,
  IconChartBar,
  IconCopy,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Division } from "@/constants/zod/division-schema";
import { useRouter } from "next/navigation";

interface DivisionRowActionsProps {
  division: Division;
  onView: (division: Division) => void;
  onEdit: (division: Division) => void;
  onDelete: (division: Division) => void;
  onManagePlayers?: (division: Division) => void;
}

export function DivisionRowActions({
  division,
  onView,
  onEdit,
  onDelete,
  onManagePlayers,
}: DivisionRowActionsProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <IconDotsVertical className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {/* View Division Details */}
        <DropdownMenuItem
          onClick={() => onView(division)}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          <IconEye className="mr-2 size-4" />
          View Details
        </DropdownMenuItem>

        {/* View Full Page */}
        <DropdownMenuItem
          onClick={() => router.push(`/divisions/${division.id}`)}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          <IconExternalLink className="mr-2 size-4" />
          View Full Page
        </DropdownMenuItem>

        {/* Edit Division */}
        <DropdownMenuItem
          onClick={() => onEdit(division)}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          <IconEdit className="mr-2 size-4" />
          Edit Division
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Copy Division ID */}
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(division.id);
            toast.success("Division ID copied to clipboard");
          }}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          <IconCopy className="mr-2 size-4" />
          Copy Division ID
        </DropdownMenuItem>

        {/* Manage Players */}
        {onManagePlayers && (
          <DropdownMenuItem
            onClick={() => onManagePlayers(division)}
            className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
          >
            <IconUsers className="mr-2 size-4" />
            Manage Players
          </DropdownMenuItem>
        )}

        {/* View Standings */}
        <DropdownMenuItem
          onClick={() => router.push(`/divisions/${division.id}?tab=standings`)}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          <IconChartBar className="mr-2 size-4" />
          View Standings
        </DropdownMenuItem>

        {/* Delete Division - Destructive */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete(division)}
          className="cursor-pointer focus:bg-destructive focus:text-destructive-foreground"
        >
          <IconTrash className="mr-2 size-4" />
          Delete Division
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
