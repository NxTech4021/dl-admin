import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { PlayersDataTable } from "@/components/players-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconPlus, IconDownload, IconUsers } from "@tabler/icons-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Players",
  description: "DeuceLeague Players Management",
  icons: {
    icon: "/dl-logo.svg",
    shortcut: "/dl-logo.svg",
    apple: "/dl-logo.svg",
  },
};

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
            <div className="flex flex-col gap-6">
              {/* Page Header */}
              <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-4 lg:px-6 py-6">
                  <div className="flex flex-col gap-6">
                    {/* Title and Description */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <IconUsers className="size-8 text-primary" />
                          <h1 className="text-3xl font-bold tracking-tight">Players</h1>
                        </div>
                        {/* <p className="text-muted-foreground">
                          Manage and view all registered players
                        </p> */}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <IconDownload className="mr-2 size-4" />
                          Export
                        </Button>
                        <Button size="sm">
                          <IconPlus className="mr-2 size-4" />
                          Add Player
                        </Button>
                      </div>
                    </div>
                    
                    {/* Statistics */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="flex items-center gap-3 rounded-lg border p-4">
                        <div className="rounded-full bg-primary/10 p-2">
                          <IconUsers className="size-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">6</p>
                          <p className="text-sm text-muted-foreground">Total Players</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border p-4">
                        <div className="rounded-full bg-green-500/10 p-2">
                          <div className="size-4 rounded-full bg-green-500"></div>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">5</p>
                          <p className="text-sm text-muted-foreground">Active</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border p-4">
                        <div className="rounded-full bg-yellow-500/10 p-2">
                          <div className="size-4 rounded-full bg-yellow-500"></div>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">1</p>
                          <p className="text-sm text-muted-foreground">Inactive</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border p-4">
                        <div className="rounded-full bg-blue-500/10 p-2">
                          <div className="size-4 rounded-full bg-blue-500"></div>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">5</p>
                          <p className="text-sm text-muted-foreground">Verified</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Data Table */}
              <div className="flex-1">
                <PlayersDataTable />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
