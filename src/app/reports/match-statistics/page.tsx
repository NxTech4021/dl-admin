"use client";

import * as React from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangePicker, ExportButton, type ExportColumn, type DateRange } from "@/components/shared";
import {
  IconChevronLeft,
  IconRefresh,
} from "@tabler/icons-react";
import { Swords, CheckCircle, XCircle, Clock, Trophy, Calendar } from "lucide-react";
import axiosInstance, { endpoints } from "@/lib/endpoints";

// Types
interface MatchStatistics {
  totalMatches: number;
  completedMatches: number;
  pendingMatches: number;
  cancelledMatches: number;
  walkoverMatches: number;
  disputedMatches: number;
  averageMatchDuration: number;
  matchesByFormat: { format: string; count: number }[];
  matchesByMonth: { month: string; count: number }[];
}

interface MatchData {
  id: string;
  format: string;
  status: string;
  matchDate: string;
  duration: number | null;
  division: string;
  season: string;
}

export default function MatchStatisticsReportPage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [selectedFormat, setSelectedFormat] = React.useState<string | undefined>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [statistics, setStatistics] = React.useState<MatchStatistics>({
    totalMatches: 0,
    completedMatches: 0,
    pendingMatches: 0,
    cancelledMatches: 0,
    walkoverMatches: 0,
    disputedMatches: 0,
    averageMatchDuration: 0,
    matchesByFormat: [],
    matchesByMonth: [],
  });
  const [matches, setMatches] = React.useState<MatchData[]>([]);

  // Fetch data
  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch match statistics from the admin endpoint
      const params = new URLSearchParams();
      if (dateRange?.from) params.append("startDate", dateRange.from.toISOString());
      if (dateRange?.to) params.append("endDate", dateRange.to.toISOString());
      if (selectedFormat) params.append("format", selectedFormat);

      const [matchesRes, statsRes] = await Promise.all([
        axiosInstance.get(`${endpoints.admin.matches.getAll}?${params.toString()}&limit=100`),
        axiosInstance.get(endpoints.admin.matches.getStats),
      ]);

      if (matchesRes.data.success) {
        const matchesData = matchesRes.data.data.matches || matchesRes.data.data || [];

        const processedMatches: MatchData[] = matchesData.map((match: Record<string, unknown>) => ({
          id: match.id as string,
          format: match.format as string || "Unknown",
          status: match.status as string || "PENDING",
          matchDate: match.matchDate as string || match.createdAt as string,
          duration: match.duration as number | null,
          division: (match.division as { name?: string })?.name || "N/A",
          season: (match.season as { name?: string })?.name || "N/A",
        }));

        setMatches(processedMatches);

        // Calculate statistics from matches
        const completed = processedMatches.filter((m: MatchData) => m.status === "COMPLETED").length;
        const pending = processedMatches.filter((m: MatchData) =>
          m.status === "PENDING" || m.status === "SCHEDULED" || m.status === "IN_PROGRESS"
        ).length;
        const cancelled = processedMatches.filter((m: MatchData) => m.status === "CANCELLED").length;
        const walkover = processedMatches.filter((m: MatchData) => m.status === "WALKOVER").length;
        const disputed = processedMatches.filter((m: MatchData) => m.status === "DISPUTED").length;

        // Calculate average duration for completed matches
        const completedWithDuration = processedMatches.filter(
          (m: MatchData) => m.status === "COMPLETED" && m.duration
        );
        const avgDuration = completedWithDuration.length > 0
          ? Math.round(
              completedWithDuration.reduce((sum: number, m: MatchData) => sum + (m.duration || 0), 0) /
                completedWithDuration.length
            )
          : 0;

        // Group by format
        const formatCounts: Record<string, number> = {};
        processedMatches.forEach((m: MatchData) => {
          formatCounts[m.format] = (formatCounts[m.format] || 0) + 1;
        });

        // Group by month
        const monthCounts: Record<string, number> = {};
        processedMatches.forEach((m: MatchData) => {
          const date = new Date(m.matchDate);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
        });

        setStatistics({
          totalMatches: processedMatches.length,
          completedMatches: completed,
          pendingMatches: pending,
          cancelledMatches: cancelled,
          walkoverMatches: walkover,
          disputedMatches: disputed,
          averageMatchDuration: avgDuration,
          matchesByFormat: Object.entries(formatCounts).map(([format, count]) => ({ format, count })),
          matchesByMonth: Object.entries(monthCounts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, count]) => ({ month, count })),
        });
      }

      // If stats endpoint returned data, merge it
      if (statsRes.data.success && statsRes.data.data) {
        const apiStats = statsRes.data.data;
        setStatistics((prev) => ({
          ...prev,
          ...apiStats,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch match statistics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, selectedFormat]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Export columns
  const exportColumns: ExportColumn<MatchData>[] = [
    { key: "id", header: "Match ID" },
    { key: "format", header: "Format" },
    { key: "status", header: "Status" },
    { key: "matchDate", header: "Date", formatter: (v) => new Date(v as string).toLocaleDateString() },
    { key: "duration", header: "Duration (min)", formatter: (v) => (v as number)?.toString() || "N/A" },
    { key: "division", header: "Division" },
    { key: "season", header: "Season" },
  ];

  const completionRate = statistics.totalMatches > 0
    ? Math.round((statistics.completedMatches / statistics.totalMatches) * 100)
    : 0;

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
                          <Link href="/reports">
                            <IconChevronLeft className="mr-1 size-4" />
                            Back to Reports
                          </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                          <Swords className="size-8 text-primary" />
                          <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                              Match Statistics Report
                            </h1>
                            <p className="text-muted-foreground">
                              Comprehensive overview of match outcomes and performance
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
                          data={matches}
                          columns={exportColumns}
                          filename="match-statistics-report"
                          formats={["csv", "excel"]}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                      <DateRangePicker
                        value={dateRange}
                        onChange={setDateRange}
                        placeholder="Filter by date range"
                      />
                      <Select
                        value={selectedFormat}
                        onValueChange={(val) => setSelectedFormat(val === "all" ? undefined : val)}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Formats</SelectItem>
                          <SelectItem value="SINGLES">Singles</SelectItem>
                          <SelectItem value="DOUBLES">Doubles</SelectItem>
                          <SelectItem value="MIXED_DOUBLES">Mixed Doubles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 px-4 lg:px-6 pb-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Matches</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Swords className="size-5 text-muted-foreground" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold">{statistics.totalMatches}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Completed</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="size-5 text-green-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-green-600">
                              {statistics.completedMatches}
                            </span>
                            <span className="text-sm text-muted-foreground">({completionRate}%)</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Pending</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Clock className="size-5 text-yellow-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold text-yellow-600">
                            {statistics.pendingMatches}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Cancelled</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <XCircle className="size-5 text-red-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold text-red-600">
                            {statistics.cancelledMatches}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Matches by Format */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="size-5" />
                        Matches by Format
                      </CardTitle>
                      <CardDescription>
                        Distribution of matches across different formats
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-8 w-full" />
                          ))}
                        </div>
                      ) : statistics.matchesByFormat.length > 0 ? (
                        <div className="space-y-3">
                          {statistics.matchesByFormat.map((item) => (
                            <div key={item.format} className="flex items-center justify-between">
                              <span className="font-medium">{item.format.replace(/_/g, " ")}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full"
                                    style={{
                                      width: `${(item.count / statistics.totalMatches) * 100}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground w-12 text-right">
                                  {item.count}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No data available</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Matches by Month */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="size-5" />
                        Monthly Trend
                      </CardTitle>
                      <CardDescription>Match volume over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-3">
                          {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-8 w-full" />
                          ))}
                        </div>
                      ) : statistics.matchesByMonth.length > 0 ? (
                        <div className="space-y-2">
                          {statistics.matchesByMonth.slice(-6).map((item) => {
                            const [year, month] = item.month.split("-");
                            const monthName = new Date(Number(year), Number(month) - 1).toLocaleString(
                              "default",
                              { month: "short", year: "numeric" }
                            );
                            const maxCount = Math.max(...statistics.matchesByMonth.map((m) => m.count));
                            return (
                              <div key={item.month} className="flex items-center justify-between">
                                <span className="text-sm">{monthName}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-blue-500 rounded-full"
                                      style={{
                                        width: `${(item.count / maxCount) * 100}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-sm text-muted-foreground w-12 text-right">
                                    {item.count}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No data available</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold">
                          {isLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : statistics.walkoverMatches}
                        </div>
                        <div className="text-sm text-muted-foreground">Walkovers</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold">
                          {isLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : statistics.disputedMatches}
                        </div>
                        <div className="text-sm text-muted-foreground">Disputed</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold">
                          {isLoading ? (
                            <Skeleton className="h-8 w-16 mx-auto" />
                          ) : (
                            `${statistics.averageMatchDuration}m`
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg. Duration</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold">
                          {isLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : `${completionRate}%`}
                        </div>
                        <div className="text-sm text-muted-foreground">Completion Rate</div>
                      </div>
                    </div>
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
