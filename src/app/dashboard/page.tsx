"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TopKPICards } from "@/components/kpi-cards";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { FilterPreset } from "@/components/dashboard-filter-presets";
import { DashboardChartFilters } from "@/components/dashboard-chart-filters";
import { ChartLoadingOverlay } from "@/components/ui/chart-loading-overlay";
import { useDashboardKeyboard } from "@/hooks/use-dashboard-keyboard";
import { useDashboardExport } from "@/hooks/use-dashboard-export";
import { queryKeys } from "@/hooks/use-queries";
import { useQueryClient } from "@tanstack/react-query";
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
          {/* Minimal Page Header */}
          <div className="px-6 md:px-8 py-8 border-b border-border/50">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor key metrics and performance
            </p>
          </div>

          {/* KPI Cards with stagger animation */}
          <AnimatedContainer delay={0.05} className="px-6 md:px-8 py-6">
            <TopKPICards />
          </AnimatedContainer>

          {/* Minimal Inline Filters */}
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

          {/* Charts Section */}
          <AnimatedContainer delay={0.15} className="px-6 md:px-8 py-6">
            <h2 className="text-lg font-medium mb-6">Analytics</h2>

            {/* Equal-height 2-column grid */}
            <div className="grid gap-6 lg:grid-cols-2 items-stretch relative">
              <ChartLoadingOverlay isLoading={isChartLoading} />

              <div className="min-h-[420px]">
                <UserGrowthChart
                  chartRange={chartRange}
                  historyRange={historyRange}
                />
              </div>

              <div className="min-h-[420px]">
                <SportComparisonChart
                  chartRange={chartRange}
                  historyRange={historyRange}
                />
              </div>
            </div>
          </AnimatedContainer>

          {/* Match Activity */}
          <AnimatedContainer delay={0.25} className="px-6 md:px-8 pb-8">
            <div className="relative">
              <ChartLoadingOverlay isLoading={isChartLoading} />
              <MatchActivityChart
                chartRange={chartRange}
                historyRange={historyRange}
              />
            </div>
          </AnimatedContainer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
