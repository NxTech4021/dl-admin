"use client";

import React, { useState, useEffect, useCallback } from "react";
import { notFound } from "next/navigation";
import { Season, seasonSchema } from "@/ZodSchema/season-schema";
import { divisionSchema, Division } from "@/ZodSchema/division-schema";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { z } from 'zod';
import { toast } from 'sonner';

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
} from "@tabler/icons-react";

import SeasonPlayersCard from "./components/season/SeasonPlayersCard";
import SeasonDivisionsCard from "./components/season/SeasonDivisionsCard";
import SeasonLeaderboardCard from "./components/season/SeasonLeaderboardCard";
import WithdrawalRequestsCard from "./components/season/WithdrawalRequestsCard";
import SeasonSettingsCard from "./components/season/SeasonSettingsCard";
import SeasonOverviewStats from "./components/season/SeasonOverviewStats";
import SeasonDetailsSection from "./components/season/SeasonDetailsSection";


export default function SeasonDetailClient({ seasonId }: { seasonId: string }) {
  const [season, setSeason] = useState<Season | null>(null);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDivisionsLoading, setIsDivisionsLoading] = useState(false);
  const { data: session } = useSession();

  const userId = session?.user.id;

  // Fetch divisions data
  const fetchDivisions = useCallback(async () => {
    setIsDivisionsLoading(true);
    try {
      const response = await axiosInstance.get(endpoints.division.getbySeasionId(seasonId))
      if (!response.data || !Array.isArray(response.data.data)) {
        setDivisions([]);
        return;
      }
      const parsed = z.array(divisionSchema).parse(response.data.data);
       console.log ("divison pasrsed ", parsed)
      setDivisions(parsed);
    } catch (error) {
      console.error('Failed to fetch divisions:', error);
      setDivisions([]);
      toast.error('Unable to load divisions.');
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
          <SiteHeader />
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
        <SiteHeader />
        <div className="space-y-6 p-8">
          {/* <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">{season.name} Details</h1>
        </div> */}

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <IconUserCircle className="size-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="players" className="flex items-center gap-2">
                <IconUsers className="size-4" />
                Players
              </TabsTrigger>
              <TabsTrigger
                value="divisions"
                className="flex items-center gap-2"
              >
                <IconTrophy className="size-4" />
                Divisions
              </TabsTrigger>
              <TabsTrigger
                value="leaderboard"
                className="flex items-center gap-2"
              >
                <IconTarget className="size-4" />
                Leaderboard
              </TabsTrigger>
              <TabsTrigger
                value="withdrawal_requests"
                className="flex items-center gap-2"
              >
                <IconCalendar className="size-4" />
                Withdrawal Requests
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <IconSettings className="size-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <IconCreditCard className="size-4" />
                Payment
              </TabsTrigger>
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
                    <SeasonDetailsSection season={season} onSeasonUpdated={fetchSeasonData} />
                  </div>

                  {/* Quick Info Sidebar - spans 1 column */}
                  <div className="space-y-6">
                    {/* Settings & Details Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <IconSettings className="size-4" />
                          Settings & Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Season Status */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-foreground">
                            Season Status
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Status
                              </span>
                              <Badge
                                variant="outline"
                                className={
                                  season.isActive
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-gray-100 text-gray-800 border-gray-200"
                                }
                              >
                                {season.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Registered Players
                              </span>
                              <span className="font-medium text-sm">
                                {season.registeredUserCount}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Configuration */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-foreground">
                            Configuration
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Payment Required
                              </span>
                              <Badge
                                variant={
                                  season.paymentRequired
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {season.paymentRequired ? "Yes" : "No"}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Withdrawals Allowed
                              </span>
                              <Badge
                                variant={
                                  season.withdrawalEnabled
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {season.withdrawalEnabled ? "Yes" : "No"}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Promo Codes
                              </span>
                              <Badge
                                variant={
                                  season.promoCodeSupported
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {season.promoCodeSupported
                                  ? "Enabled"
                                  : "Disabled"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Linked Leagues */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-foreground">
                            Linked Leagues
                          </h4>
                          <div className="text-sm font-medium">
                            {season.leagues && season.leagues.length > 0 ? (
                              <div className="space-y-1">
                                {season.leagues.map((league: any) => (
                                  <Badge
                                    key={league.id}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {league.name}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                No leagues linked
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Linked Categories */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-foreground">
                            Linked Categories
                          </h4>
                          <div className="text-sm font-medium">
                            {season.categories && season.categories.length > 0 ? (
                              <div className="space-y-1">
                                {season.categories.map((category: any) => (
                                  <div key={category.id} className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {category.name || 'Unnamed Category'}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                No categories linked
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
                season={season}
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
              <Card>
                <CardHeader>
                  <CardTitle>Payment Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">TODO</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
