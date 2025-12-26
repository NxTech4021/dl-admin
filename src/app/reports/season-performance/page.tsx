"use client";

import * as React from "react";
import { Link } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { IconChevronLeft, IconRefresh } from "@tabler/icons-react";
import { Trophy, Swords, Users, CheckCircle } from "lucide-react";
import axiosInstance, { endpoints } from "@/lib/endpoints";

interface DivisionStats {
  id: string;
  name: string;
  players: number;
  matches: number;
  completionRate: number;
}

interface SeasonStats {
  seasonId: string;
  seasonName: string;
  totalMatches: number;
  completedMatches: number;
  completionRate: number;
  totalPlayers: number;
  activeParticipants: number;
  divisions: DivisionStats[];
}

export default function SeasonPerformanceReportPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [seasons, setSeasons] = React.useState<SeasonStats[]>([]);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(endpoints.admin.reports.seasonPerformance);
      if (response.data.success) {
        setSeasons(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch season stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

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
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <Button asChild variant="ghost" size="sm" className="-ml-2">
                          <Link to="/reports">
                            <IconChevronLeft className="mr-1 size-4" />
                            Back to Reports
                          </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                          <Trophy className="size-8 text-primary" />
                          <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                              Season Performance Report
                            </h1>
                            <p className="text-muted-foreground">
                              Season-by-season analysis of league performance
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={fetchData}>
                          <IconRefresh className="mr-2 size-4" />
                          Refresh
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 px-4 lg:px-6 pb-6 space-y-6">
                {isLoading ? (
                  <div className="space-y-6">
                    {[...Array(2)].map((_, i) => (
                      <Card key={i}>
                        <CardHeader>
                          <Skeleton className="h-6 w-48" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : seasons.length > 0 ? (
                  <div className="space-y-6">
                    {seasons.map((season) => (
                      <Card key={season.seasonId}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Trophy className="size-5 text-yellow-500" />
                            {season.seasonName}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Season Summary */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                              <Swords className="size-6 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-2xl font-bold">{season.totalMatches}</p>
                              <p className="text-xs text-muted-foreground">Total Matches</p>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                              <CheckCircle className="size-6 mx-auto mb-2 text-green-500" />
                              <p className="text-2xl font-bold text-green-600">{season.completedMatches}</p>
                              <p className="text-xs text-muted-foreground">Completed</p>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                              <Users className="size-6 mx-auto mb-2 text-blue-500" />
                              <p className="text-2xl font-bold text-blue-600">{season.totalPlayers}</p>
                              <p className="text-xs text-muted-foreground">Total Players</p>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                              <Trophy className="size-6 mx-auto mb-2 text-yellow-500" />
                              <p className="text-2xl font-bold text-yellow-600">{Math.round(season.completionRate)}%</p>
                              <p className="text-xs text-muted-foreground">Completion Rate</p>
                            </div>
                          </div>

                          {/* Division Breakdown */}
                          {season.divisions.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3">Division Breakdown</h4>
                              <div className="space-y-3">
                                {season.divisions.map((div) => (
                                  <div key={div.id} className="p-3 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium">{div.name}</span>
                                      <span className="text-sm text-muted-foreground">{div.players} players</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <div className="flex-1">
                                        <Progress value={div.completionRate} className="h-2" />
                                      </div>
                                      <span className="text-sm font-medium w-16 text-right">{Math.round(div.completionRate)}%</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{div.matches} matches</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12">
                      <div className="text-center">
                        <Trophy className="size-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Season Data</h3>
                        <p className="text-sm text-muted-foreground">
                          No active seasons found to display performance data.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
