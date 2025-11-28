"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/ui/page-header";
import { TopKPICards } from "@/components/kpi-cards";
import { LayoutDashboard } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChartErrorBoundary } from "@/components/ui/chart-error-boundary";

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

const ChartSkeleton = ({ height, name }: { height: string; name?: string }) => (
  <div
    className={`${height} relative overflow-hidden rounded-lg border bg-card`}
    role="status"
    aria-label={name ? `Loading ${name}` : "Loading chart"}
  >
    {/* Shimmer effect */}
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-muted/50 to-transparent" />

    {/* Skeleton content */}
    <div className="flex h-full flex-col p-6">
      <div className="space-y-3">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted/70" />
      </div>
      <div className="mt-6 flex-1 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 animate-pulse rounded bg-muted" />
          <div className="h-16 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-full min-h-[200px] animate-pulse rounded bg-muted/50" />
      </div>
    </div>
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
          <div className="@container/main flex flex-1 flex-col gap-6">
            {/* Industry-Standard Page Header */}
            <PageHeader
              icon={LayoutDashboard}
              title="Dashboard"
              description="Monitor key metrics and performance across all sports"
            >
              <TopKPICards />
            </PageHeader>

            {/* Chart Filters */}
            <section
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-muted/30 p-6 mx-6"
              role="toolbar"
              aria-label="Chart filter controls"
            >
              <div className="flex items-center gap-2" role="group" aria-labelledby="chart-range-label">
                <span id="chart-range-label" className="text-sm font-medium text-muted-foreground">
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
                    aria-label={`View ${opt === "average" ? "weekly average" : opt === "thisWeek" ? "this week" : "monthly"} data`}
                    aria-pressed={chartRange === opt}
                    role="radio"
                    aria-checked={chartRange === opt}
                  >
                    {opt === "average"
                      ? "Average / Week"
                      : opt === "thisWeek"
                      ? "This Week"
                      : "Monthly"}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2" role="group" aria-labelledby="history-range-label">
                <span id="history-range-label" className="text-sm font-medium text-muted-foreground">
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
                    aria-label={`View ${month} month${month > 1 ? "s" : ""} of historical data`}
                    aria-pressed={historyRange === month}
                    role="radio"
                    aria-checked={historyRange === month}
                  >
                    {month} Month{month > 1 ? "s" : ""}
                  </Button>
                ))}
              </div>
            </section>

            {/* Charts Section */}
            <section className="space-y-6 px-6">
              <h2 className="text-2xl font-semibold tracking-tight">Analytics Overview</h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <ChartErrorBoundary chartName="User Growth Chart">
                  <Suspense fallback={<ChartSkeleton height="h-[450px]" name="User Growth Chart" />}>
                    <UserGrowthChart
                      chartRange={chartRange}
                      historyRange={historyRange}
                    />
                  </Suspense>
                </ChartErrorBoundary>

                <ChartErrorBoundary chartName="Sport Comparison Chart">
                  <Suspense fallback={<ChartSkeleton height="h-[350px]" name="Sport Comparison Chart" />}>
                    <SportComparisonChart
                      chartRange={chartRange}
                      historyRange={historyRange}
                    />
                  </Suspense>
                </ChartErrorBoundary>
              </div>
            </section>

            {/* Match Activity */}
            <section className="space-y-6 px-6 pb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">Match Activity</h2>

                <div className="text-sm text-muted-foreground">
                  Weekly match trends across all sports
                </div>
              </div>

              <ChartErrorBoundary chartName="Match Activity Chart">
                <Suspense fallback={<ChartSkeleton height="h-[400px]" name="Match Activity Chart" />}>
                  <MatchActivityChart
                    chartRange={chartRange}
                    historyRange={historyRange}
                  />
                </Suspense>
              </ChartErrorBoundary>
            </section>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
