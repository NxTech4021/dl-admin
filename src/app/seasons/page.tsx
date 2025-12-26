"use client";
import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { StatsGrid } from "@/components/ui/stats-grid";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Season, seasonSchema } from "@/constants/zod/season-schema";
import {
  IconCalendar,
  IconDownload,
  IconStar,
  IconCurrency,
  IconUsers,
  IconTrophy,
} from "@tabler/icons-react";

import z from "zod";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { useNavigate } from "@tanstack/react-router";

// Dynamic imports for performance
const SeasonsDataTable = dynamic(
  () =>
    import("@/components/data-table/seasons-data-table").then((mod) => ({
      default: mod.SeasonsDataTable,
    })),
  {
    loading: () => <div className="h-96 animate-pulse bg-muted rounded-lg" />,
  }
);

export default function Page() {
  const [data, setData] = React.useState<Season[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const fetchSeasons = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

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
        setData([]);
        return;
      }

      // Validate and parse the data
      const parsedData = z.array(seasonSchema).parse(seasonsData);
      setData(parsedData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch seasons:", err);

      // Provide user-friendly error messages
      if (err instanceof z.ZodError) {
        setError("Invalid data format");
        console.error("Validation errors:", err.issues);
      } else if (err instanceof Error) {
        if (err.message.includes("Network Error")) {
          setError("Network error");
        } else if (err.message.includes("timeout")) {
          setError("Request timeout");
        } else if (err.message.includes("401") || err.message.includes("403")) {
          setError("Access denied");
        } else {
          setError("Failed to load");
        }
      } else {
        setError("Unexpected error");
      }

      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  const handleViewSeason = (seasonId: string) => {
    navigate({ to: `/seasons/${seasonId}` });
  };

  const seasons = data;

  // Calculate stats
  const totalSeasons = seasons.length;
  const activeSeasons = seasons.filter((s) => s.status === "ACTIVE").length;
  const totalParticipants = seasons.reduce(
    (total, season) => total + (season.memberships?.length || 0),
    0
  );
  const totalRevenue = seasons.reduce((total, season) => {
    const fee = parseFloat((season?.entryFee as unknown as string) || "0") || 0;
    const participants = season.memberships?.length || 0;
    return total + fee * participants;
  }, 0);
  const averageParticipants = totalSeasons > 0
    ? Math.round(totalParticipants / totalSeasons)
    : 0;

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
            {/* Industry-Standard Page Header */}
            <PageHeader
              icon={IconCalendar}
              title="Seasons Management"
              description="Manage league seasons and tournaments"
              actions={
                <>
                  <Button variant="outline" size="sm">
                    <IconDownload className="mr-2 size-4" />
                    Export
                  </Button>
                  {/* <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                    <IconPlus className="mr-2 size-4" />
                    Create Season
                  </Button> */}
                </>
              }
            >
              <StatsGrid>
                <StatsCard
                  title="Total Seasons"
                  value={totalSeasons}
                  description={`${activeSeasons} currently active`}
                  icon={IconTrophy}
                  iconColor="text-primary"
                  loading={isLoading}
                  error={error}
                  onRetry={fetchSeasons}
                />
                <StatsCard
                  title="Total Participants"
                  value={totalParticipants}
                  description="Across all seasons"
                  icon={IconUsers}
                  iconColor="text-blue-500"
                  loading={isLoading}
                  error={error}
                  onRetry={fetchSeasons}
                />
                <StatsCard
                  title="Total Revenue"
                  value={`RM ${totalRevenue.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  description="From all season entry fees"
                  icon={IconCurrency}
                  iconColor="text-green-500"
                  loading={isLoading}
                  error={error}
                  onRetry={fetchSeasons}
                />
                <StatsCard
                  title="Average per Season"
                  value={averageParticipants}
                  description="Players per season"
                  icon={IconStar}
                  iconColor="text-yellow-500"
                  loading={isLoading}
                  error={error}
                  onRetry={fetchSeasons}
                />
              </StatsGrid>
            </PageHeader>

            {/* Data Table */}
            <div className="flex-1 px-4 lg:px-6 pb-6">
              <SeasonsDataTable
                data={seasons}
                isLoading={isLoading}
                onViewSeason={handleViewSeason}
                onRefresh={fetchSeasons}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
