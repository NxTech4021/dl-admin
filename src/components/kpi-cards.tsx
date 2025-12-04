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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardKPI, useSportMetrics } from "@/hooks/use-queries";

interface KPICardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  icon: React.ComponentType<{ className?: string }>;
  format?: "number" | "currency" | "percentage";
  trend?: "up" | "down" | "neutral";
  onClick?: () => void;
  isLoading?: boolean;
}

// Mock 7-day trend data generator - DETERMINISTIC (no Math.random)
function generate7DayTrend(currentValue: number, trend: "up" | "down" | "neutral"): number[] {
  const data: number[] = [];
  const startValue = currentValue * 0.85; // Start at 85% of current

  // Use deterministic variance pattern based on day index
  const variancePattern = [0.02, -0.01, 0.03, -0.02, 0.01, 0.02, 0]; // Predefined pattern
  const trendFactor = trend === "up" ? 0.025 : trend === "down" ? -0.025 : 0;

  let value = startValue;
  for (let i = 0; i < 7; i++) {
    const variance = variancePattern[i];
    value = value * (1 + trendFactor + variance);
    data.push(Math.round(value));
  }

  // Ensure last value matches current
  data[6] = currentValue;
  return data;
}

// Simple sparkline component
function Sparkline({ data, trend }: { data: number[]; trend: "up" | "down" | "neutral" }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 60;
      const y = 20 - ((value - min) / range) * 18;
      return `${x},${y}`;
    })
    .join(" ");

  const color = trend === "up" ? "#22c55e" : trend === "down" ? "#ef4444" : "#6b7280";

  return (
    <svg width="60" height="20" className="ml-auto" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function calculateTrend(
  current: number,
  previous: number
): { trend: "up" | "down" | "neutral"; percentage: number } {
  if (previous === 0) return { trend: "neutral", percentage: 0 };

  const change = ((current - previous) / previous) * 100;
  const trend = change > 0 ? "up" : change < 0 ? "down" : "neutral";

  return { trend, percentage: Math.abs(change) };
}

function KPICardSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 md:px-6 md:pt-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-3 w-32 mt-2" />
      </CardContent>
    </Card>
  );
}

