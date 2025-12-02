"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { IconTrophy, IconDownload, IconAlertTriangle, IconRefresh, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";
import { MatchStatsCards } from "@/components/match/match-stats-cards";
import { MatchFilters } from "@/components/match/match-filters";
import { MatchRowActions } from "@/components/match/match-row-actions";
import { MatchDetailModal } from "@/components/match/match-detail-modal";
import { VoidMatchModal } from "@/components/match/void-match-modal";
import { WalkoverModal } from "@/components/match/walkover-modal";
import { MessageParticipantsModal } from "@/components/match/message-participants-modal";
import { EditResultModal } from "@/components/match/edit-result-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function MatchesPage() {
  const [selectedLeague, setSelectedLeague] = useState<string>();
  const [selectedSeason, setSelectedSeason] = useState<string>();
  const [selectedDivision, setSelectedDivision] = useState<string>();
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus>();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDisputedOnly, setShowDisputedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [walkoverModalOpen, setWalkoverModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);

  const pageSize = 20;
  const { data, isLoading, error, refetch } = useMatches({
    leagueId: selectedLeague,
    seasonId: selectedSeason,
    divisionId: selectedDivision,
    status: selectedStatus,
    search: searchQuery || undefined,
    isDisputed: showDisputedOnly || undefined,
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
            <div className="flex flex-col gap-6">
              {/* Page Header */}
              <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-4 lg:px-6 py-6">
                  <div className="flex flex-col gap-6">
                    {/* Title and Actions */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <IconTrophy className="size-8 text-primary" />
                          <h1 className="text-3xl font-bold tracking-tight">
                            Matches Dashboard
                          </h1>
                        </div>
                        <p className="text-muted-foreground">
                          Manage and oversee all matches across the season
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <IconDownload className="mr-2 size-4" />
                          Export
                        </Button>
                      </div>
                    </div>

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
                      onLeagueChange={(val) => { setSelectedLeague(val); setCurrentPage(1); }}
                      onSeasonChange={(val) => { setSelectedSeason(val); setCurrentPage(1); }}
                      onDivisionChange={(val) => { setSelectedDivision(val); setCurrentPage(1); }}
                      onStatusChange={(val) => { setSelectedStatus(val); setCurrentPage(1); }}
                      onSearchChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
                      onDisputedChange={(val) => { setShowDisputedOnly(val); setCurrentPage(1); }}
                    />
                  </div>
                </div>
              </div>

              {/* Matches Table */}
              <div className="flex-1 px-4 lg:px-6 pb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Matches</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Match ID</TableHead>
                            <TableHead>Participants</TableHead>
                            <TableHead>Division</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Venue</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead className="w-[50px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.matches.map((match) => (
                            <TableRow key={match.id}>
                              <TableCell className="font-mono text-xs">
                                {match.id.slice(0, 8)}
                              </TableCell>
                              <TableCell>
                                <MatchParticipantsDisplay
                                  participants={match.participants}
                                  matchType={match.matchType}
                                  maxDisplay={4}
                                />
                              </TableCell>
                              <TableCell>
                                {match.division ? (
                                  <div className="flex flex-col">
                                    <span className="font-medium text-sm">
                                      {match.division.name}
                                    </span>
                                    {match.division.season && (
                                      <span className="text-xs text-muted-foreground">
                                        {match.division.season.name}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-xs">
                                    No division
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {formatTableDate(match.matchDate)}
                              </TableCell>
                              <TableCell>
                                {match.venue || match.location || "TBD"}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <MatchStatusBadge status={match.status} />
                                  {match.isDisputed && (
                                    <Badge
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      Disputed
                                    </Badge>
                                  )}
                                  {match.isWalkover && (
                                    <Badge variant="outline" className="text-xs">
                                      Walkover
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {match.status === "COMPLETED" &&
                                match.team1Score !== null &&
                                match.team2Score !== null ? (
                                  <span className="font-mono">
                                    {match.team1Score} - {match.team2Score}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground text-xs">
                                    -
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <MatchRowActions
                                  match={match}
                                  onView={handleView}
                                  onEdit={handleEdit}
                                  onVoid={handleVoid}
                                  onConvertToWalkover={handleConvertToWalkover}
                                  onMessage={handleMessage}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Modals */}
      <MatchDetailModal
        match={selectedMatch}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
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
    </SidebarProvider>
  );
}
