import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { TopKPICards } from "@/components/kpi-cards";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { DashboardChartFilters } from "@/components/dashboard-chart-filters";
import { ChartLoadingOverlay } from "@/components/ui/chart-loading-overlay";
import { useDashboardKeyboard } from "@/hooks/use-dashboard-keyboard";
import { useDashboardExport } from "@/hooks/use-dashboard-export";
import { queryKeys } from "@/hooks/use-queries";
import { useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useState, useCallback } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load heavy chart components
const UserGrowthChart = lazy(() =>
  import("@/components/user-growth-chart").then((mod) => ({
    default: mod.UserGrowthChart,
  }))
);

const SportComparisonChart = lazy(() =>
  import("@/components/sport-comparison-chart").then((mod) => ({
    default: mod.SportComparisonChart,
  }))
);

const MatchActivityChart = lazy(() =>
  import("@/components/match-activity-chart").then((mod) => ({
    default: mod.MatchActivityChart,
  }))
);

// Chart loading fallback
function ChartSkeleton() {
  return <Skeleton className="w-full h-[420px] rounded-lg" />;
}

// Constants
const CHART_LOADING_DELAY_MS = 300;

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const [chartRange, setChartRange] = useState<"monthly" | "average">("monthly");
  const [historyRange, setHistoryRange] = useState<1 | 3 | 6>(3);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(false);

  const queryClient = useQueryClient();

  // Handler functions
  const handleRefresh = useCallback(() => {
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
    <>
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
          onKeyboardHelpChange={setShowKeyboardHelp}
        />

        {/* Charts Section */}
        <AnimatedContainer delay={0.15} className="px-6 md:px-8 py-6">
          <h2 className="text-lg font-medium mb-6">Analytics</h2>

          {/* Equal-height 2-column grid */}
          <div className="grid gap-6 lg:grid-cols-2 items-stretch relative">
            <ChartLoadingOverlay isLoading={isChartLoading} />

            <div className="min-h-[420px]">
              <Suspense fallback={<ChartSkeleton />}>
                <UserGrowthChart
                  chartRange={chartRange}
                  historyRange={historyRange}
                />
              </Suspense>
            </div>

            <div className="min-h-[420px]">
              <Suspense fallback={<ChartSkeleton />}>
                <SportComparisonChart
                  chartRange={chartRange}
                  historyRange={historyRange}
                />
              </Suspense>
            </div>
          </div>
        </AnimatedContainer>

        {/* Match Activity */}
        <AnimatedContainer delay={0.25} className="px-6 md:px-8 pb-8">
          <div className="relative">
            <ChartLoadingOverlay isLoading={isChartLoading} />
            <Suspense fallback={<ChartSkeleton />}>
              <MatchActivityChart
                chartRange={chartRange}
                historyRange={historyRange}
              />
            </Suspense>
          </div>
        </AnimatedContainer>
      </div>
    </>
  );
}
