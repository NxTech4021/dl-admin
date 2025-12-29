import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { IconPlus, IconDownload, IconUsers, IconRefresh } from "@tabler/icons-react";
import { lazy, Suspense, useState, useCallback } from "react";
import { PlayerStatsRefactored } from "@/components/player-stats-refactored";
import { AnimatedContainer, AnimatedFilterBar } from "@/components/ui/animated-container";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect, type FilterOption } from "@/components/ui/filter-select";

const PlayersDataTable = lazy(() =>
  import("@/components/data-table/players-data-table").then((mod) => ({
    default: mod.PlayersDataTable,
  }))
);

export const Route = createFileRoute("/_authenticated/players/")({
  component: PlayersPage,
});

function PlayersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState<string | undefined>(undefined);
  const [locationFilter, setLocationFilter] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSportFilter(undefined);
    setLocationFilter(undefined);
  }, []);

  const hasActiveFilters = searchQuery || sportFilter || locationFilter;

  return (
    <>
      <SiteHeader />
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

            {/* Filter Bar */}
            <AnimatedFilterBar>
              <div className="flex items-center gap-2 w-full">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search players..."
                  className="w-[220px]"
                />
                <FilterSelect
                  value={sportFilter}
                  onChange={setSportFilter}
                  options={[
                    { value: "tennis", label: "Tennis" },
                    { value: "padel", label: "Padel" },
                    { value: "pickleball", label: "Pickleball" },
                  ]}
                  allLabel="All Sports"
                  triggerClassName="w-[140px]"
                />
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
                  <Button variant="outline" size="sm" onClick={handleRefresh} className="cursor-pointer">
                    <IconRefresh className="mr-2 size-4" />
                    Refresh
                  </Button>
                </div>
              </div>
            </AnimatedFilterBar>
          </PageHeader>

          <div className="flex-1 px-4 lg:px-6 pb-6">
            <AnimatedContainer delay={0.1}>
              <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
                <PlayersDataTable
                  key={refreshKey}
                  searchQuery={searchQuery}
                  sportFilter={sportFilter}
                  locationFilter={locationFilter}
                />
              </Suspense>
            </AnimatedContainer>
          </div>
        </div>
      </div>
    </>
  );
}
