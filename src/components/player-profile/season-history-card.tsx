"use client";

import React, { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/ui/stats-card";
import { FilterSelect } from "@/components/ui/filter-select";
import { SearchInput } from "@/components/ui/search-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconCalendar,
  IconMapPin,
  IconActivity,
  IconTrophy,
  IconX,
} from "@tabler/icons-react";

export interface SeasonHistoryData {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
  membership: {
    joinedAt: string;
    status: string;
    paymentStatus?: string;
    division?: {
      id: string;
      name: string;
      gameType: string;
      genderCategory: string;
      level: string;
    };
  };
  // Direct leagues array from backend
  leagues?: Array<{
    id: string;
    name: string;
    sportType: string;
    location: string;
    status?: string;
  }>;
  // Category info
  category?: {
    id: string;
    name: string;
    gameType: string;
    genderCategory: string;
  };
}

interface SeasonHistoryProps {
  seasons: SeasonHistoryData[] | null;
  isLoading: boolean;
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "UPCOMING", label: "Upcoming" },
  { value: "FINISHED", label: "Finished" },
  { value: "CANCELLED", label: "Cancelled" },
];

// Sport color mapping - using official sport config colors
const getSportColor = (sport: string) => {
  switch (sport?.toLowerCase()) {
    case "tennis":
      return "text-[#518516] bg-[#518516]/10 border border-[#518516]/30 dark:bg-[#518516]/20 dark:text-[#7cb82f] dark:border-[#518516]/40";
    case "badminton":
      return "text-rose-700 bg-rose-100 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
    case "pickleball":
      return "text-[#8e41e6] bg-[#8e41e6]/10 border border-[#8e41e6]/30 dark:bg-[#8e41e6]/20 dark:text-[#b57aff] dark:border-[#8e41e6]/40";
    case "padel":
      return "text-[#3880c0] bg-[#3880c0]/10 border border-[#3880c0]/30 dark:bg-[#3880c0]/20 dark:text-[#6ba8e0] dark:border-[#3880c0]/40";
    default:
      return "text-slate-600 bg-slate-100 border border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-700";
  }
};

// Season status badge styles
const getSeasonStatusStyle = (status: string) => {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
    case "IN_PROGRESS":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "UPCOMING":
    case "REGISTRATION":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "COMPLETED":
    case "FINISHED":
      return "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400";
    case "CANCELLED":
      return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400";
  }
};

// Membership status badge styles
const getMembershipStatusStyle = (status: string) => {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
    case "CONFIRMED":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "PENDING":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "INACTIVE":
    case "CANCELLED":
      return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400";
  }
};

// Payment status badge styles
const getPaymentStatusStyle = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PAID":
    case "CONFIRMED":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "PENDING":
    case "AWAITING":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "OVERDUE":
    case "FAILED":
      return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
    case "WAIVED":
    case "FREE":
      return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400";
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400";
  }
};

// Format short date helper
const formatShortDate = (dateString: string | null) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

// Format status helper
const formatStatus = (status: string) => {
  if (!status) return "";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, " ");
};

// Format sport type
const formatSportType = (sportType: string) => {
  if (!sportType) return "Unknown";
  return sportType.toLowerCase().replace(/^\w/, c => c.toUpperCase());
};

