import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Division, divisionSchema } from "@/constants/zod/division-schema";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

import { SiteHeader } from "@/components/site-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

import {
  IconUserCircle,
  IconUsers,
  IconTrophy,
  IconTarget,
  IconSettings,
  IconChevronLeft,
} from "@tabler/icons-react";

// Lazy load tab components
const DivisionOverviewStats = lazy(() => import("@/app/divisions/[id]/components/division/DivisionOverviewStats"));
const DivisionDetailsSection = lazy(() => import("@/app/divisions/[id]/components/division/DivisionDetailsSection"));
const DivisionPlayersCard = lazy(() => import("@/app/divisions/[id]/components/division/DivisionPlayersCard"));
const DivisionMatchesCard = lazy(() => import("@/app/divisions/[id]/components/division/DivisionMatchesCard"));
const DivisionStandingsCard = lazy(() => import("@/app/divisions/[id]/components/division/DivisionStandingsCard"));
const DivisionSettingsCard = lazy(() => import("@/app/divisions/[id]/components/division/DivisionSettingsCard"));

interface DivisionPlayer {
  id: string;
  odUserId?: string;
  name: string;
  email: string;
  rating?: number;
  wins?: number;
  losses?: number;
  matchesPlayed?: number;
  joinedAt?: string;
}

interface DivisionMatch {
  id: string;
  player1?: { id: string; name: string };
  player2?: { id: string; name: string };
  team1?: { id: string; name: string };
  team2?: { id: string; name: string };
  score?: string;
  status: string;
  scheduledAt?: string;
  completedAt?: string;
  winner?: string;
}

export const Route = createFileRoute("/_authenticated/divisions/$divisionId/")({
  component: DivisionDetailPage,
});

function DivisionDetailPage() {
  const { divisionId } = Route.useParams();
  const [division, setDivision] = useState<Division | null>(null);
  const [players, setPlayers] = useState<DivisionPlayer[]>([]);
  const [matches, setMatches] = useState<DivisionMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayersLoading, setIsPlayersLoading] = useState(false);
  const [isMatchesLoading, setIsMatchesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { data: session } = useSession();

  const adminId = session?.user.id;

  const fetchDivision = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        endpoints.division.getById(divisionId)
      );
      const data = response.data?.data || response.data;
      const parsed = divisionSchema.parse(data);
      setDivision(parsed);
    } catch (error) {
      logger.error("Failed to fetch division details:", error);
      toast.error("Failed to load division details");
    } finally {
      setIsLoading(false);
    }
  }, [divisionId]);

  const fetchPlayers = useCallback(async () => {
    setIsPlayersLoading(true);
    try {
      const response = await axiosInstance.get(
        endpoints.division.getDivisionAssignments(divisionId)
      );
      const playersData =
        response.data?.data || response.data?.players || response.data || [];
      const mappedPlayers = Array.isArray(playersData)
        ? playersData.map((p: any) => ({
            id: p.userId || p.id,
            odUserId: p.odUserId,
            name: p.user?.name || p.name || "Unknown",
            email: p.user?.email || p.email || "",
            rating: p.user?.rating || p.rating,
            wins: p.wins || 0,
            losses: p.losses || 0,
            matchesPlayed: p.matchesPlayed || 0,
            joinedAt: p.createdAt || p.joinedAt,
          }))
        : [];
      setPlayers(mappedPlayers);
    } catch (error) {
      logger.error("Failed to fetch division players:", error);
      setPlayers([]);
    } finally {
      setIsPlayersLoading(false);
    }
  }, [divisionId]);

  const fetchMatches = useCallback(async () => {
    setIsMatchesLoading(true);
    try {
      const response = await axiosInstance.get(
        `/api/division/${divisionId}/matches`
      );
      const matchesData =
        response.data?.data || response.data?.matches || response.data || [];
      setMatches(Array.isArray(matchesData) ? matchesData : []);
    } catch (error) {
      logger.debug("Matches endpoint not available or no matches found");
      setMatches([]);
    } finally {
      setIsMatchesLoading(false);
    }
  }, [divisionId]);

  const refreshAllData = useCallback(async () => {
    await Promise.all([fetchDivision(), fetchPlayers(), fetchMatches()]);
  }, [fetchDivision, fetchPlayers, fetchMatches]);

  const handlePlayersUpdated = useCallback(async () => {
    await fetchPlayers();
    await fetchDivision();
  }, [fetchPlayers, fetchDivision]);

  useEffect(() => {
    if (divisionId) {
      fetchDivision();
      fetchPlayers();
      fetchMatches();
    }
  }, [divisionId, fetchDivision, fetchPlayers, fetchMatches]);

  if (isLoading || !division) {
    return (
      <>
        <SiteHeader
          items={[
            { label: "Divisions", href: "/divisions" },
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
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader
        items={[
          { label: "Divisions", href: "/divisions" },
          { label: division.name },
        ]}
      />
      <div className="space-y-6 p-8">
        {/* Back button and title */}
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/divisions">
              <IconChevronLeft className="mr-1 size-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{division.name}</h1>
            <p className="text-sm text-muted-foreground">
              Manage division details, players, and matches
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <IconUserCircle className="size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="players" className="flex items-center gap-2">
            <IconUsers className="size-4" />
            Players
            <span className="ml-1 text-xs text-muted-foreground">
              ({players.length})
            </span>
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex items-center gap-2">
            <IconTrophy className="size-4" />
            Matches
          </TabsTrigger>
          <TabsTrigger value="standings" className="flex items-center gap-2">
            <IconTarget className="size-4" />
            Standings
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <IconSettings className="size-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              <DivisionOverviewStats division={division} playersCount={players.length} />
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <DivisionDetailsSection division={division} onDivisionUpdated={fetchDivision} />
                </div>
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <IconSettings className="size-4" />
                        Quick Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground">Season</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Name</span>
                            <span className="font-medium text-sm">
                              {(division as any).season?.name || "Not assigned"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground">Configuration</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Auto Assignment</span>
                            <Badge variant={division.autoAssignmentEnabled ? "default" : "secondary"}>
                              {division.autoAssignmentEnabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Rating Threshold</span>
                            <span className="font-medium text-sm">
                              {division.threshold ? `${division.threshold} pts` : "None"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground">Prize & Sponsor</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Prize Pool</span>
                            <span className="font-medium text-sm text-green-600">
                              {division.prizePoolTotal
                                ? `MYR ${division.prizePoolTotal.toLocaleString()}`
                                : "Not set"}
                            </span>
                          </div>
                          {division.sponsoredDivisionName && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Sponsor</span>
                              <Badge variant="outline" className="text-xs">
                                {division.sponsoredDivisionName}
                              </Badge>
                            </div>
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
            <DivisionPlayersCard
              divisionId={divisionId}
              players={players}
              isLoading={isPlayersLoading}
              division={division}
              onPlayersUpdated={handlePlayersUpdated}
            />
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches">
            <DivisionMatchesCard
              divisionId={divisionId}
              matches={matches}
              isLoading={isMatchesLoading}
              gameType={division.gameType}
            />
          </TabsContent>

          {/* Standings Tab */}
          <TabsContent value="standings">
            <DivisionStandingsCard
              divisionId={divisionId}
              players={players}
              isLoading={isPlayersLoading}
              gameType={division.gameType}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <DivisionSettingsCard division={division} onDivisionUpdated={fetchDivision} />
          </TabsContent>
        </Suspense>
      </Tabs>
      </div>
    </>
  );
}
