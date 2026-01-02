import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { lazy, Suspense, useState, useCallback, useMemo } from "react";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Button } from "@/components/ui/button";
import { Season, seasonSchema } from "@/constants/zod/season-schema";
import { groupSeasonsByName } from "@/lib/group-seasons";
import {
  IconCalendar,
  IconStar,
  IconCurrency,
  IconUsers,
  IconTrophy,
  IconDownload,
  IconRefresh,
} from "@tabler/icons-react";
import z from "zod";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import {
  AnimatedStatsGrid,
  AnimatedStatsCard,
  AnimatedContainer,
  AnimatedFilterBar,
} from "@/components/ui/animated-container";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { toast } from "sonner";

const SPORT_OPTIONS = [
  { value: "TENNIS", label: "Tennis" },
  { value: "PICKLEBALL", label: "Pickleball" },
  { value: "PADEL", label: "Padel" },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState<string | undefined>(undefined);
  const [leagueFilter, setLeagueFilter] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  // Get unique leagues from data for the filter dropdown
  const leagueOptions = useMemo(() => {
    const leagueMap = new Map<string, string>();
    data.forEach(s => {
      s.leagues?.forEach(league => {
        if (league.id && league.name) {
          leagueMap.set(league.id, league.name);
        }
      });
    });
    return Array.from(leagueMap.entries())
      .map(([id, name]) => ({ value: id, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [data]);

  const hasActiveFilters = searchQuery || sportFilter || leagueFilter;

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSportFilter(undefined);
    setLeagueFilter(undefined);
  }, []);

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

  const exportToCSV = useCallback(() => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Name", "Status", "Sport Type", "Category", "Entry Fee", "Players", "Divisions", "Start Date", "End Date", "Deadline", "Payment Required", "Created At"];

    const rows = data.map(s => [
      s.name,
      s.status || "",
      s.sportType || "",
      s.category?.name || "No category",
      s.entryFee || 0,
      s.registeredUserCount || 0,
      s.divisions?.length || 0,
      s.startDate ? new Date(s.startDate).toLocaleDateString() : "",
      s.endDate ? new Date(s.endDate).toLocaleDateString() : "",
      s.regiDeadline ? new Date(s.regiDeadline).toLocaleDateString() : "",
      s.paymentRequired ? "Yes" : "No",
      s.createdAt
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `seasons-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Seasons exported successfully");
  }, [data]);

  const seasons = data;

  // Group seasons by name for the data table
  const groupedSeasons = useMemo(() => {
    return groupSeasonsByName(seasons);
  }, [seasons]);

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

          {/* Filter Bar */}
          <AnimatedFilterBar>
            <div className="flex items-center gap-2 w-full">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search seasons..."
                className="w-[220px]"
              />
              <FilterSelect
                value={sportFilter}
                onChange={setSportFilter}
                options={SPORT_OPTIONS}
                allLabel="All Sports"
                triggerClassName="w-[140px]"
              />
              {leagueOptions.length > 0 && (
                <FilterSelect
                  value={leagueFilter}
                  onChange={setLeagueFilter}
                  options={leagueOptions}
                  allLabel="All Leagues"
                  triggerClassName="w-[180px]"
                />
              )}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Clear all
                </Button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={exportToCSV} className="cursor-pointer">
                  <IconDownload className="mr-2 size-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={fetchSeasons} className="cursor-pointer">
                  <IconRefresh className="mr-2 size-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </AnimatedFilterBar>
        </PageHeader>

        <AnimatedContainer delay={0.2}>
          <div className="flex-1 px-4 lg:px-6 pb-6">
            <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
              <SeasonsDataTable
                data={groupedSeasons}
                isLoading={isLoading}
                onViewSeason={handleViewSeason}
                onRefresh={fetchSeasons}
                searchQuery={searchQuery}
                sportFilter={sportFilter}
                leagueFilter={leagueFilter}
              />
            </Suspense>
          </div>
        </AnimatedContainer>
        </div>
      </div>
    </>
  );
}
