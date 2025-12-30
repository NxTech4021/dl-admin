"use client";

import React, { useState, useEffect, useCallback } from "react";
import { notFound } from "next/navigation";
import { Season, seasonSchema } from "@/constants/zod/season-schema";
import { divisionSchema, Division } from "@/constants/zod/division-schema";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { z } from "zod";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";

import {
  IconUserCircle,
  IconUsers,
  IconTrophy,
  IconTarget,
  IconSettings,
  IconCreditCard,
  IconCalendar,
  IconChevronDown,
} from "@tabler/icons-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import SeasonPlayersCard from "./components/season/SeasonPlayersCard";
import SeasonDivisionsCard from "./components/season/SeasonDivisionsCard";
import SeasonLeaderboardCard from "./components/season/SeasonLeaderboardCard";
import WithdrawalRequestsCard from "./components/season/WithdrawalRequestsCard";
import SeasonSettingsCard from "./components/season/SeasonSettingsCard";
import SeasonOverviewStats from "./components/season/SeasonOverviewStats";
import SeasonDetailsSection from "./components/season/SeasonDetailsSection";
import SeasonPaymentCard from "./components/season/SeasonPaymentCard";

// Tab configuration for reuse
const TABS = [
  { value: "overview", label: "Overview", icon: IconUserCircle },
  { value: "players", label: "Players", icon: IconUsers },
  { value: "divisions", label: "Divisions", icon: IconTrophy },
  { value: "leaderboard", label: "Leaderboard", icon: IconTarget },
  { value: "withdrawal_requests", label: "Withdrawals", icon: IconCalendar },
  { value: "payment", label: "Payment", icon: IconCreditCard },
  { value: "settings", label: "Settings", icon: IconSettings },
] as const;

