"use client";

import { RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/ui/filter-select";
import { AnimatedContainer } from "@/components/ui/animated-container";

const CHART_RANGE_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "average", label: "Weekly Avg" },
];

const HISTORY_RANGE_OPTIONS = [
  { value: "1", label: "1mo" },
  { value: "3", label: "3mo" },
  { value: "6", label: "6mo" },
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
    <AnimatedContainer delay={0.1}>
      <div className="px-6 md:px-8">
        {/* Clean inline layout - no bordered container */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-2">
            <FilterSelect
              value={chartRange}
              onChange={(value) => onChartRangeChange((value || "monthly") as "monthly" | "average")}
              options={CHART_RANGE_OPTIONS}
              placeholder="View"
              triggerClassName="w-[120px] h-9 text-sm border-border/50"
            />

            <FilterSelect
              value={historyRange.toString()}
              onChange={(value) => onHistoryRangeChange(Number(value || "3") as 1 | 3 | 6)}
              options={HISTORY_RANGE_OPTIONS}
              placeholder="Period"
              triggerClassName="w-[85px] h-9 text-sm border-border/50"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline" suppressHydrationWarning>
              Updated {formatLastUpdated()}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="h-8 w-8 p-0"
                aria-label="Refresh"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onExport}
                className="h-8 gap-1.5 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
}