function KPICard({
  title,
  value,
  previousValue,
  icon: Icon,
  format = "number",
  onClick,
  isLoading,
}: KPICardProps) {
  if (isLoading) {
    return <KPICardSkeleton />;
  }

  const numValue = typeof value === "string" ? parseFloat(value) : value;
  const trendData = previousValue
    ? calculateTrend(numValue, previousValue)
    : null;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      className="relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer group active:scale-[0.98] touch-manipulation"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${title}: ${formatValue(value, format)}${trendData ? `. ${trendData.trend === "up" ? "Increased" : "Decreased"} by ${trendData.percentage.toFixed(1)}% from last period` : ""}. Click for details.`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 md:px-6 md:pt-6">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
      </CardHeader>
      <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xl sm:text-2xl font-bold truncate">{formatValue(value, format)}</div>
          {trendData && (
            <Sparkline
              data={generate7DayTrend(numValue, trendData.trend)}
              trend={trendData.trend}
            />
          )}
        </div>
        {trendData && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
            {trendData.trend === "up" ? (
              <>
                <TrendingUp className="h-3 w-3 shrink-0 text-green-500" aria-hidden="true" />
                <span className="sr-only">Increase</span>
              </>
            ) : trendData.trend === "down" ? (
              <>
                <TrendingDown className="h-3 w-3 shrink-0 text-red-500" aria-hidden="true" />
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
            <span className="hidden sm:inline">from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type KPIMetric = "totalUsers" | "leagueParticipants" | "conversionRate" | "totalRevenue";

export function TopKPICards() {
  const [selectedMetric, setSelectedMetric] = React.useState<KPIMetric | null>(null);

  const { data: kpiData, isLoading: isLoadingKPI } = useDashboardKPI();
  const { data: sportMetrics, isLoading: isLoadingSports } = useSportMetrics();

  const isLoading = isLoadingKPI || isLoadingSports;

  const getMetricDetails = (metric: KPIMetric) => {
    if (!kpiData) return null;

    switch (metric) {
      case "totalUsers":
        return {
          title: "Total Users",
          value: kpiData.totalUsers,
          previousValue: kpiData.previousTotalUsers,
          description: "All registered users across all sports",
          breakdown: sportMetrics?.map(s => ({
            label: `${s.sport} users`,
            value: s.users,
          })) || [],
        };
      case "leagueParticipants":
        return {
          title: "League Participants",
          value: kpiData.leagueParticipants,
          previousValue: kpiData.previousLeagueParticipants,
          description: "Users actively participating in league matches",
          breakdown: sportMetrics?.map(s => ({
            label: `${s.sport} participants`,
            value: s.payingMembers,
          })) || [],
        };
      case "conversionRate":
        return {
          title: "Conversion Rate",
          value: kpiData.conversionRate,
          description: "Percentage of users who become paying members",
          breakdown: [
            { label: "Total paying members", value: kpiData.leagueParticipants },
            { label: "Total users", value: kpiData.totalUsers },
            { label: "Conversion rate", value: `${kpiData.conversionRate}%` },
          ],
        };
      case "totalRevenue":
        return {
          title: "Total Revenue",
          value: kpiData.totalRevenue,
          previousValue: kpiData.previousRevenue,
          description: "Combined revenue from all sports and membership fees",
          breakdown: sportMetrics?.map(s => ({
            label: `${s.sport} revenue`,
            value: `RM${s.revenue.toLocaleString()}`,
          })) || [],
        };
    }
  };

  const details = selectedMetric ? getMetricDetails(selectedMetric) : null;

  // Show loading state
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
      </div>
    );
  }

  // Handle no data state
  if (!kpiData) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full p-6 text-center text-muted-foreground">
          No dashboard data available
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Users"
          value={kpiData.totalUsers}
          previousValue={kpiData.previousTotalUsers}
          icon={Users}
          format="number"
          onClick={() => setSelectedMetric("totalUsers")}
        />
        <KPICard
          title="League Participants"
          value={kpiData.leagueParticipants}
          previousValue={kpiData.previousLeagueParticipants}
          icon={UserCheck}
          format="number"
          onClick={() => setSelectedMetric("leagueParticipants")}
        />
        <KPICard
          title="Conversion Rate"
          value={kpiData.conversionRate}
          icon={TrendingUp}
          format="percentage"
          onClick={() => setSelectedMetric("conversionRate")}
        />
        <KPICard
          title="Total Revenue"
          value={kpiData.totalRevenue}
          previousValue={kpiData.previousRevenue}
          icon={CreditCard}
          format="currency"
          onClick={() => setSelectedMetric("totalRevenue")}
        />
      </div>

      <Dialog open={!!selectedMetric} onOpenChange={(open) => !open && setSelectedMetric(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{details?.title}</DialogTitle>
            <DialogDescription>{details?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Current Value</span>
              <span className="text-2xl font-bold">
                {formatValue(
                  details?.value || 0,
                  selectedMetric === "totalRevenue"
                    ? "currency"
                    : selectedMetric === "conversionRate"
                    ? "percentage"
                    : "number"
                )}
              </span>
            </div>

            {details?.previousValue && (
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <span className="text-sm font-medium text-muted-foreground">
                  Previous Period
                </span>
                <span className="text-lg font-semibold">
                  {formatValue(
                    details.previousValue,
                    selectedMetric === "totalRevenue" ? "currency" : "number"
                  )}
                </span>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Breakdown</h4>
              {details?.breakdown.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium">
                    {typeof item.value === "number"
                      ? item.value.toLocaleString()
                      : item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
