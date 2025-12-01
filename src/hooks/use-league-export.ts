import { useCallback } from "react";
import { toast } from "sonner";
import { type League } from "@/constants/zod/league-schema";

/**
 * Hook for exporting league data to CSV
 * Follows the same pattern as useDashboardExport for consistency
 */
export function useLeagueExport() {
  const exportLeaguesCSV = useCallback((leagues: League[]) => {
    if (!leagues || leagues.length === 0) {
      toast.error("No data to export", {
        description: "There are no leagues available to export",
      });
      return;
    }

    // Define CSV headers
    const headers = [
      "League Name",
      "Sport Type",
      "Location",
      "Status",
      "Game Type",
      "Members",
      "Seasons",
      "Created At",
    ];

    // Convert leagues to CSV rows
    const csvRows = leagues.map((league) => [
      `"${league.name.replace(/"/g, '""')}"`, // Escape quotes
      league.sportType,
      league.location || "N/A",
      league.status,
      league.gameType,
      league.memberCount?.toString() || "0",
      league.seasonCount?.toString() || "0",
      new Date(league.createdAt).toLocaleDateString(),
    ]);

    // Build CSV content
    const csvContent = [
      headers.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    // Create blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `leagues-export-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);

    toast.success("Export completed", {
      description: `Exported ${leagues.length} league${leagues.length !== 1 ? "s" : ""} as CSV`,
    });
  }, []);

  return { exportLeaguesCSV };
}
