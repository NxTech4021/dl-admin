import { useCallback } from "react";
import { toast } from "sonner";
import { useDashboardKPI, useSportMetrics } from "@/hooks/queries";

interface DashboardMetric {
  metric: string;
  current: string;
  previous: string;
  change: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateChange(current: number, previous: number): string {
  if (previous === 0) return "N/A";
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

export function useDashboardExport() {
  const { data: kpiData } = useDashboardKPI();
  const { data: sportMetrics } = useSportMetrics();

  const exportDashboardCSV = useCallback(() => {
    if (!kpiData) {
      toast.error("Export failed", {
        description: "Dashboard data is not available yet",
      });
      return;
    }

    // Build export data from real API data
    const exportData: DashboardMetric[] = [
      {
        metric: "Total Users",
        current: kpiData.totalUsers.toLocaleString(),
        previous: kpiData.previousTotalUsers.toLocaleString(),
        change: calculateChange(kpiData.totalUsers, kpiData.previousTotalUsers),
      },
      {
        metric: "League Participants",
        current: kpiData.leagueParticipants.toLocaleString(),
        previous: kpiData.previousLeagueParticipants.toLocaleString(),
        change: calculateChange(kpiData.leagueParticipants, kpiData.previousLeagueParticipants),
      },
      {
        metric: "Conversion Rate",
        current: `${kpiData.conversionRate}%`,
        previous: "N/A",
        change: "N/A",
      },
      {
        metric: "Total Revenue",
        current: formatCurrency(kpiData.totalRevenue),
        previous: formatCurrency(kpiData.previousRevenue),
        change: calculateChange(kpiData.totalRevenue, kpiData.previousRevenue),
      },
    ];

    // Add sport-specific metrics if available
    if (sportMetrics && sportMetrics.length > 0) {
      exportData.push({ metric: "", current: "", previous: "", change: "" }); // Empty row separator
      exportData.push({ metric: "--- Sport Breakdown ---", current: "", previous: "", change: "" });

      sportMetrics.forEach((sport) => {
        exportData.push({
          metric: `${sport.sport} - Users`,
          current: sport.users.toLocaleString(),
          previous: "N/A",
          change: "N/A",
        });
        exportData.push({
          metric: `${sport.sport} - Paying Members`,
          current: sport.payingMembers.toLocaleString(),
          previous: "N/A",
          change: "N/A",
        });
        exportData.push({
          metric: `${sport.sport} - Revenue`,
          current: formatCurrency(sport.revenue),
          previous: "N/A",
          change: "N/A",
        });
        exportData.push({
          metric: `${sport.sport} - Matches`,
          current: sport.matches.toLocaleString(),
          previous: "N/A",
          change: "N/A",
        });
      });
    }

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
  }, [kpiData, sportMetrics]);

  return { exportDashboardCSV };
}
