import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { IconPlus, IconDownload, IconUsers } from "@tabler/icons-react";
import { lazy, Suspense } from "react";
import { PlayerStatsRefactored } from "@/components/player-stats-refactored";

const PlayersDataTable = lazy(() =>
  import("@/components/data-table/players-data-table").then((mod) => ({
    default: mod.PlayersDataTable,
  }))
);

export const Route = createFileRoute("/_authenticated/players/")({
  component: PlayersPage,
});

function PlayersPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <PageHeader
          icon={IconUsers}
          title="Players"
          description="Manage and view all registered players in the system"
          actions={
            <>
              <Button variant="outline" size="sm">
                <IconDownload className="mr-2 size-4" />
                Export
              </Button>
              <Button size="sm">
                <IconPlus className="mr-2 size-4" />
                Add Player
              </Button>
            </>
          }
        >
          <PlayerStatsRefactored />
        </PageHeader>

        <div className="flex-1 px-4 lg:px-6 pb-6">
          <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
            <PlayersDataTable />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
