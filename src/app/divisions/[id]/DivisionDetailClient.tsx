"use client";

import React, { useState, useEffect, useCallback } from "react";
import { notFound, useRouter } from "next/navigation";
import { Division, divisionSchema } from "@/constants/zod/division-schema";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";

import {
  IconUserCircle,
  IconUsers,
  IconTrophy,
  IconTarget,
  IconSettings,
  IconArrowLeft,
  IconEdit,
} from "@tabler/icons-react";

import DivisionOverviewStats from "./components/division/DivisionOverviewStats";
import DivisionDetailsSection from "./components/division/DivisionDetailsSection";
import DivisionPlayersCard from "./components/division/DivisionPlayersCard";
import DivisionMatchesCard from "./components/division/DivisionMatchesCard";
import DivisionStandingsCard from "./components/division/DivisionStandingsCard";
import DivisionSettingsCard from "./components/division/DivisionSettingsCard";

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

export default function DivisionDetailClient({ divisionId }: { divisionId: string }) {
  const router = useRouter();
  const [division, setDivision] = useState<Division | null>(null);
  const [players, setPlayers] = useState<DivisionPlayer[]>([]);
  const [matches, setMatches] = useState<DivisionMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayersLoading, setIsPlayersLoading] = useState(false);
  const [isMatchesLoading, setIsMatchesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { data: session } = useSession();

  const adminId = session?.user.id;

  // Breadcrumb items for header
  const getBreadcrumbItems = () => {
    const baseItems = [
      { label: "Divisions", href: "/divisions" },
      { label: division?.name ?? "Division Details" },
    ];

    switch (activeTab) {
      case "overview":
        return [...baseItems, { label: "Overview" }];
      case "players":
        return [...baseItems, { label: "Players" }];
      case "matches":
        return [...baseItems, { label: "Matches" }];
      case "standings":
        return [...baseItems, { label: "Standings" }];
      case "settings":
        return [...baseItems, { label: "Settings" }];
      default:
        return baseItems;
    }
  };

  // Fetch division data
  const fetchDivision = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(endpoints.division.getById(divisionId));
      const data = response.data?.data || response.data;
      const parsed = divisionSchema.parse(data);
      setDivision(parsed);
    } catch (error) {
      console.error("Failed to fetch division details:", error);
      notFound();
    } finally {
      setIsLoading(false);
    }
  }, [divisionId]);

  // Fetch players assigned to this division
  const fetchPlayers = useCallback(async () => {
    setIsPlayersLoading(true);
    try {
      const response = await axiosInstance.get(
        endpoints.division.getDivisionAssignments(divisionId)
      );
      const playersData = response.data?.data || response.data?.players || response.data || [];
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
      console.error("Failed to fetch division players:", error);
      setPlayers([]);
    } finally {
      setIsPlayersLoading(false);
    }
  }, [divisionId]);

  // Fetch matches for this division (placeholder - adjust endpoint as needed)
  const fetchMatches = useCallback(async () => {
    setIsMatchesLoading(true);
    try {
      // This endpoint may need to be created or adjusted based on your backend
      const response = await axiosInstance.get(`/api/division/${divisionId}/matches`);
      const matchesData = response.data?.data || response.data?.matches || response.data || [];
      setMatches(Array.isArray(matchesData) ? matchesData : []);
    } catch (error) {
      // Matches endpoint might not exist yet - silently fail
      console.log("Matches endpoint not available or no matches found");
      setMatches([]);
    } finally {
      setIsMatchesLoading(false);
    }
  }, [divisionId]);

  // Refresh all data
  const refreshAllData = useCallback(async () => {
    await Promise.all([fetchDivision(), fetchPlayers(), fetchMatches()]);
  }, [fetchDivision, fetchPlayers, fetchMatches]);

  // Handle player assignment updates
  const handlePlayersUpdated = useCallback(async () => {
    await fetchPlayers();
    await fetchDivision(); // Refresh division to update counts
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
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader items={[{ label: "Divisions", href: "/divisions" }, { label: "Loading..." }]} />
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
          {/* Header with Back Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/divisions")}
                className="gap-2"
              >
                <IconArrowLeft className="size-4" />
                Back to Divisions
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                  <IconTrophy className="size-6 text-primary" />
                  {division.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={division.isActive ? "default" : "secondary"}
                    className={division.isActive ? "bg-green-100 text-green-800 border-green-200" : ""}
                  >
                    {division.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {division.divisionLevel}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {division.gameType}
                  </Badge>
                  {division.genderCategory && (
                    <Badge variant="outline" className="capitalize">
                      {division.genderCategory}
                    </Badge>
                  )}
                </div>
              </div>
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

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="space-y-6">
                <DivisionOverviewStats division={division} playersCount={players.length} />
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <DivisionDetailsSection
                      division={division}
                      onDivisionUpdated={fetchDivision}
                    />
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
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Season</span>
                            <span className="font-medium text-sm">
                              {(division as any).season?.name || "Not assigned"}
                            </span>
                          </div>
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
                              <span className="font-medium text-sm">
                                {division.sponsoredDivisionName}
                              </span>
                            </div>
                          )}
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
              <DivisionSettingsCard
                division={division}
                onDivisionUpdated={fetchDivision}
              />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
