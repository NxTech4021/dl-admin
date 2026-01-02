

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
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
import { Season, GroupedSeason } from "@/constants/zod/season-schema";
import { useNavigate } from "@tanstack/react-router";

interface SeasonRowActionsProps {
  season: Season;
  onView: (season: Season) => void;
  onEdit: (season: Season) => void;
  onDelete: (season: Season) => void;
  onManagePlayers?: (season: Season) => void;
}

interface GroupedSeasonRowActionsProps {
  group: GroupedSeason;
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

// New component for grouped seasons with sub-menus
export function GroupedSeasonRowActions({
  group,
  onView,
  onEdit,
  onDelete,
  onManagePlayers,
}: GroupedSeasonRowActionsProps) {
  const navigate = useNavigate();
  const seasons = group.seasons;
  const hasMultiple = seasons.length > 1;

  // Helper to get category label
  const getCategoryLabel = (season: Season) =>
    season.category?.name || "No category";

  // For single season or empty array, use regular actions or return null
  if (!hasMultiple) {
    if (seasons.length === 0) return null;
    return (
      <SeasonRowActions
        season={seasons[0]}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onManagePlayers={onManagePlayers}
      />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <IconDotsVertical className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* View Details - Sub Menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <IconEye className="mr-2 size-4" />
            View Details
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {seasons.map((season) => (
              <DropdownMenuItem
                key={season.id}
                onClick={() => onView(season)}
                className="cursor-pointer"
              >
                {getCategoryLabel(season)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* View Full Page - Sub Menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <IconExternalLink className="mr-2 size-4" />
            View Full Page
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {seasons.map((season) => (
              <DropdownMenuItem
                key={season.id}
                onClick={() => navigate({ to: `/seasons/${season.id}` })}
                className="cursor-pointer"
              >
                {getCategoryLabel(season)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Edit Season - Sub Menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <IconEdit className="mr-2 size-4" />
            Edit Season
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {seasons.map((season) => (
              <DropdownMenuItem
                key={season.id}
                onClick={() => onEdit(season)}
                className="cursor-pointer"
              >
                {getCategoryLabel(season)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Copy Season ID - Sub Menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <IconCopy className="mr-2 size-4" />
            Copy Season ID
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {seasons.map((season) => (
              <DropdownMenuItem
                key={season.id}
                onClick={() => {
                  navigator.clipboard.writeText(season.id);
                  toast.success(
                    `${getCategoryLabel(season)} ID copied to clipboard`
                  );
                }}
                className="cursor-pointer"
              >
                {getCategoryLabel(season)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Manage Players - Sub Menu */}
        {onManagePlayers && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <IconUsers className="mr-2 size-4" />
              Manage Players
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {seasons.map((season) => (
                <DropdownMenuItem
                  key={season.id}
                  onClick={() => onManagePlayers(season)}
                  className="cursor-pointer"
                >
                  {getCategoryLabel(season)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        {/* View Divisions - Sub Menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <IconCategory className="mr-2 size-4" />
            View Divisions
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {seasons.map((season) => (
              <DropdownMenuItem
                key={season.id}
                onClick={() =>
                  navigate({ to: `/divisions?seasonId=${season.id}` })
                }
                className="cursor-pointer"
              >
                {getCategoryLabel(season)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Delete Season - Sub Menu */}
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer text-destructive focus:text-destructive">
            <IconTrash className="mr-2 size-4" />
            Delete Season
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {seasons.map((season) => (
              <DropdownMenuItem
                key={season.id}
                variant="destructive"
                onClick={() => onDelete(season)}
                className="cursor-pointer"
              >
                {getCategoryLabel(season)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
