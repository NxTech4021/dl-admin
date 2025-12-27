"use client";

import React, { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  IconTarget,
  IconTrendingUp,
  IconFlame,
  IconChartLine,
  IconUsers,
  IconUser,
  IconMapPin,
  IconClock,
  IconAlertTriangle,
  IconWalk,
  IconEye,
  IconFlag,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatsCard } from "@/components/ui/stats-card";
import { FilterSelect } from "@/components/ui/filter-select";
import { SearchInput } from "@/components/ui/search-input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OpponentInfo {
  id: string;
  name: string;
  username?: string;
  image?: string;
  team?: string;
  role?: string;
}

interface MatchData {
  id: string;
  sport: string;
  matchType: string;
  playerScore: number | null;
  opponentScore: number | null;
  formattedScore?: string | null;
  outcome: "win" | "loss" | "draw" | null;
  matchDate: string;
  location: string | null;
  venue: string | null;
  notes: string | null;
  duration: number | null;
  status: string;
  isFriendly?: boolean;
  isWalkover?: boolean;
  isDisputed?: boolean;
  requiresAdminReview?: boolean;
  isReportedForAbuse?: boolean;
  division?: {
    id: string;
    name: string;
    league?: {
      id: string;
      name: string;
    };
  };
  opponents?: OpponentInfo[];
  opponentName?: string | null;
  ratingChange?: number;
}

interface MatchHistoryProps {
  matches: MatchData[] | null;
  isLoading: boolean;
  playerId?: string;
}

const SPORT_OPTIONS = [
  { value: "tennis", label: "Tennis" },
  { value: "badminton", label: "Badminton" },
  { value: "pickleball", label: "Pickleball" },
  { value: "padel", label: "Padel" },
];

const TYPE_OPTIONS = [
  { value: "singles", label: "Singles" },
  { value: "doubles", label: "Doubles" },
];

const STATUS_OPTIONS = [
  { value: "COMPLETED", label: "Completed" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "CANCELLED", label: "Cancelled" },
];

const OUTCOME_OPTIONS = [
  { value: "win", label: "Win" },
  { value: "loss", label: "Loss" },
  { value: "draw", label: "Draw" },
];

// Sport color mapping - using official sport config colors
// Tennis: #518516 (green), Pickleball: #8e41e6 (purple), Padel: #3880c0 (blue)
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

