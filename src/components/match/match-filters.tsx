"use client";

import React from "react";
import { SearchInput } from "@/components/ui/search-input";
import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect, type FilterOption } from "@/components/ui/filter-select";
import { FilterFlagsSelect, type MatchFlag } from "@/components/ui/filter-flags-select";
import { useLeagues, useSeasons, useDivisions } from "@/hooks/use-queries";
import { MatchStatus } from "@/constants/zod/match-schema";
import { Skeleton } from "@/components/ui/skeleton";

export type MatchTab = "league" | "friendly";

interface MatchFiltersProps {
  activeTab: MatchTab;
  selectedLeague?: string;
  selectedSeason?: string;
  selectedDivision?: string;
  selectedStatus?: MatchStatus;
  selectedSport?: string;
  searchQuery?: string;
  selectedFlag?: MatchFlag;
  onLeagueChange: (value: string | undefined) => void;
  onSeasonChange: (value: string | undefined) => void;
  onDivisionChange: (value: string | undefined) => void;
  onStatusChange: (value: MatchStatus | undefined) => void;
  onSportChange?: (value: string | undefined) => void;
  onSearchChange: (value: string) => void;
  onFlagChange: (value: MatchFlag | undefined) => void;
  className?: string;
}

const MATCH_STATUSES: FilterOption[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "UNFINISHED", label: "Unfinished" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "VOID", label: "Void" },
];

const SPORT_OPTIONS: FilterOption[] = [
  { value: "PICKLEBALL", label: "Pickleball" },
  { value: "TENNIS", label: "Tennis" },
  { value: "PADEL", label: "Padel" },
];

export function MatchFilters({
  activeTab,
  selectedLeague,
  selectedSeason,
  selectedDivision,
  selectedStatus,
  selectedSport,
  searchQuery = "",
  selectedFlag,
  onLeagueChange,
  onSeasonChange,
  onDivisionChange,
  onStatusChange,
  onSportChange,
  onSearchChange,
  onFlagChange,
  className = "",
}: MatchFiltersProps) {
  const { data: leagues, isLoading: leaguesLoading } = useLeagues();
  const { data: seasons, isLoading: seasonsLoading } = useSeasons();
  const { data: divisions, isLoading: divisionsLoading } = useDivisions();

  // Filter seasons by selected league
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

  // Transform data to FilterOption format
  const leagueOptions: FilterOption[] = React.useMemo(() =>
    leagues?.map((l) => ({ value: l.id, label: l.name })) || [],
    [leagues]
  );

  const seasonOptions: FilterOption[] = React.useMemo(() =>
    filteredSeasons.map((s) => ({ value: s.id, label: s.name })),
    [filteredSeasons]
  );

  const divisionOptions: FilterOption[] = React.useMemo(() =>
    filteredDivisions.map((d) => ({ value: d.id, label: d.name })),
    [filteredDivisions]
  );

  const handleClear = () => {
    onLeagueChange(undefined);
    onSeasonChange(undefined);
    onDivisionChange(undefined);
    onStatusChange(undefined);
    onSportChange?.(undefined);
    onSearchChange("");
    onFlagChange(undefined);
  };

  const hasActiveFilters =
    selectedLeague || selectedSeason || selectedDivision || selectedStatus ||
    selectedSport || searchQuery || selectedFlag;

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

  const isLeagueTab = activeTab === "league";

  return (
    <div className={className}>
      <FilterBar onClearAll={handleClear} showClearButton={!!hasActiveFilters}>
        {/* Search Input */}
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search matches..."
          className="w-[200px]"
        />

        {/* League Tab Filters */}
        {isLeagueTab && (
          <>
            {/* League Filter */}
            {leaguesLoading ? (
              <Skeleton className="h-9 w-[160px]" />
            ) : (
              <FilterSelect
                value={selectedLeague}
                onChange={handleLeagueChange}
                options={leagueOptions}
                allLabel="All Leagues"
                triggerClassName="w-[160px]"
              />
            )}

            {/* Season Filter */}
            {seasonsLoading ? (
              <Skeleton className="h-9 w-[160px]" />
            ) : (
              <FilterSelect
                value={selectedSeason}
                onChange={handleSeasonChange}
                options={seasonOptions}
                allLabel="All Seasons"
                triggerClassName="w-[160px]"
              />
            )}

            {/* Division Filter */}
            {divisionsLoading ? (
              <Skeleton className="h-9 w-[160px]" />
            ) : (
              <FilterSelect
                value={selectedDivision}
                onChange={onDivisionChange}
                options={divisionOptions}
                allLabel="All Divisions"
                triggerClassName="w-[160px]"
              />
            )}
          </>
        )}

        {/* Friendly Tab Filters - Sport */}
        {!isLeagueTab && onSportChange && (
          <FilterSelect
            value={selectedSport}
            onChange={onSportChange}
            options={SPORT_OPTIONS}
            allLabel="All Sports"
            triggerClassName="w-[140px]"
          />
        )}

        {/* Status Filter - Both Tabs */}
        <FilterSelect
          value={selectedStatus}
          onChange={(val) => onStatusChange(val as MatchStatus | undefined)}
          options={MATCH_STATUSES}
          allLabel="All Statuses"
          triggerClassName="w-[160px]"
        />

        {/* Flags Filter */}
        <FilterFlagsSelect
          value={selectedFlag}
          onChange={onFlagChange}
          triggerClassName="w-[130px]"
        />
      </FilterBar>
    </div>
  );
}
