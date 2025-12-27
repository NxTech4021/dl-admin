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
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-container";
import { useDashboardKPI, useSportMetrics } from "@/hooks/use-queries";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  icon: React.ComponentType<{ className?: string }>;
  format?: "number" | "currency" | "percentage";
  onClick?: () => void;
  isLoading?: boolean;
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
    <Card className="relative overflow-hidden h-full flex flex-col border border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent className="flex-1 px-4 pb-4">
        <Skeleton className="h-9 w-24 mb-3" />
        <Skeleton className="h-3 w-28" />
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

  return (
    <Card
      className={cn(
        "relative overflow-hidden h-full flex flex-col border border-border",
        onClick && "cursor-pointer hover:bg-muted/30 transition-colors"
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `${title}: ${formatValue(value, format)}. Click for details.` : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground/60" />
      </CardHeader>
      <CardContent className="flex-1 px-4 pb-4">
        <div className="text-3xl font-semibold tracking-tight tabular-nums">
          {formatValue(value, format)}
        </div>
        {trendData && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            {trendData.trend === "up" ? (
              <TrendingUp className="h-3 w-3 text-emerald-600" />
            ) : trendData.trend === "down" ? (
              <TrendingDown className="h-3 w-3 text-red-500" />
            ) : null}
            <span
              className={cn(
                trendData.trend === "up" && "text-emerald-600",
                trendData.trend === "down" && "text-red-500"
              )}
            >
              {trendData.percentage > 0 && `${trendData.percentage.toFixed(1)}%`}
            </span>
            <span>vs last period</span>
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

  // Show loading state with stagger
  if (isLoading) {
    return (
      <StaggerContainer className="grid gap-4 grid-cols-2 lg:grid-cols-4" staggerDelay={0.05}>
        <StaggerItem><KPICardSkeleton /></StaggerItem>
        <StaggerItem><KPICardSkeleton /></StaggerItem>
        <StaggerItem><KPICardSkeleton /></StaggerItem>
        <StaggerItem><KPICardSkeleton /></StaggerItem>
      </StaggerContainer>
    );
  }

  // Handle no data state
  if (!kpiData) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full p-6 text-center text-muted-foreground border border-border">
          No dashboard data available
        </Card>
      </div>
    );
  }

  return (
    <>
      <StaggerContainer className="grid gap-4 grid-cols-2 lg:grid-cols-4" staggerDelay={0.05}>
        <StaggerItem>
          <KPICard
            title="Total Users"
            value={kpiData.totalUsers}
            previousValue={kpiData.previousTotalUsers}
            icon={Users}
            format="number"
            onClick={() => setSelectedMetric("totalUsers")}
          />
        </StaggerItem>
        <StaggerItem>
          <KPICard
            title="League Participants"
            value={kpiData.leagueParticipants}
            previousValue={kpiData.previousLeagueParticipants}
            icon={UserCheck}
            format="number"
            onClick={() => setSelectedMetric("leagueParticipants")}
          />
        </StaggerItem>
        <StaggerItem>
          <KPICard
            title="Conversion Rate"
            value={kpiData.conversionRate}
            icon={TrendingUp}
            format="percentage"
            onClick={() => setSelectedMetric("conversionRate")}
          />
        </StaggerItem>
        <StaggerItem>
          <KPICard
            title="Total Revenue"
            value={kpiData.totalRevenue}
            previousValue={kpiData.previousRevenue}
            icon={CreditCard}
            format="currency"
            onClick={() => setSelectedMetric("totalRevenue")}
          />
        </StaggerItem>
      </StaggerContainer>

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
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
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
