"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconTrophy,
  IconCalendar,
  IconMapPin,
  IconActivity,
  IconChevronRight,
  IconChevronDown,
  IconCreditCard,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";

// Season membership interface
interface SeasonMembership {
  id: string;
  joinedAt: string;
  status: string;
  paymentStatus: string;
  seasonId: string;
  seasonName: string;
  seasonStartDate: string | null;
  seasonEndDate: string | null;
  seasonStatus: string;
  division: {
    id: string;
    name: string;
    gameType: string;
    genderCategory: string;
    level: number;
  } | null;
}

interface LeagueHistoryData {
  id: string;
  name: string;
  sportType: string;
  gameType?: string;
  location: string | null;
  description?: string | null;
  status: string;
  createdAt?: string;
  membership: {
    joinedAt: string;
    status?: string;
    paymentStatus?: string;
    division?: {
      id: string;
      name: string;
      gameType: string;
      genderCategory: string;
      level: number;
    } | null;
  } | null;
  seasonMemberships?: SeasonMembership[];
  _count: {
    memberships?: number;
    seasons: number;
  };
}

interface LeagueHistoryProps {
  leagues: LeagueHistoryData[] | null;
  isLoading: boolean;
}

const SPORT_OPTIONS = [
  { value: "tennis", label: "Tennis" },
  { value: "badminton", label: "Badminton" },
  { value: "pickleball", label: "Pickleball" },
  { value: "padel", label: "Padel" },
];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "UPCOMING", label: "Upcoming" },
  { value: "FINISHED", label: "Finished" },
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

// League status badge styles
const getLeagueStatusStyle = (status: string) => {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "UPCOMING":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "FINISHED":
      return "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400";
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400";
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
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400";
  }
};

// Payment status badge styles
const getPaymentStatusStyle = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PAID":
    case "ACTIVE":
    case "CONFIRMED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
    case "PENDING":
    case "AWAITING":
      return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
    case "OVERDUE":
    case "FAILED":
    case "INACTIVE":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
    case "WAIVED":
    case "FREE":
      return "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-700";
  }
};

// Format date helper
const formatDate = (dateString: string | null) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

// Get game type label
const getGameTypeLabel = (gameType: string) => {
  return gameType === "SINGLES" ? "Singles" : "Doubles";
};

