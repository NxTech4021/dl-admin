"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  CreditCard,
} from "lucide-react";
import { formatValue } from "@/lib/utils/format";

// Static mock data - replace with real API calls (realistic for 100+ member app)
const mockKPIData = {
  totalUsers: 284,
  leagueParticipants: 132,
  conversionRate: 46.5,
  totalRevenue: 3960,
  previousTotalUsers: 259,
  previousLeagueParticipants: 121,
  previousRevenue: 3630,
};


interface KPICardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  icon: React.ComponentType<{ className?: string }>;
  format?: "number" | "currency" | "percentage";
  trend?: "up" | "down" | "neutral";
}

// formatValue function moved to @/lib/utils/format

function calculateTrend(
  current: number,
  previous: number
): { trend: "up" | "down" | "neutral"; percentage: number } {
  if (previous === 0) return { trend: "neutral", percentage: 0 };

  const change = ((current - previous) / previous) * 100;
  const trend = change > 0 ? "up" : change < 0 ? "down" : "neutral";

  return { trend, percentage: Math.abs(change) };
}

function KPICard({
  title,
  value,
  previousValue,
  icon: Icon,
  format = "number",

  trend,
}: KPICardProps) {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  const trendData = previousValue
    ? calculateTrend(numValue, previousValue)
    : null;

  return (
    <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value, format)}</div>
        {trendData && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
            {trendData.trend === "up" ? (
              <>
                <TrendingUp className="h-3 w-3 text-green-500" aria-hidden="true" />
                <span className="sr-only">Increase</span>
              </>
            ) : trendData.trend === "down" ? (
              <>
                <TrendingDown className="h-3 w-3 text-red-500" aria-hidden="true" />
                <span className="sr-only">Decrease</span>
              </>
            ) : null}
            <span
              className={
                trendData.trend === "up"
                  ? "text-green-500"
                  : trendData.trend === "down"
                  ? "text-red-500"
                  : ""
              }
            >
              {trendData.percentage > 0 &&
                `${trendData.percentage.toFixed(1)}%`}
            </span>
            <span>from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TopKPICards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total Users"
        value={mockKPIData.totalUsers}
        previousValue={mockKPIData.previousTotalUsers}
        icon={Users}
        format="number"
      />
      <KPICard
        title="League Participants"
        value={mockKPIData.leagueParticipants}
        previousValue={mockKPIData.previousLeagueParticipants}
        icon={UserCheck}
        format="number"
      />
      <KPICard
        title="Conversion Rate"
        value={mockKPIData.conversionRate}
        icon={TrendingUp}
        format="percentage"
      />
      <KPICard
        title="Total Revenue"
        value={mockKPIData.totalRevenue}
        previousValue={mockKPIData.previousRevenue}
        icon={CreditCard}
        format="currency"
      />
    </div>
  );
}
