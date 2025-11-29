import { useCallback } from "react";
import { toast } from "sonner";

interface DashboardMetric {
  metric: string;
  current: string;
  previous: string;
  change: string;
}

export function useDashboardExport() {
  const exportDashboardCSV = useCallback(() => {
    // Mock dashboard data for export
    const exportData: DashboardMetric[] = [
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

  return { exportDashboardCSV };
}
