

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
  IconCategory,
  IconCopy,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Season } from "@/constants/zod/season-schema";
import { useNavigate } from "@tanstack/react-router";

interface SeasonRowActionsProps {
  season: Season;
  onView: (season: Season) => void;
  onEdit: (season: Season) => void;
  onDelete: (season: Season) => void;
  onManagePlayers?: (season: Season) => void;
}

export function SeasonRowActions({
  season,
  onView,
  onEdit,
  onDelete,
  onManagePlayers,
}: SeasonRowActionsProps) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <IconDotsVertical className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {/* View Season Details */}
        <DropdownMenuItem
          onClick={() => onView(season)}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          <IconEye className="mr-2 size-4" />
          View Details
        </DropdownMenuItem>

        {/* View Full Page */}
        <DropdownMenuItem
          onClick={() => navigate({ to: `/seasons/${season.id}` })}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          <IconExternalLink className="mr-2 size-4" />
          View Full Page
        </DropdownMenuItem>

        {/* Edit Season */}
        <DropdownMenuItem
          onClick={() => onEdit(season)}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          <IconEdit className="mr-2 size-4" />
          Edit Season
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Copy Season ID */}
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(season.id);
            toast.success("Season ID copied to clipboard");
          }}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          <IconCopy className="mr-2 size-4" />
          Copy Season ID
        </DropdownMenuItem>

        {/* Manage Players */}
        {onManagePlayers && (
          <DropdownMenuItem
            onClick={() => onManagePlayers(season)}
            className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
          >
            <IconUsers className="mr-2 size-4" />
            Manage Players
          </DropdownMenuItem>
        )}

        {/* View Divisions */}
        <DropdownMenuItem
          onClick={() => navigate({ to: `/divisions?seasonId=${season.id}` })}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          <IconCategory className="mr-2 size-4" />
          View Divisions
        </DropdownMenuItem>

        {/* Delete Season - Destructive */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete(season)}
          className="cursor-pointer focus:bg-destructive focus:text-destructive-foreground"
        >
          <IconTrash className="mr-2 size-4" />
          Delete Season
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
