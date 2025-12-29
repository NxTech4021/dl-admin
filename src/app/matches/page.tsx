"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { IconTrophy, IconDownload, IconAlertTriangle, IconRefresh, IconChevronLeft, IconChevronRight, IconUsers, IconUser, IconWalk, IconEye, IconClock } from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { MatchStatsCards } from "@/components/match/match-stats-cards";
import { MatchFilters } from "@/components/match/match-filters";
import { MatchRowActions } from "@/components/match/match-row-actions";
import { MatchDetailModal } from "@/components/match/match-detail-modal";
import { VoidMatchModal } from "@/components/match/void-match-modal";
import { WalkoverModal } from "@/components/match/walkover-modal";
import { MessageParticipantsModal } from "@/components/match/message-participants-modal";
import { EditResultModal } from "@/components/match/edit-result-modal";
import { EditParticipantsModal } from "@/components/match/edit-participants-modal";
import { CancellationReviewModal } from "@/components/match/cancellation-review-modal";
import { useMatches } from "@/hooks/use-queries";
import { MatchStatusBadge } from "@/components/match/match-status-badge";
import { MatchParticipantsDisplay } from "@/components/match/match-participants-display";
import { formatTableDate } from "@/components/data-table/constants";
import { Badge } from "@/components/ui/badge";
import { Match, MatchStatus } from "@/constants/zod/match-schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

// Sport color mapping for badges
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

// Format sport name to title case
const formatSport = (sport: string | null | undefined): string => {
  if (!sport) return "Unknown";
  return sport.charAt(0).toUpperCase() + sport.slice(1).toLowerCase();
};

