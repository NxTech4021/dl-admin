"use client";

import * as React from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangePicker, ExportButton, type ExportColumn, type DateRange } from "@/components/shared";
import { IconChevronLeft, IconRefresh } from "@tabler/icons-react";
import { Calendar, Users, UserCheck, UserX, Bell } from "lucide-react";
import axiosInstance, { endpoints } from "@/lib/endpoints";

interface MembershipStats {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  renewalRate: number;
  membershipsByMonth: { month: string; new: number; renewed: number; expired: number }[];
  upcomingRenewals: number;
}

export default function MembershipReportPage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [stats, setStats] = React.useState<MembershipStats>({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    renewalRate: 0,
    membershipsByMonth: [],
    upcomingRenewals: 0,
  });

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange?.from) params.append("startDate", dateRange.from.toISOString());
      if (dateRange?.to) params.append("endDate", dateRange.to.toISOString());

      const response = await axiosInstance.get(`${endpoints.admin.reports.membership}?${params.toString()}`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch membership stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const exportColumns: ExportColumn<{ month: string; new: number; renewed: number; expired: number }>[] = [
    { key: "month", header: "Month" },
    { key: "new", header: "New Members" },
    { key: "renewed", header: "Renewed" },
    { key: "expired", header: "Expired" },
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
                          <Link href="/reports">
                            <IconChevronLeft className="mr-1 size-4" />
                            Back to Reports
                          </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                          <Calendar className="size-8 text-primary" />
                          <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                              Membership Report
                            </h1>
                            <p className="text-muted-foreground">
                              Analyze membership trends and renewals
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
                          data={stats.membershipsByMonth}
                          columns={exportColumns}
                          filename="membership-report"
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
                      <CardDescription>Total Members</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Users className="size-5 text-muted-foreground" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold">{stats.totalMembers}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Active</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <UserCheck className="size-5 text-green-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold text-green-600">{stats.activeMembers}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Expired</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <UserX className="size-5 text-red-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold text-red-600">{stats.expiredMembers}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Renewal Rate</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Calendar className="size-5 text-blue-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold text-blue-600">{stats.renewalRate}%</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Upcoming Renewals</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Bell className="size-5 text-yellow-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold text-yellow-600">{stats.upcomingRenewals}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Monthly Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Membership Activity</CardTitle>
                    <CardDescription>New, renewed, and expired memberships over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : stats.membershipsByMonth.length > 0 ? (
                      <div className="space-y-3">
                        {stats.membershipsByMonth.map((item) => {
                          const [year, month] = item.month.split("-");
                          const monthName = new Date(Number(year), Number(month) - 1).toLocaleString("default", { month: "short", year: "numeric" });
                          return (
                            <div key={item.month} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                              <span className="text-sm w-24 font-medium">{monthName}</span>
                              <div className="flex-1 grid grid-cols-3 gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                                  <span className="text-sm">New: <strong>{item.new}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                  <span className="text-sm">Renewed: <strong>{item.renewed}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                                  <span className="text-sm">Expired: <strong>{item.expired}</strong></span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="size-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Membership Data</h3>
                        <p className="text-sm text-muted-foreground">
                          No membership data found for the selected period.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Membership Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                          <div className="flex items-center gap-3">
                            <UserCheck className="size-8 text-green-600" />
                            <div>
                              <p className="font-medium text-green-700 dark:text-green-400">Active Members</p>
                              <p className="text-sm text-green-600 dark:text-green-500">Currently active</p>
                            </div>
                          </div>
                          {isLoading ? (
                            <Skeleton className="h-10 w-16" />
                          ) : (
                            <span className="text-3xl font-bold text-green-600">{stats.activeMembers}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
                          <div className="flex items-center gap-3">
                            <Bell className="size-8 text-yellow-600" />
                            <div>
                              <p className="font-medium text-yellow-700 dark:text-yellow-400">Upcoming Renewals</p>
                              <p className="text-sm text-yellow-600 dark:text-yellow-500">Expiring in 30 days</p>
                            </div>
                          </div>
                          {isLoading ? (
                            <Skeleton className="h-10 w-16" />
                          ) : (
                            <span className="text-3xl font-bold text-yellow-600">{stats.upcomingRenewals}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Renewal Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center py-8">
                      {isLoading ? (
                        <Skeleton className="h-32 w-32 rounded-full" />
                      ) : (
                        <div className="text-center">
                          <div className="relative w-32 h-32 mx-auto">
                            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="12"
                                className="text-muted"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="12"
                                strokeDasharray={`${stats.renewalRate * 2.51} 251`}
                                className="text-primary"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-3xl font-bold">{stats.renewalRate}%</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-4">Renewal Rate</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
