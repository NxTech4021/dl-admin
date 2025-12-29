"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeagues, useSeasons, useDivisions } from "@/hooks/use-queries";
import { MatchStatus } from "@/constants/zod/match-schema";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  IconFilter,
  IconX,
  IconBallTennis,
  IconTrophy,
} from "@tabler/icons-react";

// Sport type
export type Sport = "PICKLEBALL" | "TENNIS" | "PADEL";

// Flag type for consistency
export type MatchFlagType = "disputed" | "lateCancellation" | "walkover" | "requiresReview";

interface MatchFilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  selectedFlag?: MatchFlagType;
  onFlagChange: (value: MatchFlagType | undefined) => void;
  // Actions
  onClearAll: () => void;
}

const SPORT_OPTIONS: { value: Sport; label: string; color: string; bgColor: string }[] = [
  { value: "TENNIS", label: "Tennis", color: "text-[#518516]", bgColor: "bg-[#518516]/10 border-[#518516]/30" },
  { value: "PICKLEBALL", label: "Pickleball", color: "text-[#8e41e6]", bgColor: "bg-[#8e41e6]/10 border-[#8e41e6]/30" },
  { value: "PADEL", label: "Padel", color: "text-[#3880c0]", bgColor: "bg-[#3880c0]/10 border-[#3880c0]/30" },
];

const MATCH_STATUSES: { value: MatchStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "UNFINISHED", label: "Unfinished" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "VOID", label: "Void" },
];

const FLAG_OPTIONS: { value: MatchFlagType; label: string }[] = [
  { value: "disputed", label: "Disputed" },
  { value: "lateCancellation", label: "Late Cancellation" },
  { value: "walkover", label: "Walkover" },
  { value: "requiresReview", label: "Requires Review" },
];

export function MatchFilterDrawer({
  open,
  onOpenChange,
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
  onClearAll,
}: MatchFilterDrawerProps) {
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

  // Handle league change - reset dependent filters
  const handleLeagueChange = (value: string) => {
    const newValue = value === "all" ? undefined : value;
    onLeagueChange(newValue);
    onSeasonChange(undefined);
    onDivisionChange(undefined);
  };

  // Handle season change - reset dependent filters
  const handleSeasonChange = (value: string) => {
    const newValue = value === "all" ? undefined : value;
    onSeasonChange(newValue);
    onDivisionChange(undefined);
  };

  // Count active filters
  const activeFilterCount = [
    selectedSport,
    selectedLeague,
    selectedSeason,
    selectedDivision,
    selectedStatus,
    selectedFlag,
  ].filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-[400px] p-0 flex flex-col h-full overflow-hidden [&>button]:hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          {/* Title row with actions */}
          <div className="flex items-center justify-between">
            <DialogTitle asChild>
              <div className="flex items-center gap-2.5">
                <IconFilter className="h-5 w-5 text-foreground/80" />
                <h2 className="text-base font-semibold text-foreground">Filters</h2>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 text-xs font-semibold rounded-full bg-primary/15 text-primary">
                    {activeFilterCount}
                  </span>
                )}
              </div>
            </DialogTitle>

            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={onClearAll}
                  className="inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-medium text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors border border-destructive/30 cursor-pointer gap-1.5"
                >
                  <IconX className="h-4 w-4" />
                  Clear all
                </button>
              )}

              <button
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center justify-center h-9 w-9 rounded-md text-foreground/80 hover:text-foreground hover:bg-muted/70 transition-colors border border-border cursor-pointer"
                aria-label="Close"
              >
                <IconX className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        </div>
        <Separator />

        {/* Filter Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-5 space-y-6">
            {/* Sport Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                <IconBallTennis className="h-[18px] w-[18px] text-foreground/70" />
                <span>Sport</span>
                {selectedSport && (
                  <button
                    onClick={() => onSportChange(undefined)}
                    className="ml-auto text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted/70 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {SPORT_OPTIONS.map((sport) => (
                  <button
                    key={sport.value}
                    type="button"
                    onClick={() => {
                      if (selectedSport === sport.value) {
                        onSportChange(undefined);
                      } else {
                        onSportChange(sport.value);
                      }
                    }}
                    className={cn(
                      "flex items-center justify-center px-3 py-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-all",
                      selectedSport === sport.value
                        ? cn(sport.bgColor, sport.color)
                        : "border-border/60 text-foreground/80 hover:border-border hover:bg-muted/50"
                    )}
                  >
                    {sport.label}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Competition Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                <IconTrophy className="h-[18px] w-[18px] text-foreground/70" />
                <span>Competition</span>
              </div>

              {/* League */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">League</label>
                {leaguesLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={selectedLeague || "all"}
                    onValueChange={handleLeagueChange}
                  >
                    <SelectTrigger className="h-10 text-sm border-border/60">
                      <SelectValue placeholder="All Leagues" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-sm">All Leagues</SelectItem>
                      {leagues?.map((league) => (
                        <SelectItem key={league.id} value={league.id} className="text-sm">
                          {league.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Season */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">Season</label>
                {seasonsLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={selectedSeason || "all"}
                    onValueChange={handleSeasonChange}
                  >
                    <SelectTrigger className="h-10 text-sm border-border/60">
                      <SelectValue placeholder="All Seasons" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-sm">All Seasons</SelectItem>
                      {filteredSeasons.map((season) => (
                        <SelectItem key={season.id} value={season.id} className="text-sm">
                          {season.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Division */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">Division</label>
                {divisionsLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={selectedDivision || "all"}
                    onValueChange={(value) => onDivisionChange(value === "all" ? undefined : value)}
                  >
                    <SelectTrigger className="h-10 text-sm border-border/60">
                      <SelectValue placeholder="All Divisions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-sm">All Divisions</SelectItem>
                      {filteredDivisions.map((division) => (
                        <SelectItem key={division.id} value={division.id} className="text-sm">
                          {division.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <Separator />

            {/* Match Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                <IconTrophy className="h-[18px] w-[18px] text-foreground/70" />
                <span>Match</span>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">Status</label>
                <Select
                  value={selectedStatus || "all"}
                  onValueChange={(value) => onStatusChange(value === "all" ? undefined : value as MatchStatus)}
                >
                  <SelectTrigger className="h-10 text-sm border-border/60">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-sm">All Statuses</SelectItem>
                    {MATCH_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value} className="text-sm">
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Flags */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">Flags</label>
                <Select
                  value={selectedFlag || "all"}
                  onValueChange={(value) => onFlagChange(value === "all" ? undefined : value as MatchFlagType)}
                >
                  <SelectTrigger className="h-10 text-sm border-border/60">
                    <SelectValue placeholder="All Flags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-sm">All Flags</SelectItem>
                    {FLAG_OPTIONS.map((flag) => (
                      <SelectItem key={flag.value} value={flag.value} className="text-sm">
                        {flag.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <Separator />
        <div className="px-5 py-3">
          <p className="text-xs text-center text-muted-foreground">
            {activeFilterCount > 0
              ? `${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} applied`
              : 'No filters applied'}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
