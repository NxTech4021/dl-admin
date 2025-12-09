"use client";

import { RefreshCw, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect } from "@/components/ui/filter-select";
import { DashboardFilterPresets, FilterPreset } from "@/components/dashboard-filter-presets";

const CHART_RANGE_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "average", label: "Weekly Average" },
];

const HISTORY_RANGE_OPTIONS = [
  { value: "1", label: "1 Month" },
  { value: "3", label: "3 Months" },
  { value: "6", label: "6 Months" },
];

interface DashboardChartFiltersProps {
  chartRange: "monthly" | "average";
  historyRange: 1 | 3 | 6;
  lastUpdated: Date;
  showKeyboardHelp: boolean;
  onChartRangeChange: (value: "monthly" | "average") => void;
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
  onChartRangeChange,
  onHistoryRangeChange,
  onRefresh,
  onExport,
  onApplyPreset,
}: DashboardChartFiltersProps) {
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mx-4 sm:mx-6 rounded-lg border bg-muted/30 p-4">
      <FilterBar className="justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            value={chartRange}
            onChange={(value) => onChartRangeChange((value || "monthly") as "monthly" | "average")}
            options={CHART_RANGE_OPTIONS}
            placeholder="Chart Range"
            triggerClassName="w-[130px]"
          />

          <FilterSelect
            value={historyRange.toString()}
            onChange={(value) => onHistoryRangeChange(Number(value || "3") as 1 | 3 | 6)}
            options={HISTORY_RANGE_OPTIONS}
            placeholder="History"
            triggerClassName="w-[120px]"
          />

          <DashboardFilterPresets
            currentChartRange={chartRange}
            currentHistoryRange={historyRange}
            onApplyPreset={onApplyPreset}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="font-normal">Live</Badge>
            <span className="hidden sm:inline" suppressHydrationWarning>
              {formatLastUpdated()}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-8 w-8 p-0"
              aria-label="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="h-8 gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
      </FilterBar>
    </div>
  );
}
