"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/ui/page-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { IconCategory, IconPlus } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { DivisionStatsCards } from "@/components/division/division-stats-cards";

const DivisionsDataTable = dynamic(() => import("@/components/data-table/divisions-data-table").then(mod => ({ default: mod.DivisionsDataTable })), {
  loading: () => <div className="h-96 animate-pulse bg-muted rounded-lg" />
})

const DivisionCreateModal = dynamic(() => import("@/components/modal/division-create-modal").then(mod => ({ default: mod.default })), {
  loading: () => <div className="h-96 animate-pulse bg-muted rounded-lg" />
})


export default function Page() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: session} = useSession();

  const adminId = session?.user.id;

  const handleDivisionCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

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
            {/* Page Header */}
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
                  <DivisionCreateModal
                    open={isCreateModalOpen}
                    onOpenChange={setIsCreateModalOpen}
                    onDivisionCreated={handleDivisionCreated}
                    adminId={adminId}
                  />
                </>
              }
            >
              {/* Statistics Cards */}
              <DivisionStatsCards />
            </PageHeader>

            {/* Data Table */}
            <div className="flex-1 px-4 lg:px-6 pb-6">
              <DivisionsDataTable key={refreshKey} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
