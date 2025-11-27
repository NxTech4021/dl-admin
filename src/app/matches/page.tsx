"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { IconTrophy, IconDownload } from "@tabler/icons-react";
import { useState } from "react";
import { MatchStatsCards } from "@/components/match/match-stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMatches } from "@/hooks/use-queries";
import { MatchStatusBadge } from "@/components/match/match-status-badge";
import { MatchParticipantsDisplay } from "@/components/match/match-participants-display";
import { formatTableDate } from "@/components/data-table/constants";
import { Badge } from "@/components/ui/badge";
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

  const { data, isLoading } = useMatches({
    leagueId: selectedLeague,
    seasonId: selectedSeason,
    divisionId: selectedDivision,
    limit: 20,
  });

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
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No matches found
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
