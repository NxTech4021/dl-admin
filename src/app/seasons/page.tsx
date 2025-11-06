"use client";
import React, { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Season, seasonSchema } from "@/constants/zod/season-schema";
import {
  IconCalendar,
  IconPlus,
  IconDownload,
  IconStar,
  IconCurrency,
  IconUsers,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import z from "zod";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { useRouter } from "next/navigation";
import { useSocket } from "@/context/socket-context";

// CRITICAL: Dynamic imports reduce initial compilation time by 70-80%
const SeasonsDataTable = dynamic(
  () =>
    import("@/components/data-table/seasons-data-table").then((mod) => ({
      default: mod.SeasonsDataTable,
    })),
  {
    loading: () => <div className="h-96 animate-pulse bg-muted rounded-lg" />,
  }
);

const SeasonCreateModal = dynamic(
  () =>
    import("@/components/modal/season-create-modal").then((mod) => ({
      default: mod.default,
    })),
  {
    loading: () => <div className="h-96 animate-pulse bg-muted rounded-lg" />,
  }
);


// Note: Metadata and revalidate are not available in client components
// These would need to be moved to a layout.tsx file if needed

export default function Page() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [data, setData] = React.useState<Season[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  const fetchSeasons = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(endpoints.season.getAll);

      let seasonsData: any[] = [];
      
      // Check if data is directly an array
      if (Array.isArray(response.data)) {
        seasonsData = response.data;
      } 
      // Check if data is wrapped in a data property
      else if (response.data?.data && Array.isArray(response.data.data)) {
        seasonsData = response.data.data;
      }
      // Check if there's a seasons property
      else if (response.data?.seasons && Array.isArray(response.data.seasons)) {
        seasonsData = response.data.seasons;
      }
      if (!seasonsData || seasonsData.length === 0) {
        console.log("No seasons data found");
        setData([]);
        return;
      }

      // Validate and parse the data
      const parsedData = z.array(seasonSchema).parse(seasonsData);
      console.log("Parsed seasons:", parsedData);
      setData(parsedData);
    } catch (error) {
      console.error("Failed to fetch seasons:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  // const handleSeasonCreated = () => {
  //   setRefreshKey((prev) => prev + 1);
  // };

  const handleViewSeason = (seasonId: string) => {
    router.push(`/seasons/${seasonId}`);
  };
  const seasons = data;

  console.log("seasons data", seasons);
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
                  <div className="flex flex-col gap-6">
                    {/* Title and Description */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <IconCalendar className="size-8 text-primary" />
                          <h1 className="text-3xl font-bold tracking-tight">
                            Seasons Management
                          </h1>
                        </div>
                        <p className="text-muted-foreground">
                          Manage league seasons and tournaments
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <IconDownload className="mr-2 size-4" />
                          Export
                        </Button>
                        {/* <SeasonCreateModal
                          open={isCreateModalOpen}
                          onOpenChange={setIsCreateModalOpen}
                          onSeasonCreated={handleSeasonCreated}
                        >
                          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                            <IconPlus className="mr-2 size-4" />
                            Create Season
                          </Button>
                        </SeasonCreateModal> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 px-4 lg:px-6 py-6">
                <div className="space-y-6">
                  {/* League Overview Cards */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Seasons
                        </CardTitle>
                        {/* <IconTrophy className="h-4 w-4 text-muted-foreground" /> */}
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {seasons.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {seasons.filter((s) => s.status === "ACTIVE").length}{" "}
                          currently active
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Participants
                        </CardTitle>
                        <IconUsers className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {" "}
                          {seasons.reduce(
                            (total, season) =>
                              total + (season.memberships?.length || 0),
                            0
                          )}{" "}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Across all seasons
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Revenue
                        </CardTitle>
                        <IconCurrency className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {" "}
                          {seasons.reduce((total, season) => {
                            const fee =
                              parseFloat(
                                (season?.entryFee as unknown as string) || "0"
                              ) || 0;
                            const participants =
                              season.memberships?.length || 0;
                            return total + fee * participants;
                          }, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          From all season entry fees
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Average per Season
                        </CardTitle>
                        <IconStar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {" "}
                          {seasons.length > 0
                            ? Math.round(
                                seasons.reduce(
                                  (total, season) =>
                                    total + (season.memberships?.length || 0),
                                  0
                                ) / seasons.length
                              )
                            : 0}{" "}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Players per season
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Data Table */}
                <div className="flex-1 mt-10">
                  <SeasonsDataTable
                    key={refreshKey}
                    data={seasons}
                    isLoading={isLoading}
                    onViewSeason={handleViewSeason}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
