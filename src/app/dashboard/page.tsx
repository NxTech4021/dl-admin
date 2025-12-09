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
import { DashboardChart } from "@/components/ui/dashboard-chart";
import { useDashboardKeyboard } from "@/hooks/use-dashboard-keyboard";
import { useDashboardExport } from "@/hooks/use-dashboard-export";
import { useDashboardKPI, queryKeys } from "@/hooks/use-queries";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { toast } from "sonner";

// STANDARD: Individual dynamic imports - recommended by Next.js docs

// === Dynamic Imports ===

const UserGrowthChart = dynamic(() =>
  import("@/components/user-growth-chart").then((mod) => ({
    default: mod.UserGrowthChart,
  }))
) as React.ComponentType<{
  chartRange?: "monthly" | "average";
  historyRange?: 1 | 3 | 6;
}>;

const SportComparisonChart = dynamic(() =>
  import("@/components/sport-comparison-chart").then((mod) => ({
    default: mod.SportComparisonChart,
  }))
) as React.ComponentType<{
  chartRange?: "monthly" | "average";
  historyRange?: 1 | 3 | 6;
}>;

const MatchActivityChart = dynamic(() =>
  import("@/components/match-activity-chart").then((mod) => ({
    default: mod.MatchActivityChart,
  }))
) as React.ComponentType<{
  chartRange?: "monthly" | "average";
  historyRange?: 1 | 3 | 6;
}>;

// STANDARD: Enable Static Generation with ISR

// Note: metadata and revalidate exports are not allowed in client components

// These should be moved to a layout.tsx file if needed

// === Constants ===
const CHART_LOADING_DELAY_MS = 300;

export default function Page() {
  // === NEW STATE ===

  const [chartRange, setChartRange] = useState<"monthly" | "average">("monthly");

  const [historyRange, setHistoryRange] = useState<1 | 3 | 6>(3);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(false);

  const queryClient = useQueryClient();

  // Handler functions
  const handleRefresh = useCallback(() => {
    // Invalidate all dashboard-related queries to force refetch
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    setLastUpdated(new Date());
    toast.success("Dashboard refreshed", {
      description: "All data has been updated",
    });
  }, [queryClient]);

  const handleChartRangeChange = useCallback((value: "monthly" | "average") => {
    setIsChartLoading(true);
    setChartRange(value);
    const labels = {
      monthly: "Monthly view",
      average: "Weekly average view",
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

  // Dashboard KPI data for KeyInsights
  const { data: kpiData } = useDashboardKPI();

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
                  totalRevenue={kpiData?.totalRevenue ?? 0}
                  previousRevenue={kpiData?.previousRevenue ?? 0}
                  totalMatches={kpiData?.totalMatches ?? 0}
                  previousMatches={kpiData?.previousMatches ?? 0}
                  activeUsers={kpiData?.activeUsers ?? 0}
                  previousActiveUsers={kpiData?.previousActiveUsers ?? 0}
                />
              </section>
            </AnimatedContainer>

            {/* Charts Section */}
            <AnimatedContainer delay={0.2}>
              <section className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Analytics Overview</h2>
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 relative">
                <ChartLoadingOverlay isLoading={isChartLoading} />
                <DashboardChart name="User Growth Chart" height="h-[450px]">
                  <UserGrowthChart
                    chartRange={chartRange}
                    historyRange={historyRange}
                  />
                </DashboardChart>

                <DashboardChart name="Sport Comparison Chart" height="h-[350px]">
                  <SportComparisonChart
                    chartRange={chartRange}
                    historyRange={historyRange}
                  />
                </DashboardChart>
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
                <DashboardChart name="Match Activity Chart" height="h-[400px]">
                  <MatchActivityChart
                    chartRange={chartRange}
                    historyRange={historyRange}
                  />
                </DashboardChart>
              </div>
              </section>
            </AnimatedContainer>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
