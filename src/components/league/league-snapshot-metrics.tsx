"use client";

import * as React from "react";
import {
  IconUsers,
  IconActivity,
  IconCalendar,
  IconAward,
  IconBuilding,
  IconChartBar,
} from "@tabler/icons-react";

interface SnapshotMetric {
  label: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

interface LeagueSnapshotMetricsProps {
  uniqueMemberCount: number;
  totalSeasonParticipation: number;
  averageSeasonParticipation: number;
  seasonsCount: number;
  activeSeasonCount: number;
  upcomingSeasonCount: number;
  totalDivisions: number;
  sponsorCount: number;
}

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

function formatNumber(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }
  return numberFormatter.format(value);
}

export function LeagueSnapshotMetrics({
  uniqueMemberCount,
  totalSeasonParticipation,
  averageSeasonParticipation,
  seasonsCount,
  activeSeasonCount,
  upcomingSeasonCount,
  totalDivisions,
  sponsorCount,
}: LeagueSnapshotMetricsProps) {
  const snapshotMetrics: SnapshotMetric[] = [
    {
      label: "Unique Players",
      value: formatNumber(uniqueMemberCount),
      description: "Across all seasons",
      icon: IconUsers,
      iconColor: "text-blue-500",
    },
    {
      label: "Registrations Logged",
      value: formatNumber(totalSeasonParticipation),
      description:
        seasonsCount > 0
          ? `${formatNumber(averageSeasonParticipation)} avg per season`
          : "No seasons yet",
      icon: IconActivity,
      iconColor: "text-green-500",
    },
    {
      label: "Seasons",
      value: formatNumber(seasonsCount),
      description: `Active ${formatNumber(activeSeasonCount)} \u2022 Upcoming ${formatNumber(upcomingSeasonCount)}`,
      icon: IconCalendar,
      iconColor: "text-purple-500",
    },
    {
      label: "Divisions",
      value: formatNumber(totalDivisions),
      description: "Total across all seasons",
      icon: IconAward,
      iconColor: "text-orange-500",
    },
    {
      label: "Sponsors",
      value: formatNumber(sponsorCount),
      description: sponsorCount
        ? "Managed in sponsors section"
        : "None linked yet",
      icon: IconBuilding,
      iconColor: "text-indigo-500",
    },
  ];

  return (
    <section
      className="rounded-2xl border border-border bg-card p-6 space-y-4"
      aria-label="League snapshot metrics"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <IconChartBar className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 className="text-base font-semibold">Snapshot Metrics</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Key indicators drawn from league activity.
        </p>
      </div>
      <div
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        role="list"
        aria-label="Metrics overview"
      >
        {snapshotMetrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <div
              key={metric.label}
              className="rounded-xl border border-border/60 bg-background/50 p-4"
              role="listitem"
            >
              <div className="flex items-center gap-2 mb-2">
                <IconComponent
                  className={`h-4 w-4 ${metric.iconColor}`}
                  aria-hidden="true"
                />
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {metric.label}
                </p>
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {metric.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default LeagueSnapshotMetrics;
