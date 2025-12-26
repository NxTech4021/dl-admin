"use client";

import * as React from "react";
import { Link } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangePicker, ExportButton, type ExportColumn, type DateRange } from "@/components/shared";
import { IconChevronLeft, IconRefresh } from "@tabler/icons-react";
import { TrendingUp, Users, UserCheck, UserX, Activity } from "lucide-react";
import axiosInstance, { endpoints } from "@/lib/endpoints";

interface RetentionStats {
  totalPlayers: number;
  activePlayers: number;
  inactivePlayers: number;
  churned: number;
  retentionRate: number;
  retentionByMonth: { month: string; retained: number; churned: number; rate: number }[];
  engagementTiers: { tier: string; count: number; percentage: number }[];
}

export default function PlayerRetentionReportPage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [stats, setStats] = React.useState<RetentionStats>({
    totalPlayers: 0,
    activePlayers: 0,
    inactivePlayers: 0,
    churned: 0,
    retentionRate: 0,
    retentionByMonth: [],
    engagementTiers: [],
  });

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange?.from) params.append("startDate", dateRange.from.toISOString());
      if (dateRange?.to) params.append("endDate", dateRange.to.toISOString());

      const response = await axiosInstance.get(`${endpoints.admin.reports.playerRetention}?${params.toString()}`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch retention stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const exportColumns: ExportColumn<{ month: string; retained: number; churned: number; rate: number }>[] = [
    { key: "month", header: "Month" },
    { key: "retained", header: "Retained" },
    { key: "churned", header: "Churned" },
    { key: "rate", header: "Retention Rate (%)" },
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
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <Button asChild variant="ghost" size="sm" className="-ml-2">
                          <Link to="/reports">
                            <IconChevronLeft className="mr-1 size-4" />
                            Back to Reports
                          </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                          <TrendingUp className="size-8 text-primary" />
                          <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                              Player Retention Report
                            </h1>
                            <p className="text-muted-foreground">
                              Analyze player retention rates and engagement metrics
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
                          data={stats.retentionByMonth}
                          columns={exportColumns}
                          filename="player-retention-report"
                          formats={["csv", "excel"]}
                          size="sm"
                        />
                      </div>
                    </div>

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
                          <span className="text-2xl font-bold">{stats.totalPlayers}</span>
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
                          <span className="text-2xl font-bold text-green-600">{stats.activePlayers}</span>
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
                        <Activity className="size-5 text-yellow-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold text-yellow-600">{stats.inactivePlayers}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Churned</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <UserX className="size-5 text-red-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold text-red-600">{stats.churned}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Retention Rate</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="size-5 text-blue-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold text-blue-600">{stats.retentionRate}%</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Engagement Tiers */}
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Tiers</CardTitle>
                    <CardDescription>Player distribution by engagement level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : stats.engagementTiers.length > 0 ? (
                      <div className="space-y-4">
                        {stats.engagementTiers.map((tier) => (
                          <div key={tier.tier} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div>
                              <p className="font-medium">{tier.tier}</p>
                              <p className="text-sm text-muted-foreground">{tier.count} players</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">{Math.round(tier.percentage)}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No engagement data available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Monthly Retention Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Retention Trend</CardTitle>
                    <CardDescription>Retention and churn by month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                          <Skeleton key={i} className="h-8 w-full" />
                        ))}
                      </div>
                    ) : stats.retentionByMonth.length > 0 ? (
                      <div className="space-y-3">
                        {stats.retentionByMonth.map((item) => {
                          const [year, month] = item.month.split("-");
                          const monthName = new Date(Number(year), Number(month) - 1).toLocaleString("default", { month: "short", year: "numeric" });
                          return (
                            <div key={item.month} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                              <span className="text-sm w-24 font-medium">{monthName}</span>
                              <div className="flex-1 flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Retained:</span>
                                  <span className="text-sm font-medium text-green-600">{item.retained}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Churned:</span>
                                  <span className="text-sm font-medium text-red-600">{item.churned}</span>
                                </div>
                              </div>
                              <span className="text-sm font-bold">{item.rate}%</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No retention data available</p>
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
