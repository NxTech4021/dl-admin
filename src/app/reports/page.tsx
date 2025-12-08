"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  BarChart3,
  Users,
  Trophy,
  Swords,
  TrendingUp,
  Calendar,
  DollarSign,
  Activity,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import { ReportCard } from "@/components/reports";

export default function ReportsPage() {
  // These would typically come from API calls
  const reportCategories = [
    {
      title: "Player Reports",
      reports: [
        {
          title: "Player Activity Report",
          description: "Track player engagement, match participation, and activity trends over time.",
          icon: Users,
          href: "/reports/player-activity",
          status: "available" as const,
          metrics: [
            { label: "Active Players", value: "1,234" },
            { label: "This Month", value: "+56" },
          ],
        },
        {
          title: "Player Registration Report",
          description: "Monitor new player signups, onboarding completion, and dropout rates.",
          icon: UserCheck,
          href: "/reports/player-registration",
          status: "available" as const,
        },
        {
          title: "Player Retention Report",
          description: "Analyze player retention rates, churn patterns, and engagement metrics.",
          icon: TrendingUp,
          href: "/reports/player-retention",
          status: "available" as const,
        },
      ],
    },
    {
      title: "Match & Competition Reports",
      reports: [
        {
          title: "Match Statistics Report",
          description: "Comprehensive match statistics including scores, durations, and outcomes.",
          icon: Swords,
          href: "/reports/match-statistics",
          status: "available" as const,
          metrics: [
            { label: "Total Matches", value: "3,456" },
            { label: "Completed", value: "3,102" },
          ],
        },
        {
          title: "Season Performance Report",
          description: "Season-by-season analysis of league performance and standings.",
          icon: Trophy,
          href: "/reports/season-performance",
          status: "available" as const,
        },
        {
          title: "Dispute Analysis Report",
          description: "Track dispute resolution rates, categories, and trends.",
          icon: AlertTriangle,
          href: "/reports/dispute-analysis",
          status: "available" as const,
        },
      ],
    },
    {
      title: "Financial Reports",
      reports: [
        {
          title: "Revenue Report",
          description: "Track registration fees, sponsorship revenue, and financial performance.",
          icon: DollarSign,
          href: "/reports/revenue",
          status: "available" as const,
        },
        {
          title: "Membership Report",
          description: "Analyze membership tiers, renewals, and subscription patterns.",
          icon: Calendar,
          href: "/reports/membership",
          status: "available" as const,
        },
      ],
    },
    {
      title: "System Reports",
      reports: [
        {
          title: "Admin Activity Report",
          description: "Monitor administrative actions, audit trails, and system usage.",
          icon: Activity,
          href: "/admin-logs",
          status: "available" as const,
        },
        {
          title: "System Health Report",
          description: "Track system performance, errors, and operational metrics.",
          icon: BarChart3,
          href: "/reports/system-health",
          status: "coming-soon" as const,
        },
      ],
    },
  ];

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6">
              {/* Page Header */}
              <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-4 lg:px-6 py-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="size-8 text-primary" />
                      <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                    </div>
                    <p className="text-muted-foreground">
                      Generate and view reports to gain insights into league operations, player activity, and system performance.
                    </p>
                  </div>
                </div>
              </div>

              {/* Report Categories */}
              <div className="flex-1 px-4 lg:px-6 pb-6 space-y-8">
                {reportCategories.map((category) => (
                  <div key={category.title} className="space-y-4">
                    <h2 className="text-xl font-semibold">{category.title}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.reports.map((report) => (
                        <ReportCard key={report.title} {...report} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
