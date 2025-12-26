import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { IconCategory, IconPlus } from "@tabler/icons-react";
import { lazy, Suspense, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { DivisionStatsCards } from "@/components/division/division-stats-cards";

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

function DivisionsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: session } = useSession();

  const adminId = session?.user.id;

  const handleDivisionCreated = () => {
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
        </PageHeader>

        <div className="flex-1 px-4 lg:px-6 pb-6">
          <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
            <DivisionsDataTable key={refreshKey} />
          </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
