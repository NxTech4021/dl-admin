"use client";

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { IconCalendar, IconPlus, IconDownload } from "@tabler/icons-react"
import dynamic from "next/dynamic"
import { useState } from "react"
import { useSession } from "@/lib/auth-client";
// import { DivisionsDataTable } from "@/components/data-table/divisions-data-table";
 

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
            <div className="flex flex-col gap-6">
              {/* Page Header */}
              <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-4 lg:px-6 py-6">
                  <div className="flex flex-col gap-6">
                    {/* Title and Description */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <IconCalendar className="size-8 text-primary" />
                          <h1 className="text-3xl font-bold tracking-tight">Divisions</h1>
                        </div>
                        <p className="text-muted-foreground">
                          Manage league divisions
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <IconDownload className="mr-2 size-4" />
                          Export
                        </Button>
                        <DivisionCreateModal
                          open={isCreateModalOpen}
                          onOpenChange={setIsCreateModalOpen}
                          onDivisionCreated={handleDivisionCreated}
                          adminId= {adminId}
                        >
                          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                            <IconPlus className="mr-2 size-4" />
                            Create Division
                          </Button>
                        </DivisionCreateModal>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Data Table */}
              <div className="flex-1">
                <DivisionsDataTable key={refreshKey} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
