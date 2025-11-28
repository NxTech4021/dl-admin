"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { IconPlus, IconDownload, IconUsers } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { PlayerStatsRefactored } from "@/components/player-stats-refactored";

// Dynamic imports for performance
const PlayersDataTable = dynamic(
  () =>
    import("@/components/data-table/players-data-table").then((mod) => ({
      default: mod.PlayersDataTable,
    })),
  {
    loading: () => <div className="h-96 animate-pulse bg-muted rounded-lg" />,
  }
);

export default function Page() {
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
            {/* Industry-Standard Page Header */}
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
              {/* Statistics Cards */}
              <PlayerStatsRefactored />
            </PageHeader>

            {/* Data Table */}
            <div className="flex-1 px-4 lg:px-6 pb-6">
              <PlayersDataTable />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
