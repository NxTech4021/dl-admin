"use client";

import React, { useState, useEffect, useCallback } from "react";
import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";

import {
  IconUserCircle,
  IconCalendar,
  IconBuilding,
  IconSettings,
  IconTrophy,
} from "@tabler/icons-react";

import { LeagueOverviewStats } from "@/components/league/league-overview-stats";
import { LeagueDetailsSection } from "@/components/league/league-details-section";
import { LeagueSeasonsWrapper } from "@/components/league/league-seasons-wrapper";
import LeagueSponsorsSection from "@/components/league/league-sponsors-section";
import { formatLocation } from "@/components/data-table/constants";
import { getSportLabel } from "@/constants/sports";
import type { Season } from "@/constants/zod/season-schema";
import type {
  SportType,
  GameType,
  JoinType,
  LeagueStatus,
  Sponsorship,
} from "@/constants/types/league";

interface LeagueDetailData {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  sportType: SportType;
  gameType?: GameType | null;
  joinType?: JoinType | null;
  status: LeagueStatus;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    user?: {
      name?: string;
    };
  };
  seasons?: SeasonWithMemberships[];
  sponsorships?: Sponsorship[];
  _count?: {
    memberships?: number;
    seasons?: number;
  };
}

interface SeasonWithMemberships {
  id: string;
  name: string;
  status?: string;
  startDate?: string;
  memberships?: { id: string; userId?: string }[];
  divisions?: { id: string }[];
  _count?: {
    memberships?: number;
  };
}

async function getLeague(id: string) {
  try {
    const response = await axiosInstance.get(endpoints.league.getById(id));
    return response.data?.data?.league;
  } catch {
    return null;
  }
}

export default function LeagueViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const leagueId = React.use(params).id;
  const [league, setLeague] = useState<LeagueDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchLeague = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getLeague(leagueId);
      if (!data) {
        notFound();
        return;
      }
      setLeague(data);
    } catch (error) {
      console.error("Failed to fetch league:", error);
      toast.error("Failed to load league details");
    } finally {
      setIsLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchLeague();
  }, [fetchLeague]);

  const getBreadcrumbItems = () => {
    const baseItems = [
      { label: "Leagues", href: "/league" },
      { label: league?.name ?? "League Details" },
    ];

    switch (activeTab) {
      case "overview":
        return [...baseItems, { label: "Overview" }];
      case "seasons":
        return [...baseItems, { label: "Seasons" }];
      case "sponsors":
        return [...baseItems, { label: "Sponsors" }];
      default:
        return baseItems;
    }
  };

  // Calculate metrics
  const seasons = league?.seasons || [];
  const sponsorships = league?.sponsorships || [];

  const { uniqueMemberCount, totalDivisions, activeSeasonCount } =
    React.useMemo(() => {
      const playerIds = new Set<string>();
      let divisions = 0;
      let activeSeasons = 0;

      seasons.forEach((season) => {
        const memberships = season?.memberships ?? [];
        memberships.forEach((m) => {
          if (m.userId) playerIds.add(m.userId);
        });

        divisions += season?.divisions?.length ?? 0;

        if (season?.status?.toUpperCase() === "ACTIVE") {
          activeSeasons++;
        }
      });

      return {
        uniqueMemberCount: playerIds.size,
        totalDivisions: divisions,
        activeSeasonCount: activeSeasons,
      };
    }, [seasons]);

  if (isLoading || !league) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader
            items={[{ label: "Leagues", href: "/league" }, { label: "Loading..." }]}
          />
          <div className="space-y-6 p-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
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
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <IconUserCircle className="size-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="seasons" className="flex items-center gap-2">
                <IconCalendar className="size-4" />
                Seasons
                <span className="ml-1 text-xs text-muted-foreground">
                  ({seasons.length})
                </span>
              </TabsTrigger>
              <TabsTrigger value="sponsors" className="flex items-center gap-2">
                <IconBuilding className="size-4" />
                Sponsors
                <span className="ml-1 text-xs text-muted-foreground">
                  ({sponsorships.length})
                </span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="space-y-6">
                {/* Stats Cards Row */}
                <LeagueOverviewStats
                  uniqueMemberCount={uniqueMemberCount}
                  seasonsCount={seasons.length}
                  totalDivisions={totalDivisions}
                  sponsorCount={sponsorships.length}
                  activeSeasonCount={activeSeasonCount}
                />

                {/* League Details and Quick Info */}
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Main Details - spans 2 columns */}
                  <div className="lg:col-span-2">
                    <LeagueDetailsSection
                      league={league as any}
                      onLeagueUpdated={fetchLeague}
                      formatLocation={formatLocation}
                      getSportLabel={getSportLabel}
                    />
                  </div>

                  {/* Quick Info Sidebar - spans 1 column */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <IconSettings className="size-4" />
                          Quick Info
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
                                Active Seasons
                              </span>
                              <Badge variant="outline">{activeSeasonCount}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Total Seasons
                              </span>
                              <span className="font-medium text-sm">
                                {seasons.length}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Participation */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-foreground">
                            Participation
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Unique Players
                              </span>
                              <span className="font-medium text-sm">
                                {uniqueMemberCount}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Total Divisions
                              </span>
                              <span className="font-medium text-sm">
                                {totalDivisions}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Sponsors */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-foreground">
                            Sponsors
                          </h4>
                          <div className="text-sm font-medium">
                            {sponsorships.length > 0 ? (
                              <div className="space-y-1">
                                {sponsorships.slice(0, 3).map((sponsor) => (
                                  <Badge
                                    key={sponsor.id}
                                    variant="outline"
                                    className="text-xs mr-1"
                                  >
                                    {sponsor.sponsoredName || "Sponsor"}
                                  </Badge>
                                ))}
                                {sponsorships.length > 3 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{sponsorships.length - 3} more
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                No sponsors linked
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

            {/* Seasons Tab */}
            <TabsContent value="seasons">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconCalendar className="size-5" />
                    Seasons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LeagueSeasonsWrapper
                    seasons={seasons as Season[]}
                    leagueId={leagueId}
                    leagueName={league.name}
                    onRefresh={fetchLeague}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sponsors Tab */}
            <TabsContent value="sponsors">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconBuilding className="size-5" />
                    Sponsors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LeagueSponsorsSection
                    sponsorships={sponsorships}
                    leagueId={leagueId}
                    onSponsorDeleted={fetchLeague}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
