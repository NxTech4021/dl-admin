

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
  IconCalendar,
  IconCopy,
  IconUsers,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { League } from "@/constants/zod/league-schema";
import { useNavigate } from "@tanstack/react-router";

interface LeagueRowActionsProps {
  league: League;
  onView: (league: League) => void;
  onEdit: (league: League) => void;
  onDelete: (league: League) => void;
}

export function LeagueRowActions({
  league,
  onView,
  onEdit,
  onDelete,
}: LeagueRowActionsProps) {
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
        {/* View League Details */}
        <DropdownMenuItem
          onClick={() => onView(league)}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          <IconEye className="mr-2 size-4" />
          View Details
        </DropdownMenuItem>

        {/* View Full Page */}
        <DropdownMenuItem
          onClick={() => navigate({ to: `/league/view/${league.id}` })}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          <IconExternalLink className="mr-2 size-4" />
          View Full Page
        </DropdownMenuItem>

        {/* Edit League */}
        <DropdownMenuItem
          onClick={() => onEdit(league)}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          <IconEdit className="mr-2 size-4" />
          Edit League
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Copy League ID */}
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(league.id);
            toast.success("League ID copied to clipboard");
          }}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          <IconCopy className="mr-2 size-4" />
          Copy League ID
        </DropdownMenuItem>

        {/* View Seasons */}
        <DropdownMenuItem
          onClick={() => navigate({ to: `/seasons?leagueId=${league.id}` })}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          <IconCalendar className="mr-2 size-4" />
          View Seasons
        </DropdownMenuItem>

        {/* View Players */}
        <DropdownMenuItem
          onClick={() => navigate({ to: `/players?leagueId=${league.id}` })}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          <IconUsers className="mr-2 size-4" />
          View Players
        </DropdownMenuItem>

        {/* Delete League - Destructive */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete(league)}
          className="cursor-pointer focus:bg-destructive focus:text-destructive-foreground"
        >
          <IconTrash className="mr-2 size-4" />
          Delete League
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
