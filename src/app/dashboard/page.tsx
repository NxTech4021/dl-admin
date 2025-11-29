"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/ui/page-header";
import { TopKPICards } from "@/components/kpi-cards";
import { KeyInsights } from "@/components/key-insights";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { FilterPreset } from "@/components/dashboard-filter-presets";
import { DashboardChartFilters } from "@/components/dashboard-chart-filters";
import { ChartLoadingOverlay } from "@/components/ui/chart-loading-overlay";
import { ChartSkeleton } from "@/components/ui/chart-skeleton";
import { useDashboardKeyboard } from "@/hooks/use-dashboard-keyboard";
import { useDashboardExport } from "@/hooks/use-dashboard-export";
import { LayoutDashboard } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense, useState, useCallback } from "react";
import { ChartErrorBoundary } from "@/components/ui/chart-error-boundary";
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

// STANDARD: Enable Static Generation with ISR

// Note: metadata and revalidate exports are not allowed in client components

// These should be moved to a layout.tsx file if needed

// === Constants ===
const CHART_LOADING_DELAY_MS = 300;

export default function Page() {
  // === NEW STATE ===

  const [chartRange, setChartRange] = useState<
    "monthly" | "average" | "thisWeek"
  >("monthly");

  const [historyRange, setHistoryRange] = useState<1 | 3 | 6>(3);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(false);

  // Handler functions
  const handleRefresh = useCallback(() => {
    setLastUpdated(new Date());
    toast.success("Dashboard refreshed", {
      description: "All data has been updated",
    });
    // In real app, this would trigger data refetch
  }, []);

  const handleChartRangeChange = useCallback((value: "monthly" | "average" | "thisWeek") => {
    setIsChartLoading(true);
    setChartRange(value);
    const labels = {
      monthly: "Monthly view",
      average: "Average per week view",
      thisWeek: "This week view",
    };
    toast.info("Chart range updated", {
      description: `Switched to ${labels[value]}`,
    });
    setTimeout(() => setIsChartLoading(false), CHART_LOADING_DELAY_MS);
  }, []);

  const handleHistoryRangeChange = useCallback((value: 1 | 3 | 6) => {
    setIsChartLoading(true);
    setHistoryRange(value);
    toast.info("Historical range updated", {
      description: `Showing ${value} month${value > 1 ? "s" : ""} of data`,
    });
    setTimeout(() => setIsChartLoading(false), CHART_LOADING_DELAY_MS);
  }, []);

  const handleApplyPreset = useCallback((preset: FilterPreset) => {
    setIsChartLoading(true);
    setChartRange(preset.chartRange);
    setHistoryRange(preset.historyRange);
    setTimeout(() => setIsChartLoading(false), CHART_LOADING_DELAY_MS);
  }, []);

  // Keyboard shortcuts
  useDashboardKeyboard({
    onChartRangeChange: handleChartRangeChange,
    onHistoryRangeChange: handleHistoryRangeChange,
    onRefresh: handleRefresh,
    onShowKeyboardHelp: () => setShowKeyboardHelp(true),
  });

  // CSV export
  const { exportDashboardCSV } = useDashboardExport();

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
            <DashboardChartFilters
              chartRange={chartRange}
              historyRange={historyRange}
              lastUpdated={lastUpdated}
              showKeyboardHelp={showKeyboardHelp}
              onChartRangeChange={handleChartRangeChange}
              onHistoryRangeChange={handleHistoryRangeChange}
              onRefresh={handleRefresh}
              onExport={exportDashboardCSV}
              onApplyPreset={handleApplyPreset}
              onKeyboardHelpChange={setShowKeyboardHelp}
            />

            {/* Key Insights Section */}
            <AnimatedContainer delay={0.1}>
              <section className="px-4 sm:px-6">
                <KeyInsights
                  totalRevenue={45250}
                  previousRevenue={38400}
                  totalMatches={324}
                  previousMatches={289}
                  activeUsers={856}
                  previousActiveUsers={792}
                />
              </section>
            </AnimatedContainer>

            {/* Charts Section */}
            <AnimatedContainer delay={0.2}>
              <section className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Analytics Overview</h2>
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 relative">
                <ChartLoadingOverlay isLoading={isChartLoading} />
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
            </AnimatedContainer>

            {/* Match Activity */}
            <AnimatedContainer delay={0.3}>
              <section className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6 sm:pb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Match Activity</h2>

                <div className="text-xs sm:text-sm text-muted-foreground">
                  Weekly match trends across all sports
                </div>
              </div>

              <div className="relative">
                <ChartLoadingOverlay isLoading={isChartLoading} />
                <ChartErrorBoundary chartName="Match Activity Chart">
                  <Suspense fallback={<ChartSkeleton height="h-[400px]" name="Match Activity Chart" />}>
                    <MatchActivityChart
                      chartRange={chartRange}
                      historyRange={historyRange}
                    />
                  </Suspense>
                </ChartErrorBoundary>
              </div>
              </section>
            </AnimatedContainer>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
