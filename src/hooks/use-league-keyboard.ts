import { useEffect } from "react";

interface UseLeagueKeyboardProps {
  onCreateLeague: () => void;
  onExport: () => void;
  onRefresh: () => void;
  onShowKeyboardHelp?: () => void;
}

/**
 * Keyboard shortcuts hook for the League management page
 * Follows the same pattern as useDashboardKeyboard for consistency
 *
 * Shortcuts:
 * - N: Create new league
 * - E: Export leagues to CSV
 * - R: Refresh data
 * - ?: Show keyboard help
 */
export function useLeagueKeyboard({
  onCreateLeague,
  onExport,
  onRefresh,
  onShowKeyboardHelp,
}: UseLeagueKeyboardProps) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Don't trigger when modal dialogs are open (elements with role="dialog")
      const activeElement = document.activeElement;
      if (activeElement?.closest('[role="dialog"]')) {
        return;
      }

      // Show keyboard help with ?
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        onShowKeyboardHelp?.();
        return;
      }

      // Create new league with N
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        onCreateLeague();
      }
      // Export with E
      else if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        onExport();
      }
      // Refresh with R
      else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        onRefresh();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onCreateLeague, onExport, onRefresh, onShowKeyboardHelp]);
}
