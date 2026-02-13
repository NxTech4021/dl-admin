import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  IconTrophy,
  IconDownload,
  IconAlertTriangle,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconUsers,
  IconUser,
  IconWalk,
  IconEye,
  IconClock,
  IconHeartHandshake,
} from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useMemo, useEffect, useRef } from "react";
import { MatchStatsCards } from "@/components/match/match-stats-cards";
import { MatchFilters, type Sport, type MatchFlagType } from "@/components/match/match-filters";
import { MatchRowActions } from "@/components/match/match-row-actions";
import { MatchDetailModal } from "@/components/match/match-detail-modal";
import { VoidMatchModal } from "@/components/match/void-match-modal";
import { WalkoverModal } from "@/components/match/walkover-modal";
import { MessageParticipantsModal } from "@/components/match/message-participants-modal";
import { EditResultModal } from "@/components/match/edit-result-modal";
import { EditParticipantsModal } from "@/components/match/edit-participants-modal";
import { CancellationReviewModal } from "@/components/match/cancellation-review-modal";
import { useMatches, useMatch } from "@/hooks/queries";
import { MatchStatusBadge } from "@/components/match/match-status-badge";
import { MatchParticipantsDisplay } from "@/components/match/match-participants-display";
import { Badge } from "@/components/ui/badge";
import { Match, MatchStatus } from "@/constants/zod/match-schema";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AnimatedFilterBar,
  AnimatedEmptyState,
} from "@/components/ui/animated-container";
import {
  tableContainerVariants,
  tableRowVariants,
  fastTransition,
} from "@/lib/animation-variants";
import { cn } from "@/lib/utils";

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

const formatSport = (sport: string | null | undefined): string => {
  if (!sport) return "Unknown";
  return sport.charAt(0).toUpperCase() + sport.slice(1).toLowerCase();
};

export const Route = createFileRoute("/_authenticated/matches/")({
  component: MatchesPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: (search.id as string) || undefined,
    };
  },
});

