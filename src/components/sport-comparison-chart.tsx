"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useSportComparison } from "@/hooks/use-queries";
import { formatValue as formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

const chartConfig = {
  payingMembers: {
    label: "Paying Members",
    color: "var(--chart-sport-members)",
  },
  revenue: {
    label: "Revenue (RM)",
    color: "var(--chart-sport-revenue)",
  },
} satisfies ChartConfig;

type MetricType = "payingMembers" | "revenue";

interface SportComparisonChartProps {
  chartRange?: "monthly" | "average";
  historyRange?: 1 | 3 | 6;
}

function ChartSkeleton() {
  return (
    <Card className="h-full flex flex-col border border-border">
      <CardHeader className="pb-0 pt-2 px-5 shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-5 w-36 mb-1" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-28" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-4 px-5 pb-5 min-h-0">
        <div className="flex items-center gap-6 mb-5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex-1 min-h-[280px]">
          <Skeleton className="h-full w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SportComparisonChart({
  chartRange = "monthly",
  historyRange = 3,
}: SportComparisonChartProps) {
  const [activeMetric, setActiveMetric] = React.useState<MetricType>("payingMembers");

  const { data: chartData, isLoading, error } = useSportComparison();

  const formatMetricValue = (value: number, metric: MetricType) => {
    if (metric === "revenue") {
      return formatCurrency(value, "currency");
    }
    return formatCurrency(value, "number");
  };

  const getYAxisDomain = (metric: MetricType): [number, number] => {
    if (!chartData) return [0, 100];
    const values = chartData.map((item) => item[metric]);
    const max = Math.max(...values);
    if (!isFinite(max) || max <= 0) {
      return [0, 100];
    }
    // Round up to nice even numbers
    const rawMax = max * 1.1;
    let niceMax: number;
    if (rawMax <= 10) {
      niceMax = Math.ceil(rawMax / 2) * 2; // Round to nearest 2
    } else if (rawMax <= 50) {
      niceMax = Math.ceil(rawMax / 10) * 10; // Round to nearest 10
    } else if (rawMax <= 200) {
      niceMax = Math.ceil(rawMax / 25) * 25; // Round to nearest 25
    } else if (rawMax <= 1000) {
      niceMax = Math.ceil(rawMax / 100) * 100; // Round to nearest 100
    } else {
      niceMax = Math.ceil(rawMax / 500) * 500; // Round to nearest 500
    }
    return [0, niceMax];
  };

  const totalMembers = React.useMemo(
    () => chartData?.reduce((sum, item) => sum + item.payingMembers, 0) ?? 0,
    [chartData]
  );
  const totalRevenue = React.useMemo(
    () => chartData?.reduce((sum, item) => sum + item.revenue, 0) ?? 0,
    [chartData]
  );

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (error || !chartData || chartData.length === 0) {
    return (
      <Card className="h-full flex flex-col border border-border">
        <CardHeader className="pb-0 pt-2 px-5 shrink-0">
          <CardTitle className="text-base font-medium">Sport Comparison</CardTitle>
          <CardDescription className="text-xs">No data available</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center px-5 min-h-0">
          <div className="text-sm text-muted-foreground">
            No sport comparison data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border border-border">
      <CardHeader className="pb-4 pt-2 px-5 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base font-medium">Sport Comparison</CardTitle>
            <CardDescription className="text-xs">
              {chartRange === "average" ? "Weekly average" : "Monthly"} for past {historyRange}mo
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Members</span>
              <span className="text-sm font-medium tabular-nums">{totalMembers.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Revenue</span>
              <span className="text-sm font-medium tabular-nums">{formatMetricValue(totalRevenue, "revenue")}</span>
            </div>
            <div className="inline-flex items-center rounded-md bg-muted/60 p-0.5 shrink-0 border border-border/50">
              <button
                onClick={() => setActiveMetric("payingMembers")}
                className={cn(
                  "inline-flex items-center justify-center rounded px-3 py-1.5 text-xs font-medium transition-all cursor-pointer h-8 touch-manipulation",
                  activeMetric === "payingMembers"
                    ? "bg-background text-foreground shadow-sm border border-border/50"
                    : "text-foreground/70 hover:text-foreground"
                )}
              >
                Members
              </button>
              <button
                onClick={() => setActiveMetric("revenue")}
                className={cn(
                  "inline-flex items-center justify-center rounded px-3 py-1.5 text-xs font-medium transition-all cursor-pointer h-8 touch-manipulation",
                  activeMetric === "revenue"
                    ? "bg-background text-foreground shadow-sm border border-border/50"
                    : "text-foreground/70 hover:text-foreground"
                )}
              >
                Revenue
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col px-5 pb-5 min-h-0">

        {/* Chart */}
        <div className="flex-1 min-h-[280px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart
              key={activeMetric}
              accessibilityLayer
              data={chartData}
              margin={{ left: 10, right: 10, top: 10, bottom: 25 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="var(--border)"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="sport"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
                label={{
                  value: "Sport",
                  position: "bottom",
                  offset: 10,
                  style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={getYAxisDomain(activeMetric)}
                tickFormatter={(value) => {
                  if (activeMetric === "revenue") {
                    return value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`;
                  }
                  return value.toString();
                }}
                tick={{ fontSize: 11 }}
                width={45}
                label={{
                  value: activeMetric === "payingMembers" ? "Members" : "Revenue (RM)",
                  angle: -90,
                  position: "insideLeft",
                  offset: 0,
                  style: { fontSize: 11, fill: "hsl(var(--muted-foreground))", textAnchor: "middle" },
                }}
              />
              <ChartTooltip
                cursor={{ fill: "hsl(var(--muted))", fillOpacity: 0.3 }}
                content={
                  <ChartTooltipContent
                    className="w-[160px]"
                    labelFormatter={(value) => `${value}`}
                    formatter={(value, name, payload) => {
                      const sportData = payload?.payload;
                      return [
                        <div className="flex items-center gap-2" key={name}>
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: sportData?.fill }}
                          />
                          <span className="text-sm font-medium tabular-nums">
                            {formatMetricValue(value as number, activeMetric)}
                          </span>
                        </div>,
                        <span className="text-xs text-muted-foreground" key={`${name}-label`}>
                          {activeMetric === "payingMembers" ? "Members" : "Revenue"}
                        </span>,
                      ];
                    }}
                    indicator="dot"
                  />
                }
              />
              <Bar
                dataKey={activeMetric}
                fill={`var(--color-${activeMetric})`}
                radius={[3, 3, 0, 0]}
                animationDuration={500}
                animationEasing="ease-out"
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
