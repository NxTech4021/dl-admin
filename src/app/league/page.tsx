"use client";
import React, {useEffect, useState} from "react";
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { League, leagueSchema } from "@/ZodSchema/league-schema";
import { IconTrophy, IconPlus, IconUsers, IconTarget, IconCalendar } from "@tabler/icons-react"
import dynamic from "next/dynamic"
import z from "zod";
import axiosInstance, { endpoints } from "@/lib/endpoints";

// CRITICAL: Dynamic imports reduce initial compilation time by 70-80%
const LeaguesDataTable = dynamic(() => import("@/components/data-table/leagues-data-table").then(mod => ({ default: mod.LeaguesDataTable })), {
  loading: () => <div className="h-96 animate-pulse bg-muted rounded-lg" />
})

const LeagueCreateModal = dynamic(() => import("@/components/modal/league-create-modal").then(mod => ({ default: mod.default })), {
  loading: () => <div className="h-96 animate-pulse bg-muted rounded-lg" />
})

// Note: Metadata and revalidate are not available in client components
// These would need to be moved to a layout.tsx file if needed

export default function Page() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [data, setData] = React.useState<League[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchLeagues = React.useCallback(async () => {
    setIsLoading(true);
    let response;
    try {
      response = await axiosInstance.get(endpoints.league.getAll);

      console.log("leagues response:", response.data)
  
      // Handle ApiResponse structure from backend
      if (!response.data || !response.data.data || !response.data.data.leagues) {
        console.log("No leagues data found in response");
        setData([]);
        return;
      }

      const leaguesData = response.data.data.leagues;
      
      // Debug: Log raw league data to see joinType values
      console.log("Raw leagues data from API:", leaguesData);
      console.log("First league joinType:", leaguesData[0]?.joinType);
      
      // Transform the data to match our schema
      const transformedData = leaguesData.map((league: any) => ({
        id: league.id,
        name: league.name,
        location: league.location,
        description: league.description,
        status: league.status,
        sportType: league.sportType,
        joinType: league.joinType,
        registrationType: league.registrationType,
        gameType: league.gameType,
        createdById: league.createdById,
        createdAt: league.createdAt,
        updatedAt: league.updatedAt,
        // Add computed fields from _count
        memberCount: league._count?.memberships || 0,
        seasonCount: league._count?.seasons || 0,
        categoryCount: league._count?.categories || 0,
      }));

      const parsedData = z.array(leagueSchema).parse(transformedData);
      setData(parsedData);
    } catch (error) {
      console.error("Failed to fetch leagues:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
      fetchLeagues();
    }, [fetchLeagues]);

  // Refresh data when user returns to the page (e.g., after editing a league)
  React.useEffect(() => {
    const handleFocus = () => {
      // Only refresh if we're not already loading
      if (!isLoading) {
        fetchLeagues();
      }
    };

    const handleVisibilityChange = () => {
      // Refresh when page becomes visible again
      if (!document.hidden && !isLoading) {
        fetchLeagues();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchLeagues, isLoading]);

  const handleLeagueCreated = async () => {
    // Immediately refetch leagues to show the new one
    // The modal will close itself via onOpenChange
    await fetchLeagues();
    
    // Increment refresh key to force table re-render if needed
    setRefreshKey(prev => prev + 1);
  };

  const leagues = data;

  console.log("leagues Data", leagues)
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6">
              {/* Page Header */}
              <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-4 lg:px-6 py-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <IconTrophy className="size-8 text-primary" />
                      <h1 className="text-3xl font-bold tracking-tight">League Management</h1>
                    </div>
                    <p className="text-muted-foreground">
                      Manage leagues, tournaments, and competitions
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 px-4 lg:px-6 py-6">
                <div className="space-y-6">
                  {/* League Overview Cards */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Leagues</CardTitle>
                        <IconTrophy className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                      <div className="text-2xl font-bold">{leagues.length}</div>
                        <p className="text-xs text-muted-foreground">
                        {leagues.filter(l => l.status === "ACTIVE" || l.status === "ONGOING").length} currently active
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                        <IconUsers className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {leagues.reduce((sum, league) => sum + (league.memberCount || 0), 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Across all leagues</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Seasons</CardTitle>
                        <IconCalendar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {leagues.reduce((sum, league) => sum + (league.seasonCount || 0), 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Across all leagues</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                        <IconTarget className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {leagues.reduce((sum, league) => sum + (league.categoryCount || 0), 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Across all leagues</p>
                      </CardContent>
                    </Card>
                              </div>
                            </div>
                            
              {/* Data Table */}
              <div className="flex-1 mt-10" >
                <LeaguesDataTable 
                  key={refreshKey} 
                  data={leagues} 
                  isLoading={isLoading}
                  createLeagueButton={
                    <LeagueCreateModal
                      open={isCreateModalOpen}
                      onOpenChange={setIsCreateModalOpen}
                      onLeagueCreated={handleLeagueCreated}
                    >
                      <Button onClick={() => setIsCreateModalOpen(true)}>
                        <IconPlus className="mr-2 size-4" />
                        Create League
                      </Button>
                    </LeagueCreateModal>
                  }
                />
              </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}