const LeagueHistory: React.FC<LeagueHistoryProps> = ({ leagues, isLoading }) => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  // Expanded rows state
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const hasActiveFilters = searchQuery || sportFilter || statusFilter;

  const clearAllFilters = () => {
    setSearchQuery("");
    setSportFilter(undefined);
    setStatusFilter(undefined);
  };

  const toggleRowExpansion = (leagueId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(leagueId)) {
        newSet.delete(leagueId);
      } else {
        newSet.add(leagueId);
      }
      return newSet;
    });
  };

  // Computed statistics
  const stats = useMemo(() => {
    if (!leagues || leagues.length === 0) {
      return {
        totalLeagues: 0,
        activeLeagues: 0,
        totalSeasons: 0,
        mostActiveSport: "N/A",
      };
    }

    const activeLeagues = leagues.filter((l) => l.status === "ACTIVE").length;
    const totalSeasons = leagues.reduce(
      (sum, l) => sum + (l.seasonMemberships?.length || l._count.seasons || 0),
      0
    );

    // Find most active sport
    const sportCounts: Record<string, number> = {};
    leagues.forEach((l) => {
      const sport = l.sportType?.toLowerCase() || "unknown";
      sportCounts[sport] = (sportCounts[sport] || 0) + 1;
    });
    const mostActiveSport =
      Object.entries(sportCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

    return {
      totalLeagues: leagues.length,
      activeLeagues,
      totalSeasons,
      mostActiveSport:
        mostActiveSport !== "N/A"
          ? mostActiveSport.charAt(0).toUpperCase() + mostActiveSport.slice(1)
          : "N/A",
    };
  }, [leagues]);

  // Filtered leagues
  const filteredLeagues = useMemo(() => {
    if (!leagues) return [];

    return leagues.filter((league) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          league.name.toLowerCase().includes(query) ||
          league.location?.toLowerCase().includes(query) ||
          league.sportType?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (sportFilter && league.sportType?.toLowerCase() !== sportFilter) {
        return false;
      }

      if (statusFilter && league.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [leagues, searchQuery, sportFilter, statusFilter]);

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
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (!leagues || leagues.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 rounded-full bg-muted p-4">
            <IconTrophy className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No league history yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
            League participation history will appear here once the player joins
            leagues.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/leagues">Browse Leagues</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Leagues"
            value={stats.totalLeagues}
            icon={IconTrophy}
            description={`${filteredLeagues.length} shown`}
          />
          <StatsCard
            title="Active Leagues"
            value={stats.activeLeagues}
            icon={IconActivity}
            iconColor={stats.activeLeagues > 0 ? "text-green-600" : "text-muted-foreground"}
            description="Currently participating"
          />
          <StatsCard
            title="Seasons Played"
            value={stats.totalSeasons}
            icon={IconCalendar}
            description="Across all leagues"
          />
          <StatsCard
            title="Most Active Sport"
            value={stats.mostActiveSport}
            icon={IconTrophy}
            description="Primary sport played"
          />
        </div>

        {/* League Table Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2 border-b px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-1.5 text-base">
                <IconTrophy className="size-4" />
                League History
              </CardTitle>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {filteredLeagues.length} league{filteredLeagues.length !== 1 ? "s" : ""}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search leagues..."
                className="flex-1 max-w-sm"
              />
              <div className="flex flex-wrap items-center gap-2">
                <FilterSelect
                  value={sportFilter}
                  onChange={setSportFilter}
                  options={SPORT_OPTIONS}
                  placeholder="Sport"
                  allLabel="All"
                  triggerClassName="w-[90px] h-9 text-xs"
                />
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

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-lg border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[44px] py-2.5 pl-3"></TableHead>
                    <TableHead className="py-2.5 pl-0 font-medium text-xs">League</TableHead>
                    <TableHead className="w-[100px] py-2.5 font-medium text-xs">Sport</TableHead>
                    <TableHead className="w-[100px] py-2.5 font-medium text-xs">Joined</TableHead>
                    <TableHead className="w-[80px] py-2.5 font-medium text-xs text-center">Seasons</TableHead>
                    <TableHead className="w-[160px] py-2.5 font-medium text-xs">Division</TableHead>
                    <TableHead className="w-[100px] py-2.5 font-medium text-xs">Payment</TableHead>
                    <TableHead className="w-[90px] py-2.5 font-medium text-xs text-center pr-4">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeagues.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        No leagues found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeagues.map((league) => {
                      const isExpanded = expandedRows.has(league.id);
                      const hasSeasons = (league.seasonMemberships?.length || 0) > 0;
                      const latestDivision = league.membership?.division ||
                        (league.seasonMemberships?.[0]?.division);
                      const latestPayment = league.membership?.paymentStatus ||
                        (league.seasonMemberships?.[0]?.paymentStatus);

                      return (
                        <React.Fragment key={league.id}>
                          {/* Main league row */}
                          <TableRow
                            className={`group transition-colors ${
                              isExpanded
                                ? "bg-primary/5 hover:bg-primary/8"
                                : "hover:bg-muted/40"
                            } ${hasSeasons ? "cursor-pointer" : ""}`}
                            onClick={() => hasSeasons && toggleRowExpansion(league.id)}
                          >
                            {/* Expand toggle */}
                            <TableCell className="py-4 pl-3 pr-0">
                              {hasSeasons ? (
                                <div
                                  className={`flex items-center justify-center size-7 rounded-md transition-all ${
                                    isExpanded
                                      ? "bg-primary/10 text-primary"
                                      : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
                                  }`}
                                >
                                  {isExpanded ? (
                                    <IconChevronDown className="size-4" />
                                  ) : (
                                    <IconChevronRight className="size-4" />
                                  )}
                                </div>
                              ) : (
                                <span className="block w-7" />
                              )}
                            </TableCell>

                            {/* League name & location */}
                            <TableCell className="py-4 pl-0" onClick={(e) => e.stopPropagation()}>
                              <div className="space-y-1">
                                <Link
                                  href={`/league/view/${league.id}`}
                                  className="font-semibold text-sm hover:text-primary transition-colors inline-block"
                                >
                                  {league.name}
                                </Link>
                                {league.location && (
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <IconMapPin className="size-3.5 flex-shrink-0" />
                                    <span className="truncate max-w-[200px]">{league.location}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>

                            {/* Sport */}
                            <TableCell className="py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSportColor(
                                  league.sportType
                                )}`}
                              >
                                {league.sportType?.toLowerCase().replace(/^\w/, c => c.toUpperCase()) || "Unknown"}
                              </span>
                            </TableCell>

                            {/* Joined date */}
                            <TableCell className="py-3">
                              <div className="text-sm">
                                {formatShortDate(league.membership?.joinedAt || null)}
                              </div>
                            </TableCell>

                            {/* Seasons count */}
                            <TableCell className="py-3 text-center">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-sm cursor-help">
                                    {league.seasonMemberships?.length || league._count.seasons || 0}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{hasSeasons ? "Click row to see season details" : "No seasons yet"}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>

                            {/* Division - Now showing division name as link */}
                            <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                              {latestDivision ? (
                                <div className="space-y-1">
                                  <Link
                                    href={`/divisions/${latestDivision.id}`}
                                    className="text-sm font-medium hover:text-primary transition-colors inline-block"
                                  >
                                    {latestDivision.name}
                                  </Link>
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    {latestDivision.gameType === "DOUBLES" ? (
                                      <IconUsers className="size-3.5" />
                                    ) : (
                                      <IconUser className="size-3.5" />
                                    )}
                                    <span>{getGameTypeLabel(latestDivision.gameType)}</span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </TableCell>

                            {/* Payment status */}
                            <TableCell className="py-4">
                              {latestPayment ? (
                                <Badge
                                  variant="outline"
                                  className={`text-xs h-6 ${getPaymentStatusStyle(latestPayment)}`}
                                >
                                  <IconCreditCard className="size-3 mr-1.5" />
                                  {formatStatus(latestPayment)}
                                </Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </TableCell>

                            {/* League status */}
                            <TableCell className="py-3 text-center pr-4">
                              <span
                                className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium ${getLeagueStatusStyle(
                                  league.status
                                )}`}
                              >
                                {formatStatus(league.status)}
                              </span>
                            </TableCell>
                          </TableRow>

                          {/* Expanded seasons - spans all columns */}
                          {isExpanded && league.seasonMemberships && league.seasonMemberships.length > 0 && (
                            <TableRow className="bg-muted/20 hover:bg-muted/20">
                              <TableCell colSpan={8} className="p-0">
                                <div className="divide-y divide-border/50">
                                  {league.seasonMemberships.map((season) => (
                                    <div
                                      key={season.id}
                                      className="px-4 py-2.5 flex items-center justify-between gap-4 hover:bg-muted/30"
                                    >
                                      <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <span className="text-muted-foreground text-xs pl-6">↳</span>
                                        <span className="text-sm truncate">{season.seasonName}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {formatShortDate(season.seasonStartDate)}
                                          {season.seasonEndDate && ` — ${formatShortDate(season.seasonEndDate)}`}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3 flex-shrink-0">
                                        {season.division && (
                                          <Link
                                            href={`/divisions/${season.division.id}`}
                                            className="text-sm hover:text-primary transition-colors"
                                          >
                                            {season.division.name}
                                          </Link>
                                        )}
                                        <span
                                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSeasonStatusStyle(
                                            season.seasonStatus
                                          )}`}
                                        >
                                          {formatStatus(season.seasonStatus)}
                                        </span>
                                        <span
                                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPaymentStatusStyle(
                                            season.paymentStatus
                                          )}`}
                                        >
                                          {formatStatus(season.paymentStatus)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredLeagues.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No leagues found matching your filters.
                </div>
              ) : (
                filteredLeagues.map((league) => {
                  const isExpanded = expandedRows.has(league.id);
                  const hasSeasons = (league.seasonMemberships?.length || 0) > 0;
                  const latestDivision = league.membership?.division ||
                    (league.seasonMemberships?.[0]?.division);
                  const latestPayment = league.membership?.paymentStatus ||
                    (league.seasonMemberships?.[0]?.paymentStatus);

                  return (
                    <div
                      key={league.id}
                      className={`border rounded-xl overflow-hidden shadow-sm transition-shadow ${
                        isExpanded ? "shadow-md ring-1 ring-primary/20" : "hover:shadow-md"
                      }`}
                    >
                      {/* Main card content */}
                      <div className="p-4 space-y-4">
                        {/* Header with sport badge and status */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSportColor(
                              league.sportType
                            )}`}
                          >
                            {league.sportType?.toLowerCase().replace(/^\w/, c => c.toUpperCase()) || "Unknown"}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getLeagueStatusStyle(
                              league.status
                            )}`}
                          >
                            {formatStatus(league.status)}
                          </span>
                        </div>

                        {/* League name */}
                        <div className="space-y-1.5">
                          <Link
                            href={`/league/view/${league.id}`}
                            className="font-semibold text-base hover:text-primary transition-colors inline-block"
                          >
                            {league.name}
                          </Link>
                          {league.location && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <IconMapPin className="size-3.5" />
                              <span className="truncate">{league.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                          <span className="flex items-center gap-1.5">
                            <IconCalendar className="size-3.5" />
                            Joined {formatDate(league.membership?.joinedAt || null)}
                          </span>
                          <span className="text-muted-foreground/50">•</span>
                          <span className="font-medium text-foreground">
                            {league.seasonMemberships?.length || league._count.seasons} seasons
                          </span>
                        </div>

                        {/* Division and Payment */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {latestDivision && (
                            <Link
                              href={`/divisions/${latestDivision.id}`}
                              className="flex items-center gap-1.5 text-xs bg-muted hover:bg-muted/80 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              {latestDivision.gameType === "DOUBLES" ? (
                                <IconUsers className="size-3.5 text-muted-foreground" />
                              ) : (
                                <IconUser className="size-3.5 text-muted-foreground" />
                              )}
                              <span className="font-medium">{latestDivision.name}</span>
                              <span className="text-muted-foreground">• {getGameTypeLabel(latestDivision.gameType)}</span>
                            </Link>
                          )}
                          {latestPayment && (
                            <Badge
                              variant="outline"
                              className={`text-xs h-6 ${getPaymentStatusStyle(latestPayment)}`}
                            >
                              {formatStatus(latestPayment)}
                            </Badge>
                          )}
                        </div>

                        {/* Expand button */}
                        {hasSeasons && (
                          <Button
                            variant={isExpanded ? "secondary" : "outline"}
                            size="sm"
                            className="w-full h-9 text-xs font-medium"
                            onClick={() => toggleRowExpansion(league.id)}
                          >
                            {isExpanded ? (
                              <>
                                <IconChevronDown className="size-4 mr-1.5" />
                                Hide Seasons
                              </>
                            ) : (
                              <>
                                <IconChevronRight className="size-4 mr-1.5" />
                                Show {league.seasonMemberships?.length} Season{(league.seasonMemberships?.length || 0) !== 1 ? "s" : ""}
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Expanded seasons - simplified */}
                      {isExpanded && league.seasonMemberships && (
                        <div className="border-t bg-muted/20 divide-y divide-border/50">
                          {league.seasonMemberships.map((season) => (
                            <div
                              key={season.id}
                              className="px-4 py-3 flex items-center justify-between gap-3"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground text-xs">↳</span>
                                  <span className="text-sm">{season.seasonName}</span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5 pl-4">
                                  {formatShortDate(season.seasonStartDate)}
                                  {season.seasonEndDate && ` — ${formatShortDate(season.seasonEndDate)}`}
                                  {season.division && (
                                    <> · <Link href={`/divisions/${season.division.id}`} className="hover:text-primary">{season.division.name}</Link></>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${getSeasonStatusStyle(
                                    season.seasonStatus
                                  )}`}
                                >
                                  {formatStatus(season.seasonStatus)}
                                </span>
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${getPaymentStatusStyle(season.paymentStatus)}`}
                                >
                                  {formatStatus(season.paymentStatus)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default LeagueHistory;
