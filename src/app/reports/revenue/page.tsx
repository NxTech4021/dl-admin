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
import { DollarSign, TrendingUp, TrendingDown, Clock, RotateCcw } from "lucide-react";
import axiosInstance, { endpoints } from "@/lib/endpoints";

interface RevenueStats {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  growthRate: number;
  revenueByMonth: { month: string; amount: number }[];
  outstandingPayments: number;
  refundsIssued: number;
}

export default function RevenueReportPage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [stats, setStats] = React.useState<RevenueStats>({
    totalRevenue: 0,
    revenueThisMonth: 0,
    revenueLastMonth: 0,
    growthRate: 0,
    revenueByMonth: [],
    outstandingPayments: 0,
    refundsIssued: 0,
  });

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange?.from) params.append("startDate", dateRange.from.toISOString());
      if (dateRange?.to) params.append("endDate", dateRange.to.toISOString());

      const response = await axiosInstance.get(`${endpoints.admin.reports.revenue}?${params.toString()}`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch revenue stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
    }).format(amount);
  };

  const exportColumns: ExportColumn<{ month: string; amount: number }>[] = [
    { key: "month", header: "Month" },
    { key: "amount", header: "Revenue", formatter: (v) => formatCurrency(v as number) },
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
                          <DollarSign className="size-8 text-primary" />
                          <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                              Revenue Report
                            </h1>
                            <p className="text-muted-foreground">
                              Track financial performance and payment trends
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
                          data={stats.revenueByMonth}
                          columns={exportColumns}
                          filename="revenue-report"
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
                      <CardDescription>Total Revenue</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <DollarSign className="size-5 text-green-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-24" />
                        ) : (
                          <span className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>This Month</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {stats.growthRate >= 0 ? (
                          <TrendingUp className="size-5 text-green-500" />
                        ) : (
                          <TrendingDown className="size-5 text-red-500" />
                        )}
                        {isLoading ? (
                          <Skeleton className="h-8 w-24" />
                        ) : (
                          <div>
                            <span className="text-2xl font-bold">{formatCurrency(stats.revenueThisMonth)}</span>
                            <span className={`text-sm ml-2 ${stats.growthRate >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {stats.growthRate >= 0 ? "+" : ""}{stats.growthRate}%
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Outstanding</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Clock className="size-5 text-yellow-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-24" />
                        ) : (
                          <span className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.outstandingPayments)}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Refunds Issued</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <RotateCcw className="size-5 text-red-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-24" />
                        ) : (
                          <span className="text-2xl font-bold text-red-600">{formatCurrency(stats.refundsIssued)}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Monthly Revenue Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Revenue Trend</CardTitle>
                    <CardDescription>Revenue performance over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : stats.revenueByMonth.length > 0 ? (
                      <div className="space-y-3">
                        {stats.revenueByMonth.map((item) => {
                          const maxAmount = Math.max(...stats.revenueByMonth.map((m) => m.amount));
                          const [year, month] = item.month.split("-");
                          const monthName = new Date(Number(year), Number(month) - 1).toLocaleString("default", { month: "short", year: "numeric" });
                          return (
                            <div key={item.month} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <span className="text-sm w-24 font-medium">{monthName}</span>
                              <div className="flex-1 mx-4">
                                <div className="h-4 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: `${maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0}%` }}
                                  />
                                </div>
                              </div>
                              <span className="text-sm font-bold w-28 text-right">{formatCurrency(item.amount)}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <DollarSign className="size-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Revenue Data</h3>
                        <p className="text-sm text-muted-foreground">
                          No payment data found for the selected period.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Comparison Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Month-over-Month Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-6 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">This Month</p>
                        {isLoading ? (
                          <Skeleton className="h-10 w-32 mx-auto" />
                        ) : (
                          <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.revenueThisMonth)}</p>
                        )}
                      </div>
                      <div className="text-center p-6 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Last Month</p>
                        {isLoading ? (
                          <Skeleton className="h-10 w-32 mx-auto" />
                        ) : (
                          <p className="text-3xl font-bold">{formatCurrency(stats.revenueLastMonth)}</p>
                        )}
                      </div>
                      <div className="text-center p-6 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Growth</p>
                        {isLoading ? (
                          <Skeleton className="h-10 w-24 mx-auto" />
                        ) : (
                          <p className={`text-3xl font-bold ${stats.growthRate >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {stats.growthRate >= 0 ? "+" : ""}{stats.growthRate}%
                          </p>
                        )}
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
