import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fadeInUp, fastTransition } from "@/lib/animation-variants";

import {
  IconUserCircle,
  IconCalendar,
  IconBuilding,
  IconSettings,
  IconChevronLeft,
} from "@tabler/icons-react";

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

// Lazy load components
const LeagueOverviewStats = lazy(() => import("@/components/league/league-overview-stats"));
const LeagueDetailsSection = lazy(() => import("@/components/league/league-details-section"));
const LeagueSeasonsWrapper = lazy(() =>
  import("@/components/league/league-seasons-wrapper").then((mod) => ({
    default: mod.LeagueSeasonsWrapper,
  }))
);
const LeagueSponsorsSection = lazy(() => import("@/components/league/league-sponsors-section"));

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

const TABS = [
  { value: "overview", label: "Overview", icon: IconUserCircle },
  { value: "seasons", label: "Seasons", icon: IconCalendar },
  { value: "sponsors", label: "Sponsors", icon: IconBuilding },
] as const;

async function getLeague(id: string) {
  try {
    const response = await axiosInstance.get(endpoints.league.getById(id));
    return response.data?.data?.league;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/_authenticated/league/view/$leagueId/")({
  component: LeagueViewPage,
});

function LeagueViewPage() {
  const { leagueId } = Route.useParams();
  const [league, setLeague] = useState<LeagueDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchLeague = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getLeague(leagueId);
      if (!data) {
        toast.error("League not found");
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
      <>
        <SiteHeader
          items={[
            { label: "Leagues", href: "/league" },
            { label: "Loading..." },
          ]}
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
      </>
    );
  }

  return (
    <>
      <SiteHeader
        items={[
          { label: "Leagues", href: "/league" },
          { label: league.name },
        ]}
      />
      <div className="space-y-6 p-8">
        {/* Back button and title */}
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/league">
              <IconChevronLeft className="mr-1 size-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{league.name}</h1>
            <p className="text-sm text-muted-foreground">
              Manage league details, seasons, and sponsors
            </p>
          </div>
        </div>

        <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
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
                      {tab.value === "seasons" && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({seasons.length})
                        </span>
                      )}
                      {tab.value === "sponsors" && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({sponsorships.length})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Tab List */}
        <TabsList className="hidden md:grid w-full grid-cols-3">
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

        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
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
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                  transition={fastTransition}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconSettings className="size-4" />
                        Quick Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Active Seasons</span>
                        <Badge variant="outline">{activeSeasonCount}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Seasons</span>
                        <Badge variant="outline">{seasons.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Unique Players</span>
                        <Badge variant="outline">{uniqueMemberCount}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Divisions</span>
                        <Badge variant="outline">{totalDivisions}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Sponsors</span>
                        <Badge variant="outline">{sponsorships.length}</Badge>
                      </div>
                      {sponsorships.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {sponsorships.slice(0, 3).map((sponsor) => (
                            <Badge key={sponsor.id} variant="secondary" className="text-xs">
                              {sponsor.sponsoredName || "Sponsor"}
                            </Badge>
                          ))}
                          {sponsorships.length > 3 && (
                            <span className="text-xs text-muted-foreground self-center">
                              +{sponsorships.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
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
        </Suspense>
      </Tabs>
      </div>
    </>
  );
}
