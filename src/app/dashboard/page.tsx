"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/ui/page-header";
import { TopKPICards } from "@/components/kpi-cards";
import { IconLayoutDashboard } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// STANDARD: Individual dynamic imports - recommended by Next.js docs

// === Dynamic Imports ===

const UserGrowthChart = dynamic(() =>
  import("@/components/user-growth-chart").then((mod) => ({
    default: mod.UserGrowthChart,
  }))
) as React.ComponentType<{
  chartRange?: "monthly" | "average" | "thisWeek";

  historyRange?: 1 | 3 | 6;
}>;

const SportComparisonChart = dynamic(() =>
  import("@/components/sport-comparison-chart").then((mod) => ({
    default: mod.SportComparisonChart,
  }))
) as React.ComponentType<{
  chartRange?: "monthly" | "average" | "thisWeek";

  historyRange?: 1 | 3 | 6;
}>;

const MatchActivityChart = dynamic(() =>
  import("@/components/match-activity-chart").then((mod) => ({
    default: mod.MatchActivityChart,
  }))
) as React.ComponentType<{
  chartRange?: "monthly" | "average" | "thisWeek";

  historyRange?: 1 | 3 | 6;
}>;

// STANDARD: Reusable loading component

// === Loading Skeleton ===

const ChartSkeleton = ({ height }: { height: string }) => (
  <div
    className={`${height} animate-pulse bg-muted rounded-lg flex items-center justify-center`}
  >
    <div className="text-muted-foreground text-sm">Loading chart...</div>
  </div>
);

// STANDARD: Enable Static Generation with ISR

// Note: metadata and revalidate exports are not allowed in client components

// These should be moved to a layout.tsx file if needed

export default function Page() {
  // === NEW STATE ===

  const [chartRange, setChartRange] = useState<
    "monthly" | "average" | "thisWeek"
  >("monthly");

  const [historyRange, setHistoryRange] = useState<1 | 3 | 6>(3);

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
              icon={IconLayoutDashboard}
              title="Dashboard"
              description="Monitor key metrics and performance across all sports"
            >
              <TopKPICards />
            </PageHeader>

            {/* Chart Filters */}
            <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-4 mx-4 lg:mx-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Chart Range:
                </span>

                {["monthly", "average", "thisWeek"].map((opt) => (
                  <Button
                    key={opt}
                    size="sm"
                    variant={chartRange === opt ? "default" : "outline"}
                    className={cn(
                      "capitalize",

                      chartRange === opt && "bg-primary text-primary-foreground"
                    )}
                    onClick={() =>
                      setChartRange(opt as "monthly" | "average" | "thisWeek")
                    }
                  >
                    {opt === "average"
                      ? "Average / Week"
                      : opt === "thisWeek"
                      ? "This Week"
                      : "Monthly"}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Historical Range:
                </span>

                {[1, 3, 6].map((month) => (
                  <Button
                    key={month}
                    size="sm"
                    variant={historyRange === month ? "default" : "outline"}
                    className={cn(
                      historyRange === month &&
                        "bg-primary text-primary-foreground"
                    )}
                    onClick={() => setHistoryRange(month as 1 | 3 | 6)}
                  >
                    {month} Month{month > 1 ? "s" : ""}
                  </Button>
                ))}
              </div>
            </section>

            {/* Charts Section */}
            <section className="grid gap-6 lg:grid-cols-2 px-4 lg:px-6">
              <Suspense fallback={<ChartSkeleton height="h-[450px]" />}>
                <UserGrowthChart
                  chartRange={chartRange}
                  historyRange={historyRange}
                />
              </Suspense>

              <Suspense fallback={<ChartSkeleton height="h-[350px]" />}>
                <SportComparisonChart
                  chartRange={chartRange}
                  historyRange={historyRange}
                />
              </Suspense>
            </section>

            {/* Match Activity */}
            <section className="space-y-4 px-4 lg:px-6 pb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Match Activity</h2>

                <div className="text-sm text-muted-foreground">
                  Weekly match trends across all sports
                </div>
              </div>

              <Suspense fallback={<ChartSkeleton height="h-[400px]" />}>
                <MatchActivityChart
                  chartRange={chartRange}
                  historyRange={historyRange}
                />
              </Suspense>
            </section>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
