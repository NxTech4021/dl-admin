import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconPlus, IconDownload, IconUsers } from "@tabler/icons-react"
import { Metadata } from "next"
import dynamic from "next/dynamic"

// CRITICAL: Dynamic imports reduce initial compilation time by 70-80%
const PlayersDataTable = dynamic(() => import("@/components/players-data-table").then(mod => ({ default: mod.PlayersDataTable })), {
  loading: () => <div className="h-96 animate-pulse bg-muted rounded-lg" />
})

const PlayerStats = dynamic(() => import("@/components/player-stats").then(mod => ({ default: mod.PlayerStats })), {
  loading: () => <div className="h-32 animate-pulse bg-muted rounded-lg" />
})

// STANDARD: Enable Static Generation with ISR
export const revalidate = 300; // Revalidate every 5 minutes (players data changes less frequently)

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
                    <PlayerStats />
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
