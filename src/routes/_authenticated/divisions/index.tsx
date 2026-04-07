import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { IconCategory, IconPlus, IconRefresh } from "@tabler/icons-react";
import { lazy, Suspense, useState, useCallback, useEffect, useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import { DivisionStatsCards } from "@/components/division/division-stats-cards";
import { AnimatedContainer, AnimatedFilterBar } from "@/components/ui/animated-container";
import { SearchInput } from "@/components/ui/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { logger } from "@/lib/logger";

const DivisionsDataTable = lazy(() =>
  import("@/components/data-table/divisions-data-table").then((mod) => ({
    default: mod.DivisionsDataTable,
  }))
);

const DivisionCreateModal = lazy(() =>
  import("@/components/modal/division-create-modal").then((mod) => ({
    default: mod.default,
  }))
);

export const Route = createFileRoute("/_authenticated/divisions/")({
  component: DivisionsPage,
});

interface League {
  id: string;
  name: string;
}

interface Season {
  id: string;
  name: string;
  leagues?: Array<{ id: string; name: string }>;
}

function DivisionsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [leagues, setLeagues] = useState<League[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("all");
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("all");
  const { data: session } = useSession();

  const adminId = session?.user.id;

  const fetchLeagues = useCallback(async () => {
    try {
      const response = await axiosInstance.get(endpoints.league.getAll);
      const leaguesData = response.data?.data ?? response.data ?? [];
      setLeagues(Array.isArray(leaguesData) ? leaguesData : []);
    } catch (error) {
      logger.error("Failed to fetch leagues:", error);
    }
  }, []);

  const fetchSeasons = useCallback(async () => {
    try {
      const response = await axiosInstance.get(endpoints.season.getAll);
      const seasonsData = response.data?.data ?? [];
      setSeasons(Array.isArray(seasonsData) ? seasonsData : []);
    } catch (error) {
      logger.error("Failed to fetch seasons:", error);
    }
  }, []);

  useEffect(() => {
    fetchLeagues();
    fetchSeasons();
  }, [fetchLeagues, fetchSeasons]);

  // Filter seasons by selected league
  const filteredSeasons = useMemo(() => {
    if (selectedLeagueId === "all") return seasons;
    return seasons.filter((season) =>
      season.leagues?.some((league) => league.id === selectedLeagueId)
    );
  }, [seasons, selectedLeagueId]);

  const handleLeagueChange = useCallback((leagueId: string) => {
    setSelectedLeagueId(leagueId);
    setSelectedSeasonId("all");
  }, []);

  const handleDivisionCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <PageHeader
            icon={IconCategory}
            title="Divisions"
            description="Manage league divisions and player assignments"
            actions={
              <>
                <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                  <IconPlus className="mr-2 size-4" />
                  Create Division
                </Button>
                <Suspense fallback={null}>
                  <DivisionCreateModal
                    open={isCreateModalOpen}
                    onOpenChange={setIsCreateModalOpen}
                    onDivisionCreated={handleDivisionCreated}
                    adminId={adminId}
                  />
                </Suspense>
              </>
            }
          >
            <DivisionStatsCards />

            {/* Filter Bar */}
            <AnimatedFilterBar>
              <div className="flex items-center gap-2 w-full">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search divisions..."
                  className="w-[220px]"
                />
                <Select value={selectedLeagueId} onValueChange={handleLeagueChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by league" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Leagues</SelectItem>
                    {leagues.map((league) => (
                      <SelectItem key={league.id} value={league.id}>
                        {league.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedSeasonId} onValueChange={setSelectedSeasonId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by season" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Seasons</SelectItem>
                    {filteredSeasons.map((season) => (
                      <SelectItem key={season.id} value={season.id}>
                        {season.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 ml-auto">
                  <Button variant="outline" size="sm" onClick={handleRefresh} className="cursor-pointer">
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
                <DivisionsDataTable
                  key={refreshKey}
                  searchQuery={searchQuery}
                  selectedSeasonId={selectedSeasonId}
                />
              </Suspense>
            </div>
          </AnimatedContainer>
        </div>
      </div>
    </>
  );
}