export default function SeasonDetailClient({ seasonId }: { seasonId: string }) {
  const [season, setSeason] = useState<Season | null>(null);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDivisionsLoading, setIsDivisionsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { data: session } = useSession();

  const userId = session?.user.id;

  // Breadcrumb items for header
  const getBreadcrumbItems = () => {
    const baseItems = [
      { label: "Seasons", href: "/seasons" },
      { label: season?.name ?? "Season Details" },
    ];

    switch (activeTab) {
      case "overview":
        return [...baseItems, { label: "Overview" }];
      case "players":
        return [...baseItems, { label: "Players" }];
      case "divisions":
        return [...baseItems, { label: "Divisions" }];
      case "leaderboard":
        return [...baseItems, { label: "Leaderboard" }];
      case "withdrawal_requests":
        return [...baseItems, { label: "Withdrawal Requests" }];
      case "settings":
        return [...baseItems, { label: "Settings" }];
      case "payment":
        return [...baseItems, { label: "Payment" }];
      default:
        return baseItems;
    }
  };

  // Fetch divisions data
  const fetchDivisions = useCallback(async () => {
    setIsDivisionsLoading(true);
    try {
      const response = await axiosInstance.get(
        endpoints.division.getBySeasonId(seasonId)
      );
      if (!response.data || !Array.isArray(response.data.data)) {
        setDivisions([]);
        return;
      }
      const parsed = z.array(divisionSchema).parse(response.data.data);
      setDivisions(parsed);
    } catch (error) {
      setDivisions([]);
      toast.error("Unable to load divisions.");
    } finally {
      setIsDivisionsLoading(false);
    }
  }, [seasonId]);

  // Fetch season data
  const fetchSeasonData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        endpoints.season.getById(seasonId)
      );
      const parsedData = seasonSchema.parse(response.data);
      setSeason(parsedData);
      console.log("season id data", response.data);
    } catch (error) {
      console.error("Failed to fetch season details:", error);
      notFound();
    } finally {
      setIsLoading(false);
    }
  }, [seasonId]);

  // Combined refresh function for when data changes
  const refreshAllData = useCallback(async () => {
    await Promise.all([fetchSeasonData(), fetchDivisions()]);
  }, [fetchSeasonData, fetchDivisions]);

  // Handle membership updates (refresh both season and divisions)
  const handleMembershipUpdated = useCallback(async () => {
    await refreshAllData();
  }, [refreshAllData]);

  // Handle division operations
  const handleDivisionCreated = useCallback(async () => {
    await fetchDivisions();
  }, [fetchDivisions]);

  const handleDivisionUpdated = useCallback(async () => {
    await fetchDivisions();
  }, [fetchDivisions]);

  const handleDivisionDeleted = useCallback(async () => {
    await fetchDivisions();
  }, [fetchDivisions]);

  useEffect(() => {
    if (seasonId) {
      fetchSeasonData();
      fetchDivisions();
    }
  }, [seasonId, fetchSeasonData, fetchDivisions]);

  console.log("season data", season);
  console.log("season divisions", divisions);

  if (isLoading || !season) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader items={[{ label: "Seasons", href: "/seasons" }, { label: "Loading..." }]} />
          <div className="space-y-6 p-8">
            {/* Season Header Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>

            {/* Tabs Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />

              {/* Content Skeleton */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-5 w-32" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader items={getBreadcrumbItems()} />
        <div className="space-y-6 p-8">
          {/* <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">{season.name} Details</h1>
        </div> */}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Mobile: Dropdown Select */}
            <div className="md:hidden">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(() => {
                      const currentTab = TABS.find(tab => tab.value === activeTab);
                      if (!currentTab) return null;
                      const Icon = currentTab.icon;
                      return (
                        <div className="flex items-center gap-2">
                          <Icon className="size-4" />
                          <span>{currentTab.label}</span>
                        </div>
                      );
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <SelectItem key={tab.value} value={tab.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="size-4" />
                          <span>{tab.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop: Tab List */}
            <TabsList className="hidden md:grid w-full grid-cols-7">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                    <Icon className="size-4" />
                    <span className="hidden lg:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="space-y-6">
                {/* Stats Cards Row */}
                <SeasonOverviewStats season={season} />

                {/* Season Details and Additional Info */}
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Main Details - spans 2 columns */}
                  <div className="lg:col-span-2">
                    <SeasonDetailsSection
                      season={season}
                      onSeasonUpdated={fetchSeasonData}
                    />
                  </div>

                  {/* Quick Info Sidebar - spans 1 column */}
                  <div className="space-y-4">
                    {/* Season Status Card */}
                    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
                      <div className="relative p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
                            <IconSettings className="size-4 text-primary" />
                          </div>
                          <span className="text-sm font-semibold tracking-tight">Season Status</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className={`relative p-3 rounded-lg border ${season.isActive ? "bg-emerald-500/5 border-emerald-500/10" : "bg-muted/50 border-border/50"}`}>
                            <div className="flex items-center gap-1.5 mb-1">
                              {season.isActive && <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                              <span className={`text-[10px] font-medium uppercase tracking-wider ${season.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>Status</span>
                            </div>
                            <span className={`text-lg font-bold ${season.isActive ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
                              {season.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="relative p-3 rounded-lg bg-muted/50 border border-border/50">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Players</span>
                            </div>
                            <span className="text-lg font-bold">
                              {Math.max(season.registeredUserCount || 0, (season.memberships || []).length)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Configuration Card */}
                    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20">
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-tr-full" />
                      <div className="relative p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center justify-center size-8 rounded-lg bg-blue-500/10">
                            <IconCreditCard className="size-4 text-blue-500" />
                          </div>
                          <span className="text-sm font-semibold tracking-tight">Configuration</span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                            <span className="text-sm text-muted-foreground">Payment</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${season.paymentRequired ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                              {season.paymentRequired ? "Required" : "Not Required"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                            <span className="text-sm text-muted-foreground">Withdrawals</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${season.withdrawalEnabled ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                              {season.withdrawalEnabled ? "Allowed" : "Disabled"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                            <span className="text-sm text-muted-foreground">Promo Codes</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${season.promoCodeSupported ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                              {season.promoCodeSupported ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Linked Leagues Card */}
                    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20">
                      <div className="absolute top-0 left-1/2 w-20 h-20 bg-gradient-to-b from-amber-500/5 to-transparent rounded-b-full -translate-x-1/2" />
                      <div className="relative p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center size-8 rounded-lg bg-amber-500/10">
                              <IconTrophy className="size-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="text-sm font-semibold tracking-tight">Linked Leagues</span>
                          </div>
                          {season.leagues && season.leagues.length > 0 && (
                            <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                              {season.leagues.length}
                            </span>
                          )}
                        </div>

                        {season.leagues && season.leagues.length > 0 ? (
                          <div className="space-y-2">
                            {season.leagues.map((league: any) => (
                              <div
                                key={league.id}
                                className="flex items-center gap-2.5 p-2 rounded-lg bg-gradient-to-r from-amber-500/5 to-transparent border border-amber-500/10"
                              >
                                <div className="flex items-center justify-center size-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                                  {(league.name || "L")[0].toUpperCase()}
                                </div>
                                <span className="text-sm font-medium truncate">
                                  {league.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-4 text-center">
                            <div className="flex items-center justify-center size-10 rounded-full bg-muted/50 mb-2">
                              <IconTrophy className="size-5 text-muted-foreground/50" />
                            </div>
                            <span className="text-sm text-muted-foreground">No leagues linked</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Linked Category Card */}
                    {season.category && (
                      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20">
                        <div className="relative p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center justify-center size-8 rounded-lg bg-violet-500/10">
                              <IconTarget className="size-4 text-violet-600 dark:text-violet-400" />
                            </div>
                            <span className="text-sm font-semibold tracking-tight">Category</span>
                          </div>
                          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-gradient-to-r from-violet-500/5 to-transparent border border-violet-500/10">
                            <div className="flex items-center justify-center size-6 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[10px] font-bold">
                              {(season.category.name || "C")[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-medium truncate">
                              {season.category.name || "Unnamed Category"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Players Tab */}
            <TabsContent value="players">
              <SeasonPlayersCard
                memberships={season.memberships}
                sportType={season.sportType}
                divisions={divisions}
                seasonId={season.id}
                adminId={userId}
                season={season as any}
                onMembershipUpdated={handleMembershipUpdated}
              />
            </TabsContent>

            {/* Divisions Tab */}
            <TabsContent value="divisions">
              <SeasonDivisionsCard
                seasonId={seasonId}
                divisions={divisions}
                isLoading={isDivisionsLoading}
                adminId={userId as string}
                onDivisionCreated={handleDivisionCreated}
                onDivisionUpdated={handleDivisionUpdated}
                onDivisionDeleted={handleDivisionDeleted}
                season={season}
              />
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard">
              <SeasonLeaderboardCard
                seasonId={seasonId}
                // adminId={userId}
                // divisions={divisions} TO-DO FUTURE
              />
            </TabsContent>

            {/* Withdrawal Requests Tab */}
            <TabsContent value="withdrawal_requests">
              <WithdrawalRequestsCard requests={season.withdrawalRequests} />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <SeasonSettingsCard season={season} />
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment">
              <SeasonPaymentCard
                memberships={season.memberships}
                entryFee={season.entryFee}
                paymentRequired={season.paymentRequired}
                seasonName={season.name}
              />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
