"use client";

import React from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { IconFilter } from "@tabler/icons-react";
import { MatchStatus } from "@/constants/zod/match-schema";
import { MatchFilterDrawer, type Sport, type MatchFlagType } from "./match-filter-drawer";
import { ActiveFilterChips } from "./active-filter-chips";
import { useLeagues, useSeasons, useDivisions } from "@/hooks/queries";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MatchFiltersProps {
  // Sport filter
  selectedSport?: Sport;
  onSportChange: (value: Sport | undefined) => void;
  // Location filters
  selectedLeague?: string;
  selectedSeason?: string;
  selectedDivision?: string;
  onLeagueChange: (value: string | undefined) => void;
  onSeasonChange: (value: string | undefined) => void;
  onDivisionChange: (value: string | undefined) => void;
  // Match filters
  selectedStatus?: MatchStatus;
  onStatusChange: (value: MatchStatus | undefined) => void;
  // Flag filter (simplified from showDisputedOnly/showLateCancellations)
  selectedFlag?: MatchFlagType;
  onFlagChange: (value: MatchFlagType | undefined) => void;
  // Search
  searchQuery?: string;
  onSearchChange: (value: string) => void;
  // Legacy support - will be deprecated
  showDisputedOnly?: boolean;
  onDisputedChange?: (value: boolean) => void;
  showLateCancellations?: boolean;
  onLateCancellationChange?: (value: boolean) => void;
  className?: string;
}

export function MatchFilters({
  selectedSport,
  onSportChange,
  selectedLeague,
  selectedSeason,
  selectedDivision,
  onLeagueChange,
  onSeasonChange,
  onDivisionChange,
  selectedStatus,
  onStatusChange,
  selectedFlag,
  onFlagChange,
  searchQuery = "",
  onSearchChange,
  // Legacy props - map them to new flag system
  showDisputedOnly,
  onDisputedChange,
  showLateCancellations,
  onLateCancellationChange,
  className = "",
}: MatchFiltersProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Fetch data for display names
  const { data: leagues } = useLeagues();
  const { data: seasons } = useSeasons();
  const { data: divisions } = useDivisions();

  // Get display names for filter chips
  const leagueName = React.useMemo(() =>
    leagues?.find((l) => l.id === selectedLeague)?.name,
    [leagues, selectedLeague]
  );

  const seasonName = React.useMemo(() =>
    seasons?.find((s) => s.id === selectedSeason)?.name,
    [seasons, selectedSeason]
  );

  const divisionName = React.useMemo(() =>
    divisions?.find((d) => d.id === selectedDivision)?.name,
    [divisions, selectedDivision]
  );

  // Derive selectedFlag from legacy props if needed
  const effectiveFlag = React.useMemo(() => {
    if (selectedFlag) return selectedFlag;
    if (showDisputedOnly) return "disputed" as MatchFlagType;
    if (showLateCancellations) return "lateCancellation" as MatchFlagType;
    return undefined;
  }, [selectedFlag, showDisputedOnly, showLateCancellations]);

  // Handle flag change with legacy support
  const handleFlagChange = (value: MatchFlagType | undefined) => {
    if (onFlagChange) {
      onFlagChange(value);
    }
    // Legacy support
    if (onDisputedChange) {
      onDisputedChange(value === "disputed");
    }
    if (onLateCancellationChange) {
      onLateCancellationChange(value === "lateCancellation");
    }
  };

  // Handle clear all with legacy support
  const handleClearAll = () => {
    onSportChange(undefined);
    onLeagueChange(undefined);
    onSeasonChange(undefined);
    onDivisionChange(undefined);
    onStatusChange(undefined);
    handleFlagChange(undefined);
    onSearchChange("");
  };

  // Handle league change - reset dependent filters
  const handleLeagueChange = (value: string | undefined) => {
    onLeagueChange(value);
    onSeasonChange(undefined);
    onDivisionChange(undefined);
  };

  // Handle season change - reset dependent filters
  const handleSeasonChange = (value: string | undefined) => {
    onSeasonChange(value);
    onDivisionChange(undefined);
  };

  // Count active filters (excluding search)
  const activeFilterCount = [
    selectedSport,
    selectedLeague,
    selectedSeason,
    selectedDivision,
    selectedStatus,
    effectiveFlag,
  ].filter(Boolean).length;

  return (
    <div className={cn("", className)}>
      {/* Main Filter Bar */}
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search matches..."
          className="w-[220px]"
        />

        {/* Filters Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDrawerOpen(true)}
          className="gap-1.5 shrink-0 h-9 cursor-pointer"
        >
          <IconFilter className="size-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="h-5 min-w-5 px-1.5 rounded-full text-xs font-medium"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Active Filter Chips */}
        <div className="flex-1 min-w-0 overflow-x-auto">
          <ActiveFilterChips
            selectedSport={selectedSport}
            selectedLeague={selectedLeague}
            selectedSeason={selectedSeason}
            selectedDivision={selectedDivision}
            selectedStatus={selectedStatus}
            selectedFlag={effectiveFlag}
            leagueName={leagueName}
            seasonName={seasonName}
            divisionName={divisionName}
            onRemoveSport={() => onSportChange(undefined)}
            onRemoveLeague={() => handleLeagueChange(undefined)}
            onRemoveSeason={() => handleSeasonChange(undefined)}
            onRemoveDivision={() => onDivisionChange(undefined)}
            onRemoveStatus={() => onStatusChange(undefined)}
            onRemoveFlag={() => handleFlagChange(undefined)}
            onClearAll={handleClearAll}
          />
        </div>
      </div>

      {/* Filter Drawer */}
      <MatchFilterDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        selectedSport={selectedSport}
        onSportChange={onSportChange}
        selectedLeague={selectedLeague}
        selectedSeason={selectedSeason}
        selectedDivision={selectedDivision}
        onLeagueChange={handleLeagueChange}
        onSeasonChange={handleSeasonChange}
        onDivisionChange={onDivisionChange}
        selectedStatus={selectedStatus}
        onStatusChange={onStatusChange}
        selectedFlag={effectiveFlag}
        onFlagChange={handleFlagChange}
        onClearAll={handleClearAll}
      />
    </div>
  );
}

// Re-export types for convenience
export type { Sport, MatchFlagType } from "./match-filter-drawer";
