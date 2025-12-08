"use client";

import * as React from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker, ExportButton, type ExportColumn, type DateRange } from "@/components/shared";
import { IconChevronLeft, IconRefresh } from "@tabler/icons-react";
import { AlertTriangle, CheckCircle, Clock, AlertCircle } from "lucide-react";
import axiosInstance, { endpoints } from "@/lib/endpoints";

interface DisputeStats {
  totalDisputes: number;
  openDisputes: number;
  resolvedDisputes: number;
  averageResolutionTime: number;
  disputesByCategory: { category: string; count: number }[];
  disputesByMonth: { month: string; count: number; resolved: number }[];
  resolutionOutcomes: { outcome: string; count: number }[];
  repeatOffenders: { userId: string; name: string; disputeCount: number }[];
}

export default function DisputeAnalysisReportPage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [stats, setStats] = React.useState<DisputeStats>({
    totalDisputes: 0,
    openDisputes: 0,
    resolvedDisputes: 0,
    averageResolutionTime: 0,
    disputesByCategory: [],
    disputesByMonth: [],
    resolutionOutcomes: [],
    repeatOffenders: [],
  });

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange?.from) params.append("startDate", dateRange.from.toISOString());
      if (dateRange?.to) params.append("endDate", dateRange.to.toISOString());

      const response = await axiosInstance.get(`${endpoints.admin.reports.disputeAnalysis}?${params.toString()}`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch dispute stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const exportColumns: ExportColumn<{ month: string; count: number; resolved: number }>[] = [
    { key: "month", header: "Month" },
    { key: "count", header: "Total Disputes" },
    { key: "resolved", header: "Resolved" },
  ];

  const resolutionRate = stats.totalDisputes > 0
    ? (stats.resolvedDisputes / stats.totalDisputes) * 100
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
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <Button asChild variant="ghost" size="sm" className="-ml-2">
                          <Link href="/reports">
                            <IconChevronLeft className="mr-1 size-4" />
                            Back to Reports
                          </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="size-8 text-primary" />
                          <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                              Dispute Analysis Report
                            </h1>
                            <p className="text-muted-foreground">
                              Track dispute resolution and identify patterns
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
                          data={stats.disputesByMonth}
                          columns={exportColumns}
                          filename="dispute-analysis-report"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Disputes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-5 text-muted-foreground" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold">{stats.totalDisputes}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Open Disputes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Clock className="size-5 text-yellow-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold text-yellow-600">{stats.openDisputes}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Resolved</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="size-5 text-green-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold text-green-600">{stats.resolvedDisputes}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Resolution Rate</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="size-5 text-blue-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold text-blue-600">{Math.round(resolutionRate)}%</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Disputes by Category */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Disputes by Category</CardTitle>
                      <CardDescription>Distribution across dispute types</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-3">
                          {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-8 w-full" />
                          ))}
                        </div>
                      ) : stats.disputesByCategory.length > 0 ? (
                        <div className="space-y-3">
                          {stats.disputesByCategory.map((cat) => {
                            const maxCount = Math.max(...stats.disputesByCategory.map((c) => c.count));
                            return (
                              <div key={cat.category} className="flex items-center justify-between">
                                <span className="text-sm font-medium">{cat.category.replace(/_/g, " ")}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary rounded-full"
                                      style={{ width: `${maxCount > 0 ? (cat.count / maxCount) * 100 : 0}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-muted-foreground w-8 text-right">{cat.count}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No category data available</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Resolution Outcomes */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Resolution Outcomes</CardTitle>
                      <CardDescription>How disputes were resolved</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-3">
                          {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-8 w-full" />
                          ))}
                        </div>
                      ) : stats.resolutionOutcomes.length > 0 ? (
                        <div className="space-y-3">
                          {stats.resolutionOutcomes.map((outcome) => (
                            <div key={outcome.outcome} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <span className="text-sm font-medium">{outcome.outcome.replace(/_/g, " ")}</span>
                              <Badge variant="secondary">{outcome.count}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No resolution data available</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Repeat Offenders */}
                {stats.repeatOffenders.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="size-5 text-red-500" />
                        Players with Multiple Disputes
                      </CardTitle>
                      <CardDescription>Players who have raised 3 or more disputes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {stats.repeatOffenders.map((offender) => (
                          <div key={offender.userId} className="flex items-center justify-between p-3 border rounded-lg">
                            <span className="font-medium">{offender.name}</span>
                            <Badge variant="destructive">{offender.disputeCount} disputes</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Monthly Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Dispute Trend</CardTitle>
                    <CardDescription>Disputes over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                          <Skeleton key={i} className="h-8 w-full" />
                        ))}
                      </div>
                    ) : stats.disputesByMonth.length > 0 ? (
                      <div className="space-y-3">
                        {stats.disputesByMonth.map((item) => {
                          const [year, month] = item.month.split("-");
                          const monthName = new Date(Number(year), Number(month) - 1).toLocaleString("default", { month: "short", year: "numeric" });
                          return (
                            <div key={item.month} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                              <span className="text-sm w-24 font-medium">{monthName}</span>
                              <div className="flex-1 flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Total:</span>
                                  <span className="text-sm font-medium">{item.count}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Resolved:</span>
                                  <span className="text-sm font-medium text-green-600">{item.resolved}</span>
                                </div>
                              </div>
                              <span className="text-sm font-bold">
                                {item.count > 0 ? Math.round((item.resolved / item.count) * 100) : 0}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No dispute data available</p>
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