// Helper to capitalize status
const formatStatus = (status: string) => {
  if (!status) return "";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

// Helper to format duration in minutes to readable format
const formatDuration = (minutes: number | null) => {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const MatchHistory: React.FC<MatchHistoryProps> = ({
  matches,
  isLoading,
}) => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [outcomeFilter, setOutcomeFilter] = useState<string | undefined>();

  const hasActiveFilters =
    searchQuery || sportFilter || typeFilter || statusFilter || outcomeFilter;

  const clearAllFilters = () => {
    setSearchQuery("");
    setSportFilter(undefined);
    setTypeFilter(undefined);
    setStatusFilter(undefined);
    setOutcomeFilter(undefined);
  };

  // Computed statistics
  const stats = useMemo(() => {
    if (!matches || matches.length === 0) {
      return {
        totalMatches: 0,
        winRate: 0,
        currentStreak: "N/A",
        completedMatches: 0,
      };
    }

    const completedMatches = matches.filter((m) => m.status === "COMPLETED");
    const wins = completedMatches.filter((m) => m.outcome === "win").length;
    const losses = completedMatches.filter((m) => m.outcome === "loss").length;
    const winRate =
      completedMatches.length > 0
        ? Math.round((wins / completedMatches.length) * 100)
        : 0;

    // Calculate current streak
    let streakType: "W" | "L" | null = null;
    let streakCount = 0;
    const sortedMatches = [...completedMatches].sort(
      (a, b) =>
        new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()
    );

    for (const match of sortedMatches) {
      if (!match.outcome) continue;
      const isWin = match.outcome === "win";
      if (streakType === null) {
        streakType = isWin ? "W" : "L";
        streakCount = 1;
      } else if ((streakType === "W" && isWin) || (streakType === "L" && !isWin)) {
        streakCount++;
      } else {
        break;
      }
    }

    const currentStreak =
      streakType && streakCount > 0 ? `${streakType}${streakCount}` : "N/A";

    return {
      totalMatches: matches.length,
      winRate,
      currentStreak,
      completedMatches: completedMatches.length,
      wins,
      losses,
    };
  }, [matches]);

  // Filtered matches
  const filteredMatches = useMemo(() => {
    if (!matches) return [];

    return matches.filter((match) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          match.opponentName?.toLowerCase().includes(query) ||
          match.opponents?.some((opp) =>
            opp.name?.toLowerCase().includes(query)
          ) ||
          match.division?.name?.toLowerCase().includes(query) ||
          match.division?.league?.name?.toLowerCase().includes(query) ||
          match.location?.toLowerCase().includes(query) ||
          match.sport?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (sportFilter && match.sport?.toLowerCase() !== sportFilter) {
        return false;
      }

      if (typeFilter && match.matchType?.toLowerCase() !== typeFilter) {
        return false;
      }

      if (statusFilter && match.status !== statusFilter) {
        return false;
      }

      if (outcomeFilter && match.outcome !== outcomeFilter) {
        return false;
      }

      return true;
    });
  }, [matches, searchQuery, sportFilter, typeFilter, statusFilter, outcomeFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getOutcomeBadgeStyle = (outcome: string | null) => {
    switch (outcome) {
      case "win":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      case "loss":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      case "draw":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "CANCELLED":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "IN_PROGRESS":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400";
    }
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
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (!matches || matches.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 rounded-full bg-muted p-4">
            <IconTarget className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
            Match history will appear here once the player participates in
            matches.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/league">Browse Leagues</Link>
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
            title="Total Matches"
            value={stats.totalMatches}
            icon={IconTarget}
            description={`${stats.completedMatches} completed`}
          />
          <StatsCard
            title="Win Rate"
            value={`${stats.winRate}%`}
            icon={IconTrendingUp}
            iconColor={stats.winRate >= 50 ? "text-green-600" : "text-muted-foreground"}
            description={`${stats.wins || 0}W - ${stats.losses || 0}L`}
          />
          <StatsCard
            title="Current Streak"
            value={stats.currentStreak}
            icon={IconFlame}
            iconColor={
              stats.currentStreak.startsWith("W")
                ? "text-green-600"
                : stats.currentStreak.startsWith("L")
                ? "text-red-600"
                : "text-muted-foreground"
            }
            description="Consecutive results"
          />
          <StatsCard
            title="Filtered"
            value={filteredMatches.length}
            icon={IconChartLine}
            description={hasActiveFilters ? "Matches shown" : "All matches"}
          />
        </div>

        {/* Match List Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <IconTarget className="size-5" />
                Match History
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {filteredMatches.length} match{filteredMatches.length !== 1 ? "es" : ""}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Consolidated Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search opponent, sport, division..."
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
                  value={typeFilter}
                  onChange={setTypeFilter}
                  options={TYPE_OPTIONS}
                  placeholder="Type"
                  allLabel="All"
                  triggerClassName="w-[85px] h-9 text-xs"
                />
                <FilterSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={STATUS_OPTIONS}
                  placeholder="Status"
                  allLabel="All"
                  triggerClassName="w-[95px] h-9 text-xs"
                />
                <FilterSelect
                  value={outcomeFilter}
                  onChange={setOutcomeFilter}
                  options={OUTCOME_OPTIONS}
                  placeholder="Result"
                  allLabel="All"
                  triggerClassName="w-[80px] h-9 text-xs"
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
            <div className="hidden md:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[100px] py-2.5 pl-4 font-medium text-xs">Date</TableHead>
                    <TableHead className="w-[90px] py-2.5 font-medium text-xs">Sport</TableHead>
                    <TableHead className="w-[80px] py-2.5 font-medium text-xs">Type</TableHead>
                    <TableHead className="py-2.5 font-medium text-xs">Opponent</TableHead>
                    <TableHead className="py-2.5 font-medium text-xs">Origin</TableHead>
                    <TableHead className="w-[120px] py-2.5 font-medium text-xs">Score</TableHead>
                    <TableHead className="w-[70px] py-2.5 font-medium text-xs text-center">Flags</TableHead>
                    <TableHead className="w-[90px] py-2.5 font-medium text-xs text-center pr-4">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMatches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No matches found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMatches.map((match) => (
                      <TableRow key={match.id} className="hover:bg-muted/30">
                        {/* Date */}
                        <TableCell className="py-3 pl-4">
                          <div className="text-sm font-medium">
                            {formatShortDate(match.matchDate)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(match.matchDate).getFullYear()}
                          </div>
                        </TableCell>

                        {/* Sport */}
                        <TableCell className="py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getSportColor(
                              match.sport
                            )}`}
                          >
                            {match.sport || "Unknown"}
                          </span>
                        </TableCell>

                        {/* Type */}
                        <TableCell className="py-3">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            {match.matchType === "doubles" ? (
                              <IconUsers className="size-4" />
                            ) : (
                              <IconUser className="size-4" />
                            )}
                            <span className="capitalize">{match.matchType}</span>
                          </div>
                        </TableCell>

                        {/* Opponent */}
                        <TableCell className="py-3">
                          {match.opponents && match.opponents.length > 0 ? (
                            <div className="flex items-center gap-2">
                              {/* Show avatars for opponents */}
                              <div className="flex -space-x-2">
                                {match.opponents.slice(0, 2).map((opp: OpponentInfo, idx: number) => (
                                  <Avatar key={opp.id || idx} className="size-7 border-2 border-background">
                                    <AvatarImage src={opp.image || undefined} alt={opp.name || "Opponent"} />
                                    <AvatarFallback className="text-[10px] bg-muted">
                                      {opp.name?.charAt(0)?.toUpperCase() || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                              {match.opponents[0]?.id ? (
                                <Link
                                  to="/players/$playerId"
                                  params={{ playerId: match.opponents[0].id }}
                                  className="text-sm font-medium hover:text-primary transition-colors"
                                >
                                  {match.opponentName || match.opponents.map((o: OpponentInfo) => o.name || o.username).filter(Boolean).join(" & ") || "Unknown"}
                                </Link>
                              ) : (
                                <span className="text-sm font-medium">
                                  {match.opponentName || match.opponents.map((o: OpponentInfo) => o.name || o.username).filter(Boolean).join(" & ") || "Unknown"}
                                </span>
                              )}
                            </div>
                          ) : match.opponentName ? (
                            <span className="text-sm font-medium">
                              vs {match.opponentName}
                            </span>
                          ) : match.isFriendly ? (
                            <span className="text-sm text-muted-foreground italic">
                              Open Invite
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">
                              —
                            </span>
                          )}
                        </TableCell>

                        {/* Origin (Division/League or Friendly) */}
                        <TableCell className="py-3">
                          <div className="space-y-1">
                            {match.isFriendly ? (
                              <Badge variant="outline" className="bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800">
                                Friendly
                              </Badge>
                            ) : match.division ? (
                              <div className="text-sm">
                                {match.division.league && (
                                  <Link
                                    to="/league/view/$leagueId"
                                    params={{ leagueId: match.division.league.id }}
                                    className="text-muted-foreground hover:text-primary transition-colors block truncate max-w-[200px]"
                                  >
                                    {match.division.league.name}
                                  </Link>
                                )}
                                <Link
                                  to="/divisions/$divisionId"
                                  params={{ divisionId: match.division.id }}
                                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                                >
                                  {match.division.name}
                                </Link>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground italic">
                                —
                              </span>
                            )}
                            {/* Venue/Location and Duration */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {(match.venue || match.location) && (
                                <span className="flex items-center gap-1 truncate max-w-[120px]">
                                  <IconMapPin className="size-3 flex-shrink-0" />
                                  {match.venue || match.location}
                                </span>
                              )}
                              {match.status === "COMPLETED" && match.duration && (
                                <span className="flex items-center gap-1">
                                  <IconClock className="size-3" />
                                  {formatDuration(match.duration)}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Score */}
                        <TableCell className="py-3">
                          {match.formattedScore ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="font-mono text-sm cursor-help">
                                  {match.formattedScore}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Set scores: {match.formattedScore}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : match.playerScore !== null && match.opponentScore !== null ? (
                            <span className="font-mono text-sm font-medium">
                              {match.playerScore} - {match.opponentScore}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Flags */}
                        <TableCell className="py-3 text-center">
                          {(match.isDisputed || match.isWalkover || match.requiresAdminReview || match.isReportedForAbuse) ? (
                            <div className="flex items-center justify-center gap-1">
                              {match.isDisputed && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <IconAlertTriangle className="size-4 text-yellow-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Disputed</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {match.isWalkover && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <IconWalk className="size-4 text-orange-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Walkover</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {match.requiresAdminReview && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <IconEye className="size-4 text-blue-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Requires Admin Review</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {match.isReportedForAbuse && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <IconFlag className="size-4 text-red-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Reported for Abuse</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3 text-center pr-4">
                          <span
                            className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeStyle(
                              match.status
                            )}`}
                          >
                            {formatStatus(match.status)}
                          </span>
                          {match.status === "COMPLETED" && match.outcome && (
                            <div className="mt-1">
                              <span
                                className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${getOutcomeBadgeStyle(
                                  match.outcome
                                )}`}
                              >
                                {match.outcome}
                              </span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredMatches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No matches found matching your filters.
                </div>
              ) : (
                filteredMatches.map((match) => (
                  <div
                    key={match.id}
                    className="border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors"
                  >
                    {/* Header row with sport badge, type, and status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getSportColor(
                            match.sport
                          )}`}
                        >
                          {match.sport}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          {match.matchType === "doubles" ? (
                            <IconUsers className="size-3" />
                          ) : (
                            <IconUser className="size-3" />
                          )}
                          <span className="capitalize">{match.matchType}</span>
                        </span>
                        {/* Flags */}
                        {(match.isDisputed || match.isWalkover || match.requiresAdminReview || match.isReportedForAbuse) && (
                          <div className="flex items-center gap-0.5">
                            {match.isDisputed && <IconAlertTriangle className="size-3.5 text-yellow-500" />}
                            {match.isWalkover && <IconWalk className="size-3.5 text-orange-500" />}
                            {match.requiresAdminReview && <IconEye className="size-3.5 text-blue-500" />}
                            {match.isReportedForAbuse && <IconFlag className="size-3.5 text-red-500" />}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeStyle(
                            match.status
                          )}`}
                        >
                          {formatStatus(match.status)}
                        </span>
                        {match.status === "COMPLETED" && match.outcome && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${getOutcomeBadgeStyle(
                              match.outcome
                            )}`}
                          >
                            {match.outcome}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Opponent */}
                    <div className="text-sm">
                      {match.opponents && match.opponents.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {match.opponents.slice(0, 2).map((opp: OpponentInfo, idx: number) => (
                              <Avatar key={opp.id || idx} className="size-6 border-2 border-background">
                                <AvatarImage src={opp.image || undefined} alt={opp.name || "Opponent"} />
                                <AvatarFallback className="text-[10px] bg-muted">
                                  {opp.name?.charAt(0)?.toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <span className="font-medium">
                            {match.opponentName || match.opponents.map((o: OpponentInfo) => o.name || o.username).filter(Boolean).join(" & ") || "Unknown"}
                          </span>
                        </div>
                      ) : match.opponentName ? (
                        <span className="font-medium">vs {match.opponentName}</span>
                      ) : match.isFriendly ? (
                        <span className="text-muted-foreground italic">Open Invite</span>
                      ) : (
                        <span className="text-muted-foreground italic">—</span>
                      )}
                    </div>

                    {/* Date and source */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>{formatDate(match.matchDate)}</span>
                        {match.status === "COMPLETED" && match.duration && (
                          <span className="flex items-center gap-0.5">
                            <IconClock className="size-3" />
                            {formatDuration(match.duration)}
                          </span>
                        )}
                      </div>
                      {match.isFriendly ? (
                        <Badge variant="outline" className="text-[10px] h-4 bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800">
                          Friendly
                        </Badge>
                      ) : match.division ? (
                        <span className="truncate max-w-[150px]">
                          {match.division.league?.name || match.division.name}
                        </span>
                      ) : null}
                    </div>

                    {/* Venue/Location */}
                    {(match.venue || match.location) && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <IconMapPin className="size-3" />
                        <span className="truncate">{match.venue || match.location}</span>
                      </div>
                    )}

                    {/* Score */}
                    {(match.formattedScore || (match.playerScore !== null && match.opponentScore !== null)) && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Score</span>
                          <span className="font-mono text-sm font-medium">
                            {match.formattedScore || `${match.playerScore} - ${match.opponentScore}`}
                            {match.isWalkover && (
                              <span className="ml-1 text-xs text-amber-600">(W/O)</span>
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default MatchHistory;
