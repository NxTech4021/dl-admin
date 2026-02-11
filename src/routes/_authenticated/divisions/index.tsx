import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { IconCategory, IconPlus, IconDownload, IconRefresh } from "@tabler/icons-react";
import { lazy, Suspense, useState, useCallback, useEffect } from "react";
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
import { toast } from "sonner";
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

interface Season {
  id: string;
  name: string;
}

function DivisionsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("all");
  const { data: session } = useSession();

  const adminId = session?.user.id;

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
    fetchSeasons();
  }, [fetchSeasons]);

  const handleDivisionCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleExport = useCallback(() => {
    toast.info("Export functionality is available in the table");
  }, []);

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
                <Select value={selectedSeasonId} onValueChange={setSelectedSeasonId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by season" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Seasons</SelectItem>
                    {seasons.map((season) => (
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
