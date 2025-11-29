"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/ui/page-header";
import { TopKPICards } from "@/components/kpi-cards";
import { KeyInsights } from "@/components/key-insights";
import { LayoutDashboard, RefreshCw, Keyboard } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense, useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartErrorBoundary } from "@/components/ui/chart-error-boundary";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

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
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Handler functions
  const handleRefresh = useCallback(() => {
    setLastUpdated(new Date());
    toast.success("Dashboard refreshed", {
      description: "All data has been updated",
    });
    // In real app, this would trigger data refetch
  }, []);

  const handleChartRangeChange = useCallback((value: "monthly" | "average" | "thisWeek") => {
    setChartRange(value);
    const labels = {
      monthly: "Monthly view",
      average: "Average per week view",
      thisWeek: "This week view",
    };
    toast.info("Chart range updated", {
      description: `Switched to ${labels[value]}`,
    });
  }, []);

  const handleHistoryRangeChange = useCallback((value: 1 | 3 | 6) => {
    setHistoryRange(value);
    toast.info("Historical range updated", {
      description: `Showing ${value} month${value > 1 ? "s" : ""} of data`,
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Show keyboard help with ?
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        setShowKeyboardHelp(true);
        return;
      }

      // Chart range shortcuts: M, A, W
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        handleChartRangeChange("monthly");
      } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        handleChartRangeChange("average");
      } else if (e.key === "w" || e.key === "W") {
        e.preventDefault();
        handleChartRangeChange("thisWeek");
      }
      // History range shortcuts: 1, 2, 3 (mapping to 1, 3, 6 months)
      else if (e.key === "1") {
        e.preventDefault();
        handleHistoryRangeChange(1);
      } else if (e.key === "2") {
        e.preventDefault();
        handleHistoryRangeChange(3);
      } else if (e.key === "3") {
        e.preventDefault();
        handleHistoryRangeChange(6);
      }
      // Refresh with R
      else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleRefresh();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleChartRangeChange, handleHistoryRangeChange, handleRefresh]);

  const formatLastUpdated = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return lastUpdated.toLocaleTimeString();
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
              className="flex flex-wrap items-center justify-between gap-6 rounded-lg border bg-muted/30 p-6 mx-6"
              role="toolbar"
              aria-label="Chart filter controls"
            >
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    Chart Range:
                  </span>
                  <Tabs
                    value={chartRange}
                    onValueChange={(value) =>
                      handleChartRangeChange(value as "monthly" | "average" | "thisWeek")
                    }
                  >
                    <TabsList>
                      <TabsTrigger value="monthly">Monthly</TabsTrigger>
                      <TabsTrigger value="average">Average / Week</TabsTrigger>
                      <TabsTrigger value="thisWeek">This Week</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    Historical Range:
                  </span>
                  <Tabs
                    value={historyRange.toString()}
                    onValueChange={(value) => handleHistoryRangeChange(Number(value) as 1 | 3 | 6)}
                  >
                    <TabsList>
                      <TabsTrigger value="1">1 Month</TabsTrigger>
                      <TabsTrigger value="3">3 Months</TabsTrigger>
                      <TabsTrigger value="6">6 Months</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Last updated: {formatLastUpdated()}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRefresh}
                          className="h-7 w-7 p-0"
                          aria-label="Refresh dashboard data"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Refresh (R)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <TooltipProvider>
                  <Tooltip open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5"
                        aria-label="Keyboard shortcuts"
                      >
                        <Keyboard className="h-3 w-3" />
                        <span className="text-xs">?</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="w-64" side="bottom" align="end">
                      <div className="space-y-2">
                        <p className="font-semibold text-sm">Keyboard Shortcuts</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><kbd className="px-1.5 py-0.5 bg-muted rounded">M</kbd> Monthly</div>
                          <div><kbd className="px-1.5 py-0.5 bg-muted rounded">A</kbd> Average</div>
                          <div><kbd className="px-1.5 py-0.5 bg-muted rounded">W</kbd> This Week</div>
                          <div><kbd className="px-1.5 py-0.5 bg-muted rounded">1</kbd> 1 Month</div>
                          <div><kbd className="px-1.5 py-0.5 bg-muted rounded">2</kbd> 3 Months</div>
                          <div><kbd className="px-1.5 py-0.5 bg-muted rounded">3</kbd> 6 Months</div>
                          <div><kbd className="px-1.5 py-0.5 bg-muted rounded">R</kbd> Refresh</div>
                          <div><kbd className="px-1.5 py-0.5 bg-muted rounded">?</kbd> Help</div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </section>

            {/* Key Insights Section */}
            <section className="px-6">
              <KeyInsights
                totalRevenue={45250}
                previousRevenue={38400}
                totalMatches={324}
                previousMatches={289}
                activeUsers={856}
                previousActiveUsers={792}
              />
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
