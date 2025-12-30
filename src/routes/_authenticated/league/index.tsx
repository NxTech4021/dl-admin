import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useCallback, lazy, Suspense, useMemo } from "react";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { StatsGrid } from "@/components/ui/stats-grid";
import { Button } from "@/components/ui/button";
import { League, leagueSchema } from "@/constants/zod/league-schema";
import { type ApiLeagueResponse, type ApiSeasonResponse } from "@/constants/types/league";
import {
  IconTrophy,
  IconPlus,
  IconUsers,
  IconCalendar,
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

const LeaguesDataTable = lazy(() =>
  import("@/components/data-table/leagues-data-table").then((mod) => ({
    default: mod.LeaguesDataTable,
  }))
);

const LeagueCreateModal = lazy(() =>
  import("@/components/modal/league-create-modal").then((mod) => ({
    default: mod.default,
  }))
);

export const Route = createFileRoute("/_authenticated/league/")({
  component: LeaguePage,
});

function LeaguePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [data, setData] = React.useState<League[]>([]);
  const [totalMembers, setTotalMembers] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState<string | undefined>(undefined);
  const [locationFilter, setLocationFilter] = useState<string | undefined>(undefined);

  // Get unique locations from data for the filter dropdown
  const locationOptions = useMemo(() => {
    const locations = [...new Set(data.map(l => l.location).filter(Boolean))] as string[];
    return locations.sort().map(loc => ({ value: loc, label: loc }));
  }, [data]);

  const hasActiveFilters = searchQuery || sportFilter || locationFilter;

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSportFilter(undefined);
    setLocationFilter(undefined);
  }, []);

  const fetchLeagues = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(endpoints.league.getAll);

      if (!response.data || !response.data.data || !response.data.data.leagues) {
        setData([]);
        return;
      }

      const leaguesData = response.data.data.leagues;
      const totalMembersData = response.data.data.totalMembers || 0;

      setTotalMembers(totalMembersData);

      const transformedData = leaguesData.map((league: ApiLeagueResponse) => {
        const totalMembersInLeague =
          league.seasons?.reduce((sum: number, season: ApiSeasonResponse) => {
            const memberships = season._count?.memberships || 0;
            return sum + memberships;
          }, 0) || 0;

        return {
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
          memberCount: totalMembersInLeague,
          seasonCount: league._count?.seasons || 0,
          categoryCount: league._count?.categories || 0,
        };
      });

      const parsedData = z.array(leagueSchema).parse(transformedData);
      setData(parsedData);
    } catch {
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLeagues();
  }, [fetchLeagues]);

  const handleLeagueCreated = async () => {
    await fetchLeagues();
  };

  const exportToCSV = useCallback(() => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Name", "Sport", "Location", "Status", "Game Type", "Players", "Seasons", "Created At"];

    const rows = data.map(l => [
      l.name,
      l.sportType || "",
      l.location || "",
      l.status || "",
      l.gameType || "",
      l.memberCount || 0,
      l.seasonCount || 0,
      l.createdAt
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leagues-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Leagues exported successfully");
  }, [data]);

  const leagues = data;

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <PageHeader
            icon={IconTrophy}
            title="League Management"
          description="Manage leagues, seasons, and player memberships"
          actions={
            <>
              <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <IconPlus className="mr-2 size-4" />
                Create League
              </Button>
              <Suspense fallback={null}>
                <LeagueCreateModal
                  open={isCreateModalOpen}
                  onOpenChange={setIsCreateModalOpen}
                  onLeagueCreated={handleLeagueCreated}
                />
              </Suspense>
            </>
          }
        >
          <AnimatedStatsGrid className="grid gap-4 grid-cols-2 md:grid-cols-3">
            <AnimatedStatsCard>
              <StatsCard
                title="Total Leagues"
                value={leagues.length}
                description={`${leagues.filter((l) => l.status === "ACTIVE" || l.status === "ONGOING").length} currently active`}
                icon={IconTrophy}
                loading={isLoading}
              />
            </AnimatedStatsCard>
            <AnimatedStatsCard>
              <StatsCard
                title="Total Members"
                value={totalMembers}
                description="Total players across all seasons"
                icon={IconUsers}
                iconColor="text-blue-500"
                loading={isLoading}
              />
            </AnimatedStatsCard>
            <AnimatedStatsCard>
              <StatsCard
                title="Total Seasons"
                value={leagues.reduce((sum, league) => sum + (league.seasonCount || 0), 0)}
                description="Across all leagues"
                icon={IconCalendar}
                iconColor="text-green-500"
                loading={isLoading}
              />
            </AnimatedStatsCard>
          </AnimatedStatsGrid>

          {/* Filter Bar */}
          <AnimatedFilterBar>
            <div className="flex items-center gap-2 w-full">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search leagues..."
                className="w-[220px]"
              />
              <FilterSelect
                value={sportFilter}
                onChange={setSportFilter}
                options={SPORT_OPTIONS}
                allLabel="All Sports"
                triggerClassName="w-[140px]"
              />
              {locationOptions.length > 0 && (
                <FilterSelect
                  value={locationFilter}
                  onChange={setLocationFilter}
                  options={locationOptions}
                  allLabel="All Locations"
                  triggerClassName="w-[160px]"
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
                <Button variant="outline" size="sm" onClick={fetchLeagues} className="cursor-pointer">
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
              <LeaguesDataTable
                data={leagues}
                isLoading={isLoading}
                onDataChange={fetchLeagues}
                searchQuery={searchQuery}
                sportFilter={sportFilter}
                locationFilter={locationFilter}
              />
            </Suspense>
          </div>
        </AnimatedContainer>
        </div>
      </div>
    </>
  );
}
