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
import { DateRangePicker, ExportButton, type ExportColumn, type DateRange } from "@/components/shared";
import { IconChevronLeft, IconRefresh } from "@tabler/icons-react";
import { UserPlus, Users, UserCheck, TrendingUp, Calendar } from "lucide-react";
import axiosInstance, { endpoints } from "@/lib/endpoints";

interface RegistrationStats {
  totalRegistrations: number;
  newThisMonth: number;
  newThisWeek: number;
  registrationsByMonth: { month: string; count: number }[];
  onboardingCompletion: {
    total: number;
    withProfile: number;
    withMatches: number;
    fullyOnboarded: number;
  };
  dropoutRate: number;
}

export default function PlayerRegistrationReportPage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [stats, setStats] = React.useState<RegistrationStats>({
    totalRegistrations: 0,
    newThisMonth: 0,
    newThisWeek: 0,
    registrationsByMonth: [],
    onboardingCompletion: { total: 0, withProfile: 0, withMatches: 0, fullyOnboarded: 0 },
    dropoutRate: 0,
  });

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange?.from) params.append("startDate", dateRange.from.toISOString());
      if (dateRange?.to) params.append("endDate", dateRange.to.toISOString());

      const response = await axiosInstance.get(`${endpoints.admin.reports.playerRegistration}?${params.toString()}`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch registration stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const exportColumns: ExportColumn<{ month: string; count: number }>[] = [
    { key: "month", header: "Month" },
    { key: "count", header: "Registrations" },
  ];

  const onboardingRate = stats.onboardingCompletion.total > 0
    ? (stats.onboardingCompletion.fullyOnboarded / stats.onboardingCompletion.total) * 100
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
                          <Link to="/reports">
                            <IconChevronLeft className="mr-1 size-4" />
                            Back to Reports
                          </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                          <UserPlus className="size-8 text-primary" />
                          <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                              Player Registration Report
                            </h1>
                            <p className="text-muted-foreground">
                              Monitor new player signups and onboarding completion
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
                          data={stats.registrationsByMonth}
                          columns={exportColumns}
                          filename="player-registration-report"
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
                      <CardDescription>Total Registrations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Users className="size-5 text-muted-foreground" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold">{stats.totalRegistrations}</span>
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
                        <TrendingUp className="size-5 text-green-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold text-green-600">+{stats.newThisMonth}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>New This Week</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Calendar className="size-5 text-blue-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold text-blue-600">+{stats.newThisWeek}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Dropout Rate</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <UserCheck className="size-5 text-yellow-500" />
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <span className="text-2xl font-bold text-yellow-600">{stats.dropoutRate}%</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Onboarding Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle>Onboarding Completion</CardTitle>
                    <CardDescription>Track player onboarding funnel</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Registered</span>
                            <span>{stats.onboardingCompletion.total}</span>
                          </div>
                          <Progress value={100} className="h-3" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Completed Profile</span>
                            <span>{stats.onboardingCompletion.withProfile} ({stats.onboardingCompletion.total > 0 ? Math.round((stats.onboardingCompletion.withProfile / stats.onboardingCompletion.total) * 100) : 0}%)</span>
                          </div>
                          <Progress value={stats.onboardingCompletion.total > 0 ? (stats.onboardingCompletion.withProfile / stats.onboardingCompletion.total) * 100 : 0} className="h-3" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Played First Match</span>
                            <span>{stats.onboardingCompletion.withMatches} ({stats.onboardingCompletion.total > 0 ? Math.round((stats.onboardingCompletion.withMatches / stats.onboardingCompletion.total) * 100) : 0}%)</span>
                          </div>
                          <Progress value={stats.onboardingCompletion.total > 0 ? (stats.onboardingCompletion.withMatches / stats.onboardingCompletion.total) * 100 : 0} className="h-3" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Fully Onboarded</span>
                            <span>{stats.onboardingCompletion.fullyOnboarded} ({Math.round(onboardingRate)}%)</span>
                          </div>
                          <Progress value={onboardingRate} className="h-3" />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Monthly Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Registration Trend</CardTitle>
                    <CardDescription>Monthly registration volume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                          <Skeleton key={i} className="h-8 w-full" />
                        ))}
                      </div>
                    ) : stats.registrationsByMonth.length > 0 ? (
                      <div className="space-y-3">
                        {stats.registrationsByMonth.slice(-12).map((item) => {
                          const maxCount = Math.max(...stats.registrationsByMonth.map((m) => m.count));
                          const [year, month] = item.month.split("-");
                          const monthName = new Date(Number(year), Number(month) - 1).toLocaleString("default", { month: "short", year: "numeric" });
                          return (
                            <div key={item.month} className="flex items-center justify-between">
                              <span className="text-sm w-24">{monthName}</span>
                              <div className="flex items-center gap-2 flex-1">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%` }}
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground w-12 text-right">{item.count}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No registration data available</p>
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