function MatchesPage() {
  // URL search params for deep linking - use Route.useSearch() for reliability
  const { id: matchIdFromUrl } = Route.useSearch();
  const navigate = useNavigate();

  // Track which match ID we've already opened the modal for (prevents re-opening)
  const openedForMatchIdRef = useRef<string | null>(null);

  // Tab state
  type MatchTab = "league" | "friendly";
  const [activeTab, setActiveTab] = useState<MatchTab>("league");

  // Filter states
  const [selectedSport, setSelectedSport] = useState<Sport>();
  const [selectedLeague, setSelectedLeague] = useState<string>();
  const [selectedSeason, setSelectedSeason] = useState<string>();
  const [selectedDivision, setSelectedDivision] = useState<string>();
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus>();
  const [selectedFlag, setSelectedFlag] = useState<MatchFlagType>();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editParticipantsModalOpen, setEditParticipantsModalOpen] = useState(false);
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [walkoverModalOpen, setWalkoverModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [cancellationReviewModalOpen, setCancellationReviewModalOpen] = useState(false);

  // Fetch match by ID from URL param (for deep linking)
  const {
    data: matchFromUrl,
    isSuccess: matchFromUrlLoaded,
    isFetching: matchFromUrlFetching,
  } = useMatch(matchIdFromUrl ?? "");

  // Auto-open modal when match is loaded from URL
  useEffect(() => {
    // Only open if:
    // 1. We have a matchId from URL
    // 2. Query succeeded and we have data
    // 3. We haven't already opened the modal for this matchId
    if (
      matchIdFromUrl &&
      matchFromUrlLoaded &&
      matchFromUrl &&
      !matchFromUrlFetching &&
      openedForMatchIdRef.current !== matchIdFromUrl
    ) {
      openedForMatchIdRef.current = matchIdFromUrl;
      setSelectedMatch(matchFromUrl);
      setViewModalOpen(true);
    }
  }, [matchIdFromUrl, matchFromUrlLoaded, matchFromUrl, matchFromUrlFetching]);

  // Clear URL param when modal is closed
  const handleViewModalClose = (open: boolean) => {
    setViewModalOpen(open);
    if (!open && matchIdFromUrl) {
      // Reset the ref so we can re-open for the same match if navigated back
      openedForMatchIdRef.current = null;
      navigate({ to: "/matches", search: { id: undefined } });
    }
  };

  const pageSize = 20;

  // Main query - use matchContext for server-side filtering
  const { data, isLoading, error, refetch } = useMatches({
    sport: selectedSport,
    leagueId: activeTab === "league" ? selectedLeague : undefined,
    seasonId: activeTab === "league" ? selectedSeason : undefined,
    divisionId: activeTab === "league" ? selectedDivision : undefined,
    matchContext: activeTab,
    status: selectedStatus,
    search: searchQuery || undefined,
    isDisputed: selectedFlag === "disputed" || undefined,
    hasLateCancellation: selectedFlag === "lateCancellation" || undefined,
    isWalkover: selectedFlag === "walkover" || undefined,
    requiresAdminReview: selectedFlag === "requiresReview" || undefined,
    page: currentPage,
    limit: pageSize,
  });

  // Separate count queries for tab badges (lightweight - just need totals)
  const { data: leagueCountData } = useMatches({
    matchContext: "league",
    page: 1,
    limit: 1,
  });

  const { data: friendlyCountData } = useMatches({
    matchContext: "friendly",
    page: 1,
    limit: 1,
  });

  // Get matches with client-side sport filtering (backend may not support sport filter)
  const filteredMatches = useMemo(() => {
    let matches = data?.matches ?? [];

    // Client-side sport filtering as fallback
    if (selectedSport) {
      matches = matches.filter((m) =>
        m.sport?.toUpperCase() === selectedSport.toUpperCase()
      );
    }

    return matches;
  }, [data?.matches, selectedSport]);

  // Tab counts from separate queries
  const tabCounts = useMemo(() => ({
    league: leagueCountData?.total ?? 0,
    friendly: friendlyCountData?.total ?? 0,
  }), [leagueCountData?.total, friendlyCountData?.total]);

  const handleTabChange = (tab: MatchTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    // Reset tab-specific filters
    if (tab === "friendly") {
      setSelectedLeague(undefined);
      setSelectedSeason(undefined);
      setSelectedDivision(undefined);
    }
  };

  const handleView = (match: Match) => {
    setSelectedMatch(match);
    setViewModalOpen(true);
  };

  const handleEdit = (match: Match) => {
    setSelectedMatch(match);
    setEditModalOpen(true);
  };

  const handleEditParticipants = (match: Match) => {
    setSelectedMatch(match);
    setEditParticipantsModalOpen(true);
  };

  const handleVoid = (match: Match) => {
    setSelectedMatch(match);
    setVoidModalOpen(true);
  };

  const handleConvertToWalkover = (match: Match) => {
    setSelectedMatch(match);
    setWalkoverModalOpen(true);
  };

  const handleMessage = (match: Match) => {
    setSelectedMatch(match);
    setMessageModalOpen(true);
  };

  const handleReviewCancellation = (match: Match) => {
    setSelectedMatch(match);
    setCancellationReviewModalOpen(true);
  };

  const handleActionSuccess = () => {
    refetch();
  };

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <PageHeader
            icon={IconTrophy}
            title="Matches Dashboard"
            description="Manage and oversee all matches across the season"
            actions={
              <Button variant="outline" size="sm">
                <IconDownload className="mr-2 size-4" />
                Export
              </Button>
            }
            containerClassName="pb-4 sm:pb-5 md:pb-5"
            childrenContainerClassName="gap-3 sm:gap-4 md:gap-4"
          >
            <MatchStatsCards
              leagueId={selectedLeague}
              seasonId={selectedSeason}
              divisionId={selectedDivision}
              leagueMatchCount={tabCounts.league}
              friendlyMatchCount={tabCounts.friendly}
            />

            {/* Tab Switcher + Filters */}
            <AnimatedFilterBar>
              <div className="flex items-center gap-2 w-full">
                {/* Tab Switcher - Notification Style */}
                <div className="inline-flex items-center rounded-md bg-muted/60 p-0.5 border border-border/50 shrink-0">
                  <button
                    onClick={() => handleTabChange("league")}
                    className={cn(
                      "inline-flex items-center justify-center rounded px-3 py-1.5 text-xs font-medium transition-all cursor-pointer gap-1.5",
                      activeTab === "league"
                        ? "bg-background text-foreground shadow-sm border border-border/50"
                        : "text-foreground/70 hover:text-foreground"
                    )}
                  >
                    <IconTrophy className="size-3.5" />
                    League
                    <span className={cn(
                      "text-[10px] font-medium tabular-nums",
                      activeTab === "league" ? "text-foreground/70" : "text-foreground/50"
                    )}>
                      {tabCounts.league}
                    </span>
                  </button>
                  <button
                    onClick={() => handleTabChange("friendly")}
                    className={cn(
                      "inline-flex items-center justify-center rounded px-3 py-1.5 text-xs font-medium transition-all cursor-pointer gap-1.5",
                      activeTab === "friendly"
                        ? "bg-background text-foreground shadow-sm border border-border/50"
                        : "text-foreground/70 hover:text-foreground"
                    )}
                  >
                    <IconHeartHandshake className="size-3.5" />
                    Friendly
                    {tabCounts.friendly > 0 && (
                      <span className={cn(
                        "inline-flex items-center justify-center h-4 min-w-4 px-1 text-[10px] font-semibold rounded-full tabular-nums",
                        activeTab === "friendly"
                          ? "bg-pink-500/15 text-pink-600 dark:text-pink-400"
                          : "bg-pink-500/10 text-pink-600/70 dark:text-pink-400/70"
                      )}>
                        {tabCounts.friendly}
                      </span>
                    )}
                  </button>
                </div>

                {/* Filters */}
                <div className="flex-1">
                  <MatchFilters
                    selectedSport={selectedSport}
                    selectedLeague={activeTab === "league" ? selectedLeague : undefined}
                    selectedSeason={activeTab === "league" ? selectedSeason : undefined}
                    selectedDivision={activeTab === "league" ? selectedDivision : undefined}
                    selectedStatus={selectedStatus}
                    selectedFlag={selectedFlag}
                    searchQuery={searchQuery}
                    onSportChange={(val) => { setSelectedSport(val); setCurrentPage(1); }}
                    onLeagueChange={(val) => { setSelectedLeague(val); setCurrentPage(1); }}
                    onSeasonChange={(val) => { setSelectedSeason(val); setCurrentPage(1); }}
                    onDivisionChange={(val) => { setSelectedDivision(val); setCurrentPage(1); }}
                    onStatusChange={(val) => { setSelectedStatus(val); setCurrentPage(1); }}
                    onFlagChange={(val) => { setSelectedFlag(val); setCurrentPage(1); }}
                    onSearchChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
                  />
                </div>

                {/* Refresh Button */}
                <Button variant="outline" size="sm" onClick={() => refetch()} className="cursor-pointer shrink-0">
                  <IconRefresh className="mr-2 size-4" />
                  Refresh
                </Button>
              </div>
            </AnimatedFilterBar>
          </PageHeader>

          <div className="flex-1 px-4 lg:px-6 pb-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <IconAlertTriangle className="size-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to Load Matches</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  There was an error loading the matches data. Please try again.
                </p>
                <Button variant="outline" onClick={() => refetch()} className="gap-2">
                  <IconRefresh className="size-4" />
                  Retry
                </Button>
              </div>
            ) : filteredMatches.length > 0 ? (
              <TooltipProvider>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-[40px] py-2.5 pl-4 font-medium text-xs">#</TableHead>
                        <TableHead className="w-[95px] py-2.5 font-medium text-xs">Sport</TableHead>
                        <TableHead className="w-[85px] py-2.5 font-medium text-xs">Type</TableHead>
                        <TableHead className="w-[180px] py-2.5 font-medium text-xs">Participants</TableHead>
                        <TableHead className="w-[240px] py-2.5 font-medium text-xs">League / Season</TableHead>
                        <TableHead className="w-[85px] py-2.5 font-medium text-xs">Date</TableHead>
                        <TableHead className="w-[110px] py-2.5 font-medium text-xs">Venue</TableHead>
                        <TableHead className="w-[70px] py-2.5 font-medium text-xs text-center">Flags</TableHead>
                        <TableHead className="w-[100px] py-2.5 font-medium text-xs">Status</TableHead>
                        <TableHead className="w-[80px] py-2.5 font-medium text-xs">Score</TableHead>
                        <TableHead className="w-[50px] py-2.5 pr-4 font-medium text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <motion.tbody
                      key={`${activeTab}-${selectedSport || ''}-${selectedStatus || ''}-${selectedFlag || ''}-${selectedLeague || ''}-${selectedSeason || ''}-${selectedDivision || ''}-${searchQuery}`}
                      initial="hidden"
                      animate="visible"
                      variants={tableContainerVariants}
                    >
                      {filteredMatches.map((match, index) => (
                        <motion.tr
                          key={match.id}
                          variants={tableRowVariants}
                          transition={fastTransition}
                          className="border-b transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted cursor-pointer"
                          onClick={() => handleView(match)}
                        >
                          <TableCell className="py-3 pl-4 text-sm text-muted-foreground">
                            {((currentPage - 1) * pageSize) + index + 1}
                          </TableCell>

                          <TableCell className="py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSportColor(match.sport)}`}>
                              {formatSport(match.sport)}
                            </span>
                          </TableCell>

                          <TableCell className="py-3">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              {match.matchType === "DOUBLES" ? (
                                <IconUsers className="size-4" />
                              ) : (
                                <IconUser className="size-4" />
                              )}
                              <span>
                                {match.matchType === "DOUBLES" ? "Doubles" : "Singles"}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="py-3">
                            <MatchParticipantsDisplay
                              participants={match.participants}
                              matchType={match.matchType}
                              maxDisplay={4}
                              variant="stacked"
                            />
                          </TableCell>

                          <TableCell className="py-3">
                            {!match.division && !match.leagueId ? (
                              <Badge variant="outline" className="bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800">
                                Friendly
                              </Badge>
                            ) : match.division ? (
                              <div className="space-y-0.5">
                                {match.division.league && (
                                  <span className="text-sm font-medium block">
                                    {match.division.league.name}
                                  </span>
                                )}
                                {match.division.season && (
                                  <span className="text-xs text-muted-foreground block">
                                    {match.division.season.name}
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground/70 block">
                                  {match.division.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>

                          <TableCell className="py-3">
                            <div className="text-sm font-medium">
                              {new Date(match.matchDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(match.matchDate).getFullYear()}
                            </div>
                          </TableCell>

                          <TableCell className="py-3">
                            <span className="text-sm truncate block max-w-[100px]">
                              {match.venue || match.location || "TBD"}
                            </span>
                          </TableCell>

                          <TableCell className="py-3 text-center">
                            {(match.isDisputed || match.isWalkover || match.requiresAdminReview || match.isLateCancellation) ? (
                              <div className="flex items-center justify-center gap-1">
                                {match.isDisputed && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <IconAlertTriangle className="size-4 text-yellow-500" />
                                    </TooltipTrigger>
                                    <TooltipContent><p>Disputed</p></TooltipContent>
                                  </Tooltip>
                                )}
                                {match.isWalkover && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <IconWalk className="size-4 text-orange-500" />
                                    </TooltipTrigger>
                                    <TooltipContent><p>Walkover</p></TooltipContent>
                                  </Tooltip>
                                )}
                                {match.requiresAdminReview && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <IconEye className="size-4 text-blue-500" />
                                    </TooltipTrigger>
                                    <TooltipContent><p>Requires Admin Review</p></TooltipContent>
                                  </Tooltip>
                                )}
                                {match.isLateCancellation && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <IconClock className="size-4 text-orange-600" />
                                    </TooltipTrigger>
                                    <TooltipContent><p>Late Cancellation</p></TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>

                          <TableCell className="py-3">
                            <MatchStatusBadge status={match.status} />
                          </TableCell>

                          <TableCell className="py-3">
                            {match.status === "COMPLETED" && match.team1Score !== null && match.team2Score !== null ? (
                              <span className="font-mono text-sm font-medium">
                                {match.team1Score} - {match.team2Score}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>

                          <TableCell className="py-3 pr-4" onClick={(e) => e.stopPropagation()}>
                            <MatchRowActions
                              match={match}
                              onView={handleView}
                              onEdit={handleEdit}
                              onEditParticipants={handleEditParticipants}
                              onVoid={handleVoid}
                              onConvertToWalkover={handleConvertToWalkover}
                              onMessage={handleMessage}
                              onReviewCancellation={handleReviewCancellation}
                            />
                          </TableCell>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </Table>
                </div>
              </TooltipProvider>
            ) : (
              <AnimatedEmptyState>
                <div className="text-center py-8 text-muted-foreground">
                  {activeTab === "friendly"
                    ? "No friendly matches found"
                    : "No league matches found"}
                </div>
              </AnimatedEmptyState>
            )}

            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1} to{" "}
                  {Math.min(currentPage * pageSize, data.total)} of {data.total} matches
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <IconChevronLeft className="size-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (data.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= data.totalPages - 2) {
                        pageNum = data.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={currentPage === data.totalPages}
                  >
                    Next
                    <IconChevronRight className="size-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <MatchDetailModal
        match={selectedMatch}
        open={viewModalOpen}
        onOpenChange={handleViewModalClose}
        onEdit={handleEdit}
        onVoid={handleVoid}
        onMessage={handleMessage}
        onEditParticipants={handleEditParticipants}
      />

      <EditResultModal
        match={selectedMatch}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={handleActionSuccess}
      />

      <VoidMatchModal
        match={selectedMatch}
        open={voidModalOpen}
        onOpenChange={setVoidModalOpen}
        onSuccess={handleActionSuccess}
      />

      <WalkoverModal
        match={selectedMatch}
        open={walkoverModalOpen}
        onOpenChange={setWalkoverModalOpen}
        onSuccess={handleActionSuccess}
      />

      <MessageParticipantsModal
        match={selectedMatch}
        open={messageModalOpen}
        onOpenChange={setMessageModalOpen}
        onSuccess={handleActionSuccess}
      />

      <EditParticipantsModal
        match={selectedMatch}
        open={editParticipantsModalOpen}
        onOpenChange={setEditParticipantsModalOpen}
        onSuccess={handleActionSuccess}
      />

      <CancellationReviewModal
        match={selectedMatch}
        open={cancellationReviewModalOpen}
        onOpenChange={setCancellationReviewModalOpen}
        onSuccess={handleActionSuccess}
      />
    </>
  );
}
