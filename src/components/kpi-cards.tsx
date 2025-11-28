"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  CreditCard,
  X,
} from "lucide-react";
import { formatValue } from "@/lib/utils/format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  onClick?: () => void;
}

// formatValue function moved to @/lib/utils/format

// Mock 7-day trend data generator
function generate7DayTrend(currentValue: number, trend: "up" | "down" | "neutral"): number[] {
  const data: number[] = [];
  let value = currentValue * 0.85; // Start at 85% of current

  for (let i = 0; i < 7; i++) {
    const variance = (Math.random() - 0.5) * 0.05; // ±5% variance
    const trendFactor = trend === "up" ? 0.025 : trend === "down" ? -0.025 : 0;
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

function KPICard({
  title,
  value,
  previousValue,
  icon: Icon,
  format = "number",

  trend,
  onClick,
}: KPICardProps) {
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
      className="relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer group"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${title}: ${formatValue(value, format)}${trendData ? `. ${trendData.trend === "up" ? "Increased" : "Decreased"} by ${trendData.percentage.toFixed(1)}% from last period` : ""}. Click for details.`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{formatValue(value, format)}</div>
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

type KPIMetric = "totalUsers" | "leagueParticipants" | "conversionRate" | "totalRevenue";

export function TopKPICards() {
  const [selectedMetric, setSelectedMetric] = React.useState<KPIMetric | null>(null);

  const getMetricDetails = (metric: KPIMetric) => {
    switch (metric) {
      case "totalUsers":
        return {
          title: "Total Users",
          value: mockKPIData.totalUsers,
          previousValue: mockKPIData.previousTotalUsers,
          description: "All registered users across all sports",
          breakdown: [
            { label: "Active users (30 days)", value: 234 },
            { label: "New users (this month)", value: 25 },
            { label: "Inactive users", value: 50 },
          ],
        };
      case "leagueParticipants":
        return {
          title: "League Participants",
          value: mockKPIData.leagueParticipants,
          previousValue: mockKPIData.previousLeagueParticipants,
          description: "Users actively participating in league matches",
          breakdown: [
            { label: "Tennis league", value: 68 },
            { label: "Pickleball league", value: 42 },
            { label: "Padel league", value: 22 },
          ],
        };
      case "conversionRate":
        return {
          title: "Conversion Rate",
          value: mockKPIData.conversionRate,
          description: "Percentage of users who become paying members",
          breakdown: [
            { label: "Total paying members", value: 132 },
            { label: "Total users", value: 284 },
            { label: "Conversion rate", value: `${mockKPIData.conversionRate}%` },
          ],
        };
      case "totalRevenue":
        return {
          title: "Total Revenue",
          value: mockKPIData.totalRevenue,
          previousValue: mockKPIData.previousRevenue,
          description: "Combined revenue from all sports and membership fees",
          breakdown: [
            { label: "Tennis revenue", value: "RM1,700" },
            { label: "Pickleball revenue", value: "RM1,260" },
            { label: "Padel revenue", value: "RM1,000" },
          ],
        };
    }
  };

  const details = selectedMetric ? getMetricDetails(selectedMetric) : null;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Users"
          value={mockKPIData.totalUsers}
          previousValue={mockKPIData.previousTotalUsers}
          icon={Users}
          format="number"
          onClick={() => setSelectedMetric("totalUsers")}
        />
        <KPICard
          title="League Participants"
          value={mockKPIData.leagueParticipants}
          previousValue={mockKPIData.previousLeagueParticipants}
          icon={UserCheck}
          format="number"
          onClick={() => setSelectedMetric("leagueParticipants")}
        />
        <KPICard
          title="Conversion Rate"
          value={mockKPIData.conversionRate}
          icon={TrendingUp}
          format="percentage"
          onClick={() => setSelectedMetric("conversionRate")}
        />
        <KPICard
          title="Total Revenue"
          value={mockKPIData.totalRevenue}
          previousValue={mockKPIData.previousRevenue}
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
