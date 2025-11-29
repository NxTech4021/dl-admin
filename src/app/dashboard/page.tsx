"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/ui/page-header";
import { TopKPICards } from "@/components/kpi-cards";
import { KeyInsights } from "@/components/key-insights";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { DashboardFilterPresets, FilterPreset } from "@/components/dashboard-filter-presets";
import { LayoutDashboard, RefreshCw, Keyboard, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    setTimeout(() => setIsChartLoading(false), 300);
  }, []);

  const handleHistoryRangeChange = useCallback((value: 1 | 3 | 6) => {
    setIsChartLoading(true);
    setHistoryRange(value);
    toast.info("Historical range updated", {
      description: `Showing ${value} month${value > 1 ? "s" : ""} of data`,
    });
    setTimeout(() => setIsChartLoading(false), 300);
  }, []);

  const handleApplyPreset = useCallback((preset: FilterPreset) => {
    setIsChartLoading(true);
    setChartRange(preset.chartRange);
    setHistoryRange(preset.historyRange);
    setTimeout(() => setIsChartLoading(false), 300);
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

  const getDataQuality = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);

    // Fresh data (< 5 minutes)
    if (diff < 300) {
      return {
        status: "excellent",
        label: "Excellent",
        icon: CheckCircle2,
        variant: "default" as const,
        description: "Data is fresh and up-to-date",
      };
    }

    // Good data (5-30 minutes)
    if (diff < 1800) {
      return {
        status: "good",
        label: "Good",
        icon: CheckCircle2,
        variant: "secondary" as const,
        description: "Data is recent",
      };
    }

    // Stale data (> 30 minutes)
    return {
      status: "stale",
      label: "Stale",
      icon: AlertTriangle,
      variant: "destructive" as const,
      description: "Data may be outdated, consider refreshing",
    };
  };

  const handleExportCSV = useCallback(() => {
    // Mock dashboard data for export
    const exportData = [
      {
        metric: "Total Revenue",
        current: "RM 45,250",
        previous: "RM 38,400",
        change: "+17.8%",
      },
      {
        metric: "Total Matches",
        current: "324",
        previous: "289",
        change: "+12.1%",
      },
      {
        metric: "Active Users",
        current: "856",
        previous: "792",
        change: "+8.1%",
      },
      {
        metric: "Average Revenue per Match",
        current: "RM 139.66",
        previous: "RM 132.87",
        change: "+5.1%",
      },
    ];

    // Convert to CSV
    const headers = ["Metric", "Current Period", "Previous Period", "Change"];
    const csvContent = [
      headers.join(","),
      ...exportData.map((row) =>
        [row.metric, row.current, row.previous, row.change].join(",")
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `dashboard-export-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Export completed", {
      description: "Dashboard data exported as CSV",
    });
  }, []);

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
              className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-4 sm:gap-6 rounded-lg border bg-muted/30 p-4 sm:p-6 mx-4 sm:mx-6"
              role="toolbar"
              aria-label="Chart filter controls"
            >
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Chart Range:
                  </span>
                  <Tabs
                    value={chartRange}
                    onValueChange={(value) =>
                      handleChartRangeChange(value as "monthly" | "average" | "thisWeek")
                    }
                  >
                    <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                      <TabsTrigger value="monthly" className="text-xs sm:text-sm">Monthly</TabsTrigger>
                      <TabsTrigger value="average" className="text-xs sm:text-sm">Average</TabsTrigger>
                      <TabsTrigger value="thisWeek" className="text-xs sm:text-sm">Week</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Historical Range:
                  </span>
                  <Tabs
                    value={historyRange.toString()}
                    onValueChange={(value) => handleHistoryRangeChange(Number(value) as 1 | 3 | 6)}
                  >
                    <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                      <TabsTrigger value="1" className="text-xs sm:text-sm">1mo</TabsTrigger>
                      <TabsTrigger value="3" className="text-xs sm:text-sm">3mo</TabsTrigger>
                      <TabsTrigger value="6" className="text-xs sm:text-sm">6mo</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant={getDataQuality().variant} className="gap-1.5 cursor-help">
                        {(() => {
                          const QualityIcon = getDataQuality().icon;
                          return <QualityIcon className="h-3 w-3" />;
                        })()}
                        {getDataQuality().label}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getDataQuality().description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
                  <span className="hidden sm:inline">Last updated: {formatLastUpdated()}</span>
                  <span className="sm:hidden">Updated: {formatLastUpdated().split(' ').pop()}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRefresh}
                          className="h-8 w-8 sm:h-9 sm:w-9 p-0 touch-manipulation"
                          aria-label="Refresh dashboard data"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Refresh (R)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <DashboardFilterPresets
                  currentChartRange={chartRange}
                  currentHistoryRange={historyRange}
                  onApplyPreset={handleApplyPreset}
                />

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportCSV}
                        className="h-8 sm:h-9 gap-1 sm:gap-1.5 text-xs touch-manipulation"
                        aria-label="Export dashboard data"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline text-xs">Export</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Export as CSV</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 sm:h-9 gap-1 sm:gap-1.5 touch-manipulation hidden sm:flex"
                        aria-label="Keyboard shortcuts"
                      >
                        <Keyboard className="h-3.5 w-3.5" />
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
                {isChartLoading && (
                  <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      <span className="text-sm text-muted-foreground">Updating charts...</span>
                    </div>
                  </div>
                )}
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
                {isChartLoading && (
                  <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      <span className="text-sm text-muted-foreground">Updating charts...</span>
                    </div>
                  </div>
                )}
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
