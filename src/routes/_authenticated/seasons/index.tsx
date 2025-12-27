import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { lazy, Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { StatsGrid } from "@/components/ui/stats-grid";
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
import {
  AnimatedStatsGrid,
  AnimatedStatsCard,
  AnimatedContainer,
} from "@/components/ui/animated-container";

const SeasonsDataTable = lazy(() =>
  import("@/components/data-table/seasons-data-table").then((mod) => ({
    default: mod.SeasonsDataTable,
  }))
);

export const Route = createFileRoute("/_authenticated/seasons/")({
  component: SeasonsPage,
});

function SeasonsPage() {
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

      if (Array.isArray(response.data)) {
        seasonsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        seasonsData = response.data.data;
      } else if (response.data?.seasons && Array.isArray(response.data.seasons)) {
        seasonsData = response.data.seasons;
      }

      if (!seasonsData || seasonsData.length === 0) {
        setData([]);
        return;
      }

      const parsedData = z.array(seasonSchema).parse(seasonsData);
      setData(parsedData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch seasons:", err);

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
    navigate({ to: "/seasons/$seasonId", params: { seasonId } });
  };

  const seasons = data;

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
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
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
            </>
          }
        >
          <AnimatedStatsGrid className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <AnimatedStatsCard>
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
            </AnimatedStatsCard>
            <AnimatedStatsCard>
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
            </AnimatedStatsCard>
            <AnimatedStatsCard>
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
            </AnimatedStatsCard>
            <AnimatedStatsCard>
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
            </AnimatedStatsCard>
          </AnimatedStatsGrid>
        </PageHeader>

        <AnimatedContainer delay={0.2}>
          <div className="flex-1 px-4 lg:px-6 pb-6">
            <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
              <SeasonsDataTable
                data={seasons}
                isLoading={isLoading}
                onViewSeason={handleViewSeason}
                onRefresh={fetchSeasons}
              />
            </Suspense>
          </div>
        </AnimatedContainer>
        </div>
      </div>
    </>
  );
}
