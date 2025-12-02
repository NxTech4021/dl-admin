"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconFilter, IconX, IconSearch, IconAlertTriangle, IconClock } from "@tabler/icons-react";
import { useLeagues, useSeasons, useDivisions } from "@/hooks/use-queries";
import { MatchStatus } from "@/constants/zod/match-schema";
import { Skeleton } from "@/components/ui/skeleton";

interface MatchFiltersProps {
  selectedLeague?: string;
  selectedSeason?: string;
  selectedDivision?: string;
  selectedStatus?: MatchStatus;
  searchQuery?: string;
  showDisputedOnly?: boolean;
  showLateCancellations?: boolean;
  onLeagueChange: (value: string | undefined) => void;
  onSeasonChange: (value: string | undefined) => void;
  onDivisionChange: (value: string | undefined) => void;
  onStatusChange: (value: MatchStatus | undefined) => void;
  onSearchChange: (value: string) => void;
  onDisputedChange: (value: boolean) => void;
  onLateCancellationChange?: (value: boolean) => void;
  className?: string;
}

const MATCH_STATUSES: { value: MatchStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "UNFINISHED", label: "Unfinished" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "VOID", label: "Void" },
];

export function MatchFilters({
  selectedLeague,
  selectedSeason,
  selectedDivision,
  selectedStatus,
  searchQuery = "",
  showDisputedOnly = false,
  showLateCancellations = false,
  onLeagueChange,
  onSeasonChange,
  onDivisionChange,
  onStatusChange,
  onSearchChange,
  onDisputedChange,
  onLateCancellationChange,
  className = "",
}: MatchFiltersProps) {
  const { data: leagues, isLoading: leaguesLoading } = useLeagues();
  const { data: seasons, isLoading: seasonsLoading } = useSeasons();
  const { data: divisions, isLoading: divisionsLoading } = useDivisions();

  // Filter seasons by selected league (seasons have a leagues array, not leagueId)
  const filteredSeasons = React.useMemo(() => {
    if (!seasons) return [];
    if (!selectedLeague) return seasons;
    return seasons.filter((season) =>
      season.leagues?.some((league) => league.id === selectedLeague)
    );
  }, [seasons, selectedLeague]);

  // Filter divisions by selected season
  const filteredDivisions = React.useMemo(() => {
    if (!divisions) return [];
    if (!selectedSeason) return divisions;
    return divisions.filter((division) => division.seasonId === selectedSeason);
  }, [divisions, selectedSeason]);

  const handleClear = () => {
    onLeagueChange(undefined);
    onSeasonChange(undefined);
    onDivisionChange(undefined);
    onStatusChange(undefined);
    onSearchChange("");
    onDisputedChange(false);
    onLateCancellationChange?.(false);
  };

  const hasActiveFilters =
    selectedLeague || selectedSeason || selectedDivision || selectedStatus || searchQuery || showDisputedOnly || showLateCancellations;

  // Handle league change - reset dependent filters
  const handleLeagueChange = (value: string) => {
    if (value === "all") {
      onLeagueChange(undefined);
      onSeasonChange(undefined);
      onDivisionChange(undefined);
    } else {
      onLeagueChange(value);
      // Reset season and division when league changes
      onSeasonChange(undefined);
      onDivisionChange(undefined);
    }
  };

  // Handle season change - reset dependent filters
  const handleSeasonChange = (value: string) => {
    if (value === "all") {
      onSeasonChange(undefined);
      onDivisionChange(undefined);
    } else {
      onSeasonChange(value);
      // Reset division when season changes
      onDivisionChange(undefined);
    }
  };

  const handleDivisionChange = (value: string) => {
    onDivisionChange(value === "all" ? undefined : value);
  };

  const handleStatusChange = (value: string) => {
    onStatusChange(value === "all" ? undefined : (value as MatchStatus));
  };

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap ${className}`}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <IconFilter className="size-4" />
        <span className="font-medium">Filters:</span>
      </div>

      <div className="flex flex-1 flex-wrap gap-2">
        {/* League Filter */}
        {leaguesLoading ? (
          <Skeleton className="h-9 w-[160px]" />
        ) : (
          <Select
            value={selectedLeague || "all"}
            onValueChange={handleLeagueChange}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Leagues" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leagues</SelectItem>
              {leagues?.map((league) => (
                <SelectItem key={league.id} value={league.id}>
                  {league.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Season Filter */}
        {seasonsLoading ? (
          <Skeleton className="h-9 w-[160px]" />
        ) : (
          <Select
            value={selectedSeason || "all"}
            onValueChange={handleSeasonChange}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Seasons" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seasons</SelectItem>
              {filteredSeasons.map((season) => (
                <SelectItem key={season.id} value={season.id}>
                  {season.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Division Filter */}
        {divisionsLoading ? (
          <Skeleton className="h-9 w-[160px]" />
        ) : (
          <Select
            value={selectedDivision || "all"}
            onValueChange={handleDivisionChange}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Divisions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Divisions</SelectItem>
              {filteredDivisions.map((division) => (
                <SelectItem key={division.id} value={division.id}>
                  {division.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Status Filter */}
        <Select
          value={selectedStatus || "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {MATCH_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search Input */}
        <div className="relative">
          <IconSearch className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search matches..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 w-[200px]"
          />
        </div>

        {/* Disputed Filter */}
        <div className="flex items-center space-x-2 px-2">
          <Checkbox
            id="disputed-only"
            checked={showDisputedOnly}
            onCheckedChange={(checked) => onDisputedChange(checked as boolean)}
          />
          <Label
            htmlFor="disputed-only"
            className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
          >
            <IconAlertTriangle className="size-4 text-destructive" />
            Disputed Only
          </Label>
        </div>

        {/* Late Cancellation Filter */}
        {onLateCancellationChange && (
          <div className="flex items-center space-x-2 px-2">
            <Checkbox
              id="late-cancellation"
              checked={showLateCancellations}
              onCheckedChange={(checked) => onLateCancellationChange(checked as boolean)}
            />
            <Label
              htmlFor="late-cancellation"
              className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
            >
              <IconClock className="size-4 text-orange-500" />
              Late Cancellations
            </Label>
          </div>
        )}

        {/* Clear Button */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <IconX className="size-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
