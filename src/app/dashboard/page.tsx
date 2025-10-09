import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TopKPICards } from "@/components/kpi-cards";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// STANDARD: Individual dynamic imports - recommended by Next.js docs
const UserGrowthChart = dynamic(() => 
  import("@/components/user-growth-chart").then(mod => ({ default: mod.UserGrowthChart }))
);

const SportComparisonChart = dynamic(() => 
  import("@/components/sport-comparison-chart").then(mod => ({ default: mod.SportComparisonChart }))
);

const MatchActivityChart = dynamic(() => 
  import("@/components/match-activity-chart").then(mod => ({ default: mod.MatchActivityChart }))
);

// STANDARD: Reusable loading component
const ChartSkeleton = ({ height }: { height: string }) => (
  <div className={`${height} animate-pulse bg-muted rounded-lg flex items-center justify-center`}>
    <div className="text-muted-foreground text-sm">Loading chart...</div>
  </div>
);

// STANDARD: Enable Static Generation with ISR
export const revalidate = 60; // Revalidate every 60 seconds

export const metadata: Metadata = {
  title: "Dashboard",
  description: "DeuceLeague Dashboard",
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
          <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
            {/* Page Header */}
            <div className="flex flex-col space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor key metrics and performance across all sports.
              </p>
            </div>

            {/* Top KPI Cards - Load immediately */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Key Performance Indicators</h2>
                <div className="text-sm text-muted-foreground">
                  Overview of platform-wide metrics
                </div>
              </div>
              <TopKPICards />
            </section>

            {/* Charts Section - Standard Suspense Pattern */}
            <section className="grid gap-6 lg:grid-cols-2">
              <Suspense fallback={<ChartSkeleton height="h-[450px]" />}>
                <UserGrowthChart />
              </Suspense>
              <Suspense fallback={<ChartSkeleton height="h-[350px]" />}>
                <SportComparisonChart />
              </Suspense>
            </section>

            {/* Match Activity Chart - Standard Suspense Pattern */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Match Activity</h2>
                <div className="text-sm text-muted-foreground">
                  Weekly match trends across all sports
                </div>
              </div>
              <Suspense fallback={<ChartSkeleton height="h-[400px]" />}>
                <MatchActivityChart />
              </Suspense>
            </section>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
