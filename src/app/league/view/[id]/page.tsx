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
  IconTrophy,
  IconUsers,
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
                  <div className="space-y-4">
                    {/* Season Activity Card */}
                    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
                      <div className="relative p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
                            <IconCalendar className="size-4 text-primary" />
                          </div>
                          <span className="text-sm font-semibold tracking-tight">Season Activity</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Active</span>
                            </div>
                            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeSeasonCount}</span>
                          </div>
                          <div className="relative p-3 rounded-lg bg-muted/50 border border-border/50">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Total</span>
                            </div>
                            <span className="text-2xl font-bold">{seasons.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Participation Stats */}
                    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20">
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-tr-full" />
                      <div className="relative p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center justify-center size-8 rounded-lg bg-blue-500/10">
                            <IconUsers className="size-4 text-blue-500" />
                          </div>
                          <span className="text-sm font-semibold tracking-tight">Participation</span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <div className="flex items-center justify-center size-7 rounded-md bg-background border border-border/50 shadow-sm">
                                <IconUserCircle className="size-3.5 text-muted-foreground" />
                              </div>
                              <span className="text-sm text-muted-foreground">Players</span>
                            </div>
                            <span className="text-sm font-semibold tabular-nums">{uniqueMemberCount}</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <div className="flex items-center justify-center size-7 rounded-md bg-background border border-border/50 shadow-sm">
                                <IconTrophy className="size-3.5 text-muted-foreground" />
                              </div>
                              <span className="text-sm text-muted-foreground">Divisions</span>
                            </div>
                            <span className="text-sm font-semibold tabular-nums">{totalDivisions}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sponsors Card */}
                    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20">
                      <div className="absolute top-0 left-1/2 w-20 h-20 bg-gradient-to-b from-amber-500/5 to-transparent rounded-b-full -translate-x-1/2" />
                      <div className="relative p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center size-8 rounded-lg bg-amber-500/10">
                              <IconBuilding className="size-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="text-sm font-semibold tracking-tight">Sponsors</span>
                          </div>
                          {sponsorships.length > 0 && (
                            <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                              {sponsorships.length}
                            </span>
                          )}
                        </div>

                        {sponsorships.length > 0 ? (
                          <div className="space-y-2">
                            {sponsorships.slice(0, 3).map((sponsor, index) => (
                              <div
                                key={sponsor.id}
                                className="flex items-center gap-2.5 p-2 rounded-lg bg-gradient-to-r from-amber-500/5 to-transparent border border-amber-500/10 hover:border-amber-500/20 transition-colors"
                              >
                                <div className="flex items-center justify-center size-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                                  {(sponsor.sponsoredName || "S")[0].toUpperCase()}
                                </div>
                                <span className="text-sm font-medium truncate">
                                  {sponsor.sponsoredName || "Sponsor"}
                                </span>
                              </div>
                            ))}
                            {sponsorships.length > 3 && (
                              <button className="w-full text-center text-xs font-medium text-muted-foreground hover:text-foreground py-2 transition-colors">
                                +{sponsorships.length - 3} more sponsors
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-4 text-center">
                            <div className="flex items-center justify-center size-10 rounded-full bg-muted/50 mb-2">
                              <IconBuilding className="size-5 text-muted-foreground/50" />
                            </div>
                            <span className="text-sm text-muted-foreground">No sponsors yet</span>
                          </div>
                        )}
                      </div>
                    </div>
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
