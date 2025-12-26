import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useCallback, lazy, Suspense } from "react";
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
} from "@tabler/icons-react";
import z from "zod";
import axiosInstance, { endpoints } from "@/lib/endpoints";

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

  const leagues = data;

  return (
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
          <StatsGrid columns={3}>
            <StatsCard
              title="Total Leagues"
              value={leagues.length}
              description={`${leagues.filter((l) => l.status === "ACTIVE" || l.status === "ONGOING").length} currently active`}
              icon={IconTrophy}
              loading={isLoading}
            />
            <StatsCard
              title="Total Members"
              value={totalMembers}
              description="Total players across all seasons"
              icon={IconUsers}
              iconColor="text-blue-500"
              loading={isLoading}
            />
            <StatsCard
              title="Total Seasons"
              value={leagues.reduce((sum, league) => sum + (league.seasonCount || 0), 0)}
              description="Across all leagues"
              icon={IconCalendar}
              iconColor="text-green-500"
              loading={isLoading}
            />
          </StatsGrid>
        </PageHeader>

        <div className="flex-1 px-4 lg:px-6 pb-6">
          <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
            <LeaguesDataTable
              data={leagues}
              isLoading={isLoading}
              onDataChange={fetchLeagues}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
