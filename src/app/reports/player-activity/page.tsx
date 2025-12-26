"use client";

import * as React from "react";
import { Link } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangePicker, ExportButton, type ExportColumn, type DateRange } from "@/components/shared";
import {
  IconChevronLeft,
  IconRefresh,
  IconUsers,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
} from "@tabler/icons-react";
import { Users, Activity, UserCheck, UserX } from "lucide-react";
import axiosInstance, { endpoints } from "@/lib/endpoints";

// Types
interface PlayerActivityData {
  id: string;
  name: string;
  email: string;
  status: string;
  matchesPlayed: number;
  matchesWon: number;
  lastActive: string;
  joinedAt: string;
  activityTrend: "up" | "down" | "stable";
}

interface ActivitySummary {
  totalPlayers: number;
  activePlayers: number;
  inactivePlayers: number;
  newPlayersThisMonth: number;
  averageMatchesPerPlayer: number;
}

export default function PlayerActivityReportPage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [summary, setSummary] = React.useState<ActivitySummary>({
    totalPlayers: 0,
    activePlayers: 0,
    inactivePlayers: 0,
    newPlayersThisMonth: 0,
    averageMatchesPerPlayer: 0,
  });
  const [players, setPlayers] = React.useState<PlayerActivityData[]>([]);

  // Fetch data
  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch player statistics from admin endpoint for more detailed data
      const response = await axiosInstance.get(endpoints.admin.players.getAll, {
        params: {
          limit: 100,
          ...(dateRange?.from && { startDate: dateRange.from.toISOString() }),
          ...(dateRange?.to && { endDate: dateRange.to.toISOString() }),
        },
      });

      if (response.data.success) {
        const playersData = response.data.data.players || response.data.data || [];

        // Process player data
        const processedPlayers: PlayerActivityData[] = playersData.map((player: Record<string, unknown>) => ({
          id: player.id as string,
          name: player.name as string || "Unknown",
          email: player.email as string || "",
          status: player.status as string || "ACTIVE",
          matchesPlayed: (player._count as { matchParticipants?: number })?.matchParticipants || 0,
          matchesWon: 0, // Would need additional calculation
          lastActive: player.lastLogin as string || player.lastActivityCheck as string || player.createdAt as string,
          joinedAt: player.createdAt as string,
          activityTrend: "stable" as const,
        }));

        setPlayers(processedPlayers);

        // Calculate summary
        const activeCount = processedPlayers.filter((p: PlayerActivityData) => p.status === "ACTIVE").length;
        const inactiveCount = processedPlayers.filter((p: PlayerActivityData) =>
          p.status === "INACTIVE" || p.status === "SUSPENDED"
        ).length;

        const now = new Date();
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const newThisMonth = processedPlayers.filter((p: PlayerActivityData) =>
          new Date(p.joinedAt) >= monthAgo
        ).length;

        const totalMatches = processedPlayers.reduce((sum: number, p: PlayerActivityData) => sum + p.matchesPlayed, 0);

        setSummary({
          totalPlayers: processedPlayers.length,
          activePlayers: activeCount,
          inactivePlayers: inactiveCount,
          newPlayersThisMonth: newThisMonth,
          averageMatchesPerPlayer: processedPlayers.length > 0
            ? Math.round((totalMatches / processedPlayers.length) * 10) / 10
            : 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch player activity data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <IconTrendingUp className="size-4 text-green-500" />;
      case "down":
        return <IconTrendingDown className="size-4 text-red-500" />;
      default:
        return <IconMinus className="size-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      ACTIVE: { variant: "default", className: "bg-green-600" },
      INACTIVE: { variant: "secondary" },
      SUSPENDED: { variant: "outline", className: "text-yellow-600 border-yellow-600" },
      BANNED: { variant: "destructive" },
      DELETED: { variant: "outline", className: "text-gray-500 border-gray-500" },
    };
    const config = variants[status] || { variant: "secondary" };
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  // Export columns
  const exportColumns: ExportColumn<PlayerActivityData>[] = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "status", header: "Status" },
    { key: "matchesPlayed", header: "Matches Played" },
    { key: "lastActive", header: "Last Active", formatter: (v) => formatDate(v as string) },
    { key: "joinedAt", header: "Joined", formatter: (v) => formatDate(v as string) },
  ];

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
                    {/* Breadcrumb & Title */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <Button asChild variant="ghost" size="sm" className="-ml-2">
                          <Link to="/reports">
                            <IconChevronLeft className="mr-1 size-4" />
                            Back to Reports
                          </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                          <IconUsers className="size-8 text-primary" />
                          <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                              Player Activity Report
                            </h1>
                            <p className="text-muted-foreground">
                              Track player engagement and activity trends
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={fetchData}>
                          <IconRefresh className="mr-2 size-4" />
                          Refresh
                        </Button>
                        <ExportButton
                          data={players}
                          columns={exportColumns}
                          filename="player-activity-report"
                          formats={["csv", "excel"]}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-3">
                      <DateRangePicker
                        value={dateRange}
                        onChange={setDateRange}
                        placeholder="Filter by date range"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 px-4 lg:px-6 pb-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Players</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Users className="size-5 text-muted-foreground" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold">{summary.totalPlayers}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Active Players</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <UserCheck className="size-5 text-green-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold text-green-600">{summary.activePlayers}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Inactive Players</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <UserX className="size-5 text-yellow-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold text-yellow-600">{summary.inactivePlayers}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>New This Month</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <IconTrendingUp className="size-5 text-blue-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold text-blue-600">+{summary.newPlayersThisMonth}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Avg. Matches/Player</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Activity className="size-5 text-purple-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold text-purple-600">{summary.averageMatchesPerPlayer}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Player Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Player Activity Details</CardTitle>
                    <CardDescription>
                      Detailed view of individual player activity and engagement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[...Array(10)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : players.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Player</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Matches</TableHead>
                            <TableHead>Last Active</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Trend</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {players.slice(0, 50).map((player) => (
                            <TableRow key={player.id}>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{player.name}</span>
                                  <span className="text-xs text-muted-foreground">{player.email}</span>
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(player.status)}</TableCell>
                              <TableCell className="text-right font-medium">
                                {player.matchesPlayed}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(player.lastActive)}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(player.joinedAt)}
                              </TableCell>
                              <TableCell>{getTrendIcon(player.activityTrend)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-12">
                        <Users className="size-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Player Data</h3>
                        <p className="text-sm text-muted-foreground">
                          No player activity data found for the selected period.
                        </p>
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