export default function MatchesPage() {
  const [selectedLeague, setSelectedLeague] = useState<string>();
  const [selectedSeason, setSelectedSeason] = useState<string>();
  const [selectedDivision, setSelectedDivision] = useState<string>();
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus>();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDisputedOnly, setShowDisputedOnly] = useState(false);
  const [showLateCancellations, setShowLateCancellations] = useState(false);
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

  const pageSize = 20;
  const { data, isLoading, error, refetch } = useMatches({
    leagueId: selectedLeague,
    seasonId: selectedSeason,
    divisionId: selectedDivision,
    status: selectedStatus,
    search: searchQuery || undefined,
    isDisputed: showDisputedOnly || undefined,
    hasLateCancellation: showLateCancellations || undefined,
    page: currentPage,
    limit: pageSize,
  });

  // Action handlers
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
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
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
            >
              {/* Statistics */}
              <MatchStatsCards
                leagueId={selectedLeague}
                seasonId={selectedSeason}
                divisionId={selectedDivision}
              />

              {/* Filters */}
              <MatchFilters
                selectedLeague={selectedLeague}
                selectedSeason={selectedSeason}
                selectedDivision={selectedDivision}
                selectedStatus={selectedStatus}
                searchQuery={searchQuery}
                showDisputedOnly={showDisputedOnly}
                showLateCancellations={showLateCancellations}
                onLeagueChange={(val) => { setSelectedLeague(val); setCurrentPage(1); }}
                onSeasonChange={(val) => { setSelectedSeason(val); setCurrentPage(1); }}
                onDivisionChange={(val) => { setSelectedDivision(val); setCurrentPage(1); }}
                onStatusChange={(val) => { setSelectedStatus(val); setCurrentPage(1); }}
                onSearchChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
                onDisputedChange={(val) => { setShowDisputedOnly(val); setCurrentPage(1); }}
                onLateCancellationChange={(val) => { setShowLateCancellations(val); setCurrentPage(1); }}
              />
            </PageHeader>

              {/* Matches Table */}
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
                        <Button
                          variant="outline"
                          onClick={() => refetch()}
                          className="gap-2"
                        >
                          <IconRefresh className="size-4" />
                          Retry
                        </Button>
                      </div>
                    ) : data && data.matches.length > 0 ? (
                      <TooltipProvider>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="w-[50px] py-2.5 pl-4 font-medium text-xs">#</TableHead>
                                <TableHead className="w-[100px] py-2.5 font-medium text-xs">Sport</TableHead>
                                <TableHead className="w-[90px] py-2.5 font-medium text-xs">Type</TableHead>
                                <TableHead className="py-2.5 font-medium text-xs">Participants</TableHead>
                                <TableHead className="w-[180px] py-2.5 font-medium text-xs">League / Season</TableHead>
                                <TableHead className="w-[100px] py-2.5 font-medium text-xs">Date</TableHead>
                                <TableHead className="w-[120px] py-2.5 font-medium text-xs">Venue</TableHead>
                                <TableHead className="w-[70px] py-2.5 font-medium text-xs text-center">Flags</TableHead>
                                <TableHead className="w-[100px] py-2.5 font-medium text-xs">Status</TableHead>
                                <TableHead className="w-[80px] py-2.5 font-medium text-xs">Score</TableHead>
                                <TableHead className="w-[50px] py-2.5 pr-4 font-medium text-xs">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {data.matches.map((match, index) => (
                                <TableRow key={match.id} className="hover:bg-muted/30">
                                  {/* Row Number */}
                                  <TableCell className="py-3 pl-4 text-sm text-muted-foreground">
                                    {((currentPage - 1) * pageSize) + index + 1}
                                  </TableCell>

                                  {/* Sport */}
                                  <TableCell className="py-3">
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSportColor(
                                        match.sport
                                      )}`}
                                    >
                                      {formatSport(match.sport)}
                                    </span>
                                  </TableCell>

                                  {/* Type */}
                                  <TableCell className="py-3">
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      {match.matchType === "DOUBLES" ? (
                                        <IconUsers className="size-4" />
                                      ) : (
                                        <IconUser className="size-4" />
                                      )}
                                      <span>
                                        {match.matchType === "DOUBLES"
                                          ? "Doubles"
                                          : "Singles"}
                                      </span>
                                    </div>
                                  </TableCell>

                                  {/* Participants */}
                                  <TableCell className="py-3">
                                    <MatchParticipantsDisplay
                                      participants={match.participants}
                                      matchType={match.matchType}
                                      maxDisplay={4}
                                      variant="stacked"
                                    />
                                  </TableCell>

                                  {/* League / Season */}
                                  <TableCell className="py-3">
                                    {!match.division && !match.leagueId ? (
                                      <Badge
                                        variant="outline"
                                        className="bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800"
                                      >
                                        Friendly
                                      </Badge>
                                    ) : match.division ? (
                                      <div className="space-y-0.5">
                                        {match.division.league && (
                                          <span className="text-sm font-medium block truncate max-w-[160px]">
                                            {match.division.league.name}
                                          </span>
                                        )}
                                        {match.division.season && (
                                          <span className="text-xs text-muted-foreground block truncate max-w-[160px]">
                                            {match.division.season.name}
                                          </span>
                                        )}
                                        <span className="text-xs text-muted-foreground/70 block truncate max-w-[160px]">
                                          {match.division.name}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground text-xs">—</span>
                                    )}
                                  </TableCell>

                                  {/* Date */}
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

                                  {/* Venue */}
                                  <TableCell className="py-3">
                                    <span className="text-sm truncate block max-w-[100px]">
                                      {match.venue || match.location || "TBD"}
                                    </span>
                                  </TableCell>

                                  {/* Flags */}
                                  <TableCell className="py-3 text-center">
                                    {(match.isDisputed || match.isWalkover || match.requiresAdminReview || match.isLateCancellation) ? (
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
                                        {match.isLateCancellation && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <IconClock className="size-4 text-orange-600" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Late Cancellation</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">—</span>
                                    )}
                                  </TableCell>

                                  {/* Status */}
                                  <TableCell className="py-3">
                                    <MatchStatusBadge status={match.status} />
                                  </TableCell>

                                  {/* Score */}
                                  <TableCell className="py-3">
                                    {match.status === "COMPLETED" &&
                                    match.team1Score !== null &&
                                    match.team2Score !== null ? (
                                      <span className="font-mono text-sm font-medium">
                                        {match.team1Score} - {match.team2Score}
                                      </span>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">—</span>
                                    )}
                                  </TableCell>

                                  {/* Actions */}
                                  <TableCell className="py-3 pr-4">
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
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TooltipProvider>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No matches found
                      </div>
                    )}

                    {/* Pagination */}
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
      </SidebarInset>

      {/* Modals */}
      <MatchDetailModal
        match={selectedMatch}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
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
    </SidebarProvider>
  );
}
