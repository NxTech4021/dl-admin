import { useEffect } from "react";

interface UseDashboardKeyboardProps {
  onChartRangeChange: (value: "monthly" | "average" | "thisWeek") => void;
  onHistoryRangeChange: (value: 1 | 3 | 6) => void;
  onRefresh: () => void;
  onShowKeyboardHelp?: () => void;
}

export function useDashboardKeyboard({
  onChartRangeChange,
  onHistoryRangeChange,
  onRefresh,
  onShowKeyboardHelp,
}: UseDashboardKeyboardProps) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Show keyboard help with ?
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        onShowKeyboardHelp?.();
        return;
      }

      // Chart range shortcuts: M, A, W
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        onChartRangeChange("monthly");
      } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        onChartRangeChange("average");
      } else if (e.key === "w" || e.key === "W") {
        e.preventDefault();
        onChartRangeChange("thisWeek");
      }
      // History range shortcuts: 1, 2, 3 (mapping to 1, 3, 6 months)
      else if (e.key === "1") {
        e.preventDefault();
        onHistoryRangeChange(1);
      } else if (e.key === "2") {
        e.preventDefault();
        onHistoryRangeChange(3);
      } else if (e.key === "3") {
        e.preventDefault();
        onHistoryRangeChange(6);
      }
      // Refresh with R
      else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        onRefresh();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onChartRangeChange, onHistoryRangeChange, onRefresh, onShowKeyboardHelp]);
}
