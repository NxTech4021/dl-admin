"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { IconPlus, IconDownload, IconBrandCashapp } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { SponsorsDataTable } from "@/components/data-table/sponsors-data-table";

const CreateSponsorModal = dynamic(
  () =>
    import("@/components/modal/sponsor-create-modal").then((mod) => ({
      default: mod.CreateSponsorModal,
    })),
  {
    loading: () => <div className="h-96 animate-pulse bg-muted rounded-lg" />,
  }
);

export default function Page() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSponsorCreated = async () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <PageHeader
              icon={IconBrandCashapp}
              title="Sponsors"
              description="Manage sponsorship packages and their league assignments"
              actions={
                <>
                  <Button variant="outline" size="sm">
                    <IconDownload className="mr-2 size-4" />
                    Export
                  </Button>
                  <Button size="sm" onClick={() => setCreateModalOpen(true)}>
                    <IconPlus className="mr-2 size-4" />
                    Create Sponsor
                  </Button>
                </>
              }
            />

            {/* Data Table */}
            <div className="flex-1 px-4 lg:px-6 pb-6">
              <SponsorsDataTable refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </div>

        <CreateSponsorModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSponsorCreated={handleSponsorCreated}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
