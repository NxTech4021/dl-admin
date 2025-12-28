"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Division } from "@/constants/zod/division-schema";
import { formatDivisionLevel } from "@/lib/utils";
import {
  IconUsers,
  IconTrophy,
  IconTarget,
  IconUserCheck,
  IconCalendar,
  IconCurrencyDollar,
} from "@tabler/icons-react";

interface DivisionOverviewStatsProps {
  division: Division;
  playersCount: number;
}

export default function DivisionOverviewStats({
  division,
  playersCount,
}: DivisionOverviewStatsProps) {
  const capacity = division.gameType === "singles"
    ? division.maxSingles
    : division.maxDoublesTeams;

  const currentCount = division.gameType === "singles"
    ? division.currentSinglesCount || 0
    : division.currentDoublesCount || 0;

  const capacityPercentage = capacity
    ? Math.round((currentCount / capacity) * 100)
    : 0;

  const stats = [
    {
      label: "Players",
      value: playersCount.toString(),
      description: capacity ? `${capacityPercentage}% of capacity` : "No limit set",
      icon: IconUsers,
      iconColor: "text-blue-500",
    },
    {
      label: "Capacity",
      value: capacity ? `${currentCount}/${capacity}` : "Unlimited",
      description: division.gameType === "singles" ? "Singles slots" : "Team slots",
      icon: IconUserCheck,
      iconColor: "text-green-500",
    },
    {
      label: "Level",
      value: formatDivisionLevel(division.divisionLevel) || "N/A",
      description: `${division.gameType} division`,
      icon: IconTarget,
      iconColor: "text-purple-500",
    },
    {
      label: "Rating Threshold",
      value: division.threshold ? `${division.threshold}` : "None",
      description: division.threshold ? "Minimum rating required" : "Open to all ratings",
      icon: IconTrophy,
      iconColor: "text-orange-500",
    },
    {
      label: "Prize Pool",
      value: division.prizePoolTotal ? `MYR ${division.prizePoolTotal.toLocaleString()}` : "N/A",
      description: division.sponsoredDivisionName || "No sponsor",
      icon: IconCurrencyDollar,
      iconColor: "text-emerald-500",
    },
    {
      label: "Created",
      value: division.createdAt
        ? new Date(division.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "N/A",
      description: division.updatedAt
        ? `Updated ${new Date(division.updatedAt).toLocaleDateString()}`
        : "Never updated",
      icon: IconCalendar,
      iconColor: "text-indigo-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <stat.icon className={`size-4 ${stat.iconColor}`} />
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold break-words">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
