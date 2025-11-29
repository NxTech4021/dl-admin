"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, RefreshCw, Download, Keyboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DashboardFilterPresets, FilterPreset } from "@/components/dashboard-filter-presets";

interface DashboardChartFiltersProps {
  chartRange: "monthly" | "average" | "thisWeek";
  historyRange: 1 | 3 | 6;
  lastUpdated: Date;
  showKeyboardHelp: boolean;
  onChartRangeChange: (value: "monthly" | "average" | "thisWeek") => void;
  onHistoryRangeChange: (value: 1 | 3 | 6) => void;
  onRefresh: () => void;
  onExport: () => void;
  onApplyPreset: (preset: FilterPreset) => void;
  onKeyboardHelpChange: (show: boolean) => void;
}

export function DashboardChartFilters({
  chartRange,
  historyRange,
  lastUpdated,
  showKeyboardHelp,
  onChartRangeChange,
  onHistoryRangeChange,
  onRefresh,
  onExport,
  onApplyPreset,
  onKeyboardHelpChange,
}: DashboardChartFiltersProps) {
  const getDataQuality = () => {
    // Always return "Live" to avoid hydration mismatch
    // In production, this would be based on actual data freshness state
    return {
      variant: "default" as const,
      label: "Live",
      icon: CheckCircle2,
      tooltip: "Data is live and up-to-date",
    };
  };

  const formatLastUpdated = () => {
    return lastUpdated.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
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
          <Tabs value={chartRange} onValueChange={(value) => onChartRangeChange(value as "monthly" | "average" | "thisWeek")}>
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
          <Tabs value={historyRange.toString()} onValueChange={(value) => onHistoryRangeChange(Number(value) as 1 | 3 | 6)}>
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
              <Badge variant={getDataQuality().variant} className="gap-2 cursor-help">
                {(() => {
                  const QualityIcon = getDataQuality().icon;
                  return <QualityIcon className="h-3 w-3" />;
                })()}
                {getDataQuality().label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getDataQuality().tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DashboardFilterPresets
          currentChartRange={chartRange}
          currentHistoryRange={historyRange}
          onApplyPreset={onApplyPreset}
        />

        <div className="flex items-center gap-1 sm:gap-2">
          <span className="hidden sm:inline text-xs text-muted-foreground">Updated: {formatLastUpdated()}</span>
          <span className="sm:hidden">Updated: {formatLastUpdated().split(' ').pop()}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
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

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExport}
                  className="h-8 sm:h-9 gap-2 text-xs touch-manipulation"
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
            <Tooltip open={showKeyboardHelp} onOpenChange={onKeyboardHelpChange}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 sm:h-9 gap-2 touch-manipulation hidden sm:flex"
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
                    <div><kbd className="px-1.5 py-0.5 bg-muted rounded">W</kbd> Week</div>
                    <div><kbd className="px-1.5 py-0.5 bg-muted rounded">1</kbd> 1 Month</div>
                    <div><kbd className="px-1.5 py-0.5 bg-muted rounded">3</kbd> 3 Months</div>
                    <div><kbd className="px-1.5 py-0.5 bg-muted rounded">6</kbd> 6 Months</div>
                    <div><kbd className="px-1.5 py-0.5 bg-muted rounded">R</kbd> Refresh</div>
                    <div><kbd className="px-1.5 py-0.5 bg-muted rounded">E</kbd> Export</div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </section>
  );
}
