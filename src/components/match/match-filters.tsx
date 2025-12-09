"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SearchInput } from "@/components/ui/search-input";
import { FilterBar, FilterGroup } from "@/components/ui/filter-bar";
import { FilterSelect, type FilterOption } from "@/components/ui/filter-select";
import { IconAlertTriangle, IconClock, IconEyeOff, IconFlag } from "@tabler/icons-react";
import { useLeagues, useSeasons, useDivisions } from "@/hooks/use-queries";
import { MatchStatus, MatchContext } from "@/constants/zod/match-schema";
import { Skeleton } from "@/components/ui/skeleton";

interface MatchFiltersProps {
  selectedLeague?: string;
  selectedSeason?: string;
  selectedDivision?: string;
  selectedStatus?: MatchStatus;
  searchQuery?: string;
  showDisputedOnly?: boolean;
  showLateCancellations?: boolean;
  matchContext?: MatchContext;
  showHidden?: boolean;
  showReported?: boolean;
  onLeagueChange: (value: string | undefined) => void;
  onSeasonChange: (value: string | undefined) => void;
  onDivisionChange: (value: string | undefined) => void;
  onStatusChange: (value: MatchStatus | undefined) => void;
  onSearchChange: (value: string) => void;
  onDisputedChange: (value: boolean) => void;
  onLateCancellationChange?: (value: boolean) => void;
  onMatchContextChange?: (value: MatchContext | undefined) => void;
  onShowHiddenChange?: (value: boolean) => void;
  onShowReportedChange?: (value: boolean) => void;
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

const MATCH_CONTEXTS: FilterOption[] = [
  { value: "league", label: "League Matches" },
  { value: "friendly", label: "Friendly Matches" },
];

export function MatchFilters({
  selectedLeague,
  selectedSeason,
  selectedDivision,
  selectedStatus,
  searchQuery = "",
  showDisputedOnly = false,
  showLateCancellations = false,
  matchContext,
  showHidden = false,
  showReported = false,
  onLeagueChange,
  onSeasonChange,
  onDivisionChange,
  onStatusChange,
  onSearchChange,
  onDisputedChange,
  onLateCancellationChange,
  onMatchContextChange,
  onShowHiddenChange,
  onShowReportedChange,
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
    onSearchChange("");
    onDisputedChange(false);
    onLateCancellationChange?.(false);
    onMatchContextChange?.(undefined);
    onShowHiddenChange?.(false);
    onShowReportedChange?.(false);
  };

  const hasActiveFilters =
    selectedLeague || selectedSeason || selectedDivision || selectedStatus ||
    searchQuery || showDisputedOnly || showLateCancellations || matchContext ||
    showHidden || showReported;

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

  return (
    <div className={className}>
      <FilterBar onClearAll={handleClear} showClearButton={!!hasActiveFilters}>
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

        {/* Status Filter */}
        <FilterSelect
          value={selectedStatus}
          onChange={(val) => onStatusChange(val as MatchStatus | undefined)}
          options={MATCH_STATUSES}
          allLabel="All Statuses"
          triggerClassName="w-[160px]"
        />

        {/* Search Input */}
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search matches..."
          className="w-[200px]"
        />

        {/* Match Context Filter */}
        {onMatchContextChange && (
          <FilterSelect
            value={matchContext}
            onChange={(val) => onMatchContextChange(val as MatchContext | undefined)}
            options={MATCH_CONTEXTS}
            allLabel="All Matches"
            triggerClassName="w-[160px]"
          />
        )}

        {/* Checkbox Filters */}
        <FilterGroup>
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
              Disputed
            </Label>
          </div>

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
                Late Cancel
              </Label>
            </div>
          )}

          {onShowHiddenChange && (
            <div className="flex items-center space-x-2 px-2">
              <Checkbox
                id="show-hidden"
                checked={showHidden}
                onCheckedChange={(checked) => onShowHiddenChange(checked as boolean)}
              />
              <Label
                htmlFor="show-hidden"
                className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
              >
                <IconEyeOff className="size-4 text-muted-foreground" />
                Hidden
              </Label>
            </div>
          )}

          {onShowReportedChange && (
            <div className="flex items-center space-x-2 px-2">
              <Checkbox
                id="show-reported"
                checked={showReported}
                onCheckedChange={(checked) => onShowReportedChange(checked as boolean)}
              />
              <Label
                htmlFor="show-reported"
                className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
              >
                <IconFlag className="size-4 text-red-500" />
                Reported
              </Label>
            </div>
          )}
        </FilterGroup>
      </FilterBar>
    </div>
  );
}