const SeasonHistory: React.FC<SeasonHistoryProps> = ({ seasons, isLoading }) => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const hasActiveFilters = searchQuery || statusFilter;

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter(undefined);
  };

  // Computed statistics
  const stats = useMemo(() => {
    if (!seasons || seasons.length === 0) {
      return {
        totalSeasons: 0,
        activeSeasons: 0,
        completedSeasons: 0,
        cancelledSeasons: 0,
      };
    }

    const activeSeasons = seasons.filter((s) => s.status === "ACTIVE").length;
    const completedSeasons = seasons.filter((s) => s.status === "FINISHED").length;
    const cancelledSeasons = seasons.filter((s) => s.status === "CANCELLED").length;

    return {
      totalSeasons: seasons.length,
      activeSeasons,
      completedSeasons,
      cancelledSeasons,
    };
  }, [seasons]);

  // Filtered seasons
  const filteredSeasons = useMemo(() => {
    if (!seasons) return [];

    return seasons.filter((season) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          season.name.toLowerCase().includes(query) ||
          season.membership?.division?.name?.toLowerCase().includes(query) ||
          season.leagues?.some((l) => l.name.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      if (statusFilter && season.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [seasons, searchQuery, statusFilter]);

  // Helper to get league info from season
  const getLeagueInfo = (season: SeasonHistoryData) => {
    // Backend returns leagues directly on the season object
    if (!season.leagues || season.leagues.length === 0) {
      return null;
    }
    return season.leagues[0];
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats skeleton */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="size-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table skeleton */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2 border-b px-4">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (!seasons || seasons.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 rounded-full bg-muted p-4">
            <IconCalendar className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No season history yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
            Season participation history will appear here once the player joins
            seasons.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/seasons">Browse Seasons</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Seasons"
          value={stats.totalSeasons}
          icon={IconCalendar}
          description={`${filteredSeasons.length} shown`}
        />
        <StatsCard
          title="Active Seasons"
          value={stats.activeSeasons}
          icon={IconActivity}
          iconColor={stats.activeSeasons > 0 ? "text-green-600" : "text-muted-foreground"}
          description="Currently participating"
        />
        <StatsCard
          title="Completed"
          value={stats.completedSeasons}
          icon={IconTrophy}
          iconColor="text-blue-600"
          description="Finished seasons"
        />
        <StatsCard
          title="Cancelled"
          value={stats.cancelledSeasons}
          icon={IconX}
          iconColor={stats.cancelledSeasons > 0 ? "text-red-600" : "text-muted-foreground"}
          description="Cancelled seasons"
        />
      </div>

      {/* Season Table Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2 border-b px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-1.5 text-base">
              <IconCalendar className="size-4" />
              Season History
            </CardTitle>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {filteredSeasons.length} season{filteredSeasons.length !== 1 ? "s" : ""}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search seasons..."
              className="flex-1 max-w-sm"
            />
            <div className="flex flex-wrap items-center gap-2">
              <FilterSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={STATUS_OPTIONS}
                placeholder="Status"
                allLabel="All"
                triggerClassName="w-[95px] h-9 text-xs"
              />
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="py-2.5 pl-4 font-medium text-xs">Season</TableHead>
                  <TableHead className="py-2.5 font-medium text-xs">League</TableHead>
                  <TableHead className="py-2.5 font-medium text-xs">Sport</TableHead>
                  <TableHead className="py-2.5 font-medium text-xs">Dates</TableHead>
                  <TableHead className="py-2.5 font-medium text-xs">Division</TableHead>
                  <TableHead className="py-2.5 font-medium text-xs text-center">Membership</TableHead>
                  <TableHead className="py-2.5 font-medium text-xs text-center pr-4">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSeasons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No seasons found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSeasons.map((season) => {
                    const leagueInfo = getLeagueInfo(season);

                    return (
                      <TableRow
                        key={season.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        {/* Season name */}
                        <TableCell className="py-3 pl-4">
                          <div className="min-w-0">
                            <Link
                              to="/seasons/$seasonId"
                              params={{ seasonId: season.id }}
                              className="text-sm font-medium hover:text-primary transition-colors line-clamp-1"
                            >
                              {season.name}
                            </Link>
                          </div>
                        </TableCell>

                        {/* League */}
                        <TableCell className="py-3">
                          {leagueInfo ? (
                            <div className="min-w-0">
                              <Link
                                to="/league/view/$leagueId"
                                params={{ leagueId: leagueInfo.id }}
                                className="text-sm hover:text-primary transition-colors line-clamp-1"
                              >
                                {leagueInfo.name}
                              </Link>
                              {leagueInfo.location && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                  <IconMapPin className="size-3 flex-shrink-0" />
                                  <span className="truncate max-w-[150px]">{leagueInfo.location}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Sport */}
                        <TableCell className="py-3">
                          {leagueInfo?.sportType ? (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSportColor(
                                leagueInfo.sportType
                              )}`}
                            >
                              {formatSportType(leagueInfo.sportType)}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Dates */}
                        <TableCell className="py-3">
                          <div className="text-sm">
                            {formatShortDate(season.startDate)}
                            {season.endDate && (
                              <span className="text-muted-foreground"> — {formatShortDate(season.endDate)}</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Division */}
                        <TableCell className="py-3">
                          {season.membership.division ? (
                            <Link
                              to="/divisions/$divisionId"
                              params={{ divisionId: season.membership.division.id }}
                              className="text-sm hover:text-primary transition-colors"
                            >
                              {season.membership.division.name}
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Membership status */}
                        <TableCell className="py-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getMembershipStatusStyle(
                              season.membership.status
                            )}`}
                          >
                            {formatStatus(season.membership.status)}
                          </span>
                        </TableCell>

                        {/* Season status */}
                        <TableCell className="py-3 text-center pr-4">
                          <span
                            className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium ${getSeasonStatusStyle(
                              season.status
                            )}`}
                          >
                            {formatStatus(season.status)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredSeasons.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No seasons found matching your filters.
              </div>
            ) : (
              filteredSeasons.map((season) => {
                const leagueInfo = getLeagueInfo(season);

                return (
                  <div
                    key={season.id}
                    className="border rounded-lg bg-card shadow-sm"
                  >
                    <div className="p-4 space-y-3">
                      {/* Header with sport badge and status */}
                      <div className="flex items-center justify-between">
                        {leagueInfo?.sportType ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSportColor(
                              leagueInfo.sportType
                            )}`}
                          >
                            {formatSportType(leagueInfo.sportType)}
                          </span>
                        ) : (
                          <span />
                        )}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSeasonStatusStyle(
                            season.status
                          )}`}
                        >
                          {formatStatus(season.status)}
                        </span>
                      </div>

                      {/* Season name */}
                      <div>
                        <Link
                          to="/seasons/$seasonId"
                          params={{ seasonId: season.id }}
                          className="text-sm font-medium hover:text-primary transition-colors"
                        >
                          {season.name}
                        </Link>
                        {leagueInfo && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            <Link
                              to="/league/view/$leagueId"
                              params={{ leagueId: leagueInfo.id }}
                              className="hover:text-primary transition-colors"
                            >
                              {leagueInfo.name}
                            </Link>
                            {leagueInfo.location && (
                              <span className="ml-1">· {leagueInfo.location}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Info row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <IconCalendar className="size-3" />
                          <span>
                            {formatShortDate(season.startDate)}
                            {season.endDate && ` — ${formatShortDate(season.endDate)}`}
                          </span>
                        </div>
                        {season.membership.division && (
                          <Link
                            to="/divisions/$divisionId"
                            params={{ divisionId: season.membership.division.id }}
                            className="hover:text-primary transition-colors"
                          >
                            {season.membership.division.name}
                          </Link>
                        )}
                      </div>

                      {/* Membership status */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Membership:</span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${getMembershipStatusStyle(
                            season.membership.status
                          )}`}
                        >
                          {formatStatus(season.membership.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeasonHistory;
