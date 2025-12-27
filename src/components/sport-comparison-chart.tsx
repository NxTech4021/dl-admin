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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSportComparison } from "@/hooks/use-queries";
import { formatValue as formatCurrency } from "@/lib/utils/format";

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
      <CardHeader className="pb-0 pt-5 px-5 shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-5 w-36 mb-1" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-28" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-5 px-5 pb-5 min-h-0">
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

  const getYAxisDomain = (metric: MetricType) => {
    if (!chartData) return [0, 100];
    const values = chartData.map((item) => item[metric]);
    const max = Math.max(...values);
    if (!isFinite(max) || max <= 0) {
      return [0, 100];
    }
    return [0, Math.ceil(max * 1.1)];
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
        <CardHeader className="pb-0 pt-5 px-5 shrink-0">
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
      <CardHeader className="pb-0 pt-5 px-5 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base font-medium">Sport Comparison</CardTitle>
            <CardDescription className="text-xs">
              {chartRange === "average" ? "Weekly average" : "Monthly"} for past {historyRange}mo
            </CardDescription>
          </div>
          <Select
            value={activeMetric}
            onValueChange={(value) => setActiveMetric(value as MetricType)}
          >
            <SelectTrigger className="w-[120px] h-8 text-xs border-border/50" aria-label="Select metric">
              <SelectValue placeholder="Metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="payingMembers" className="text-xs">Members</SelectItem>
              <SelectItem value="revenue" className="text-xs">Revenue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-5 px-5 pb-5 min-h-0">
        {/* Inline totals */}
        <div className="flex items-center gap-6 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Members</span>
            <span className="text-sm font-medium tabular-nums">{totalMembers.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Revenue</span>
            <span className="text-sm font-medium tabular-nums">{formatMetricValue(totalRevenue, "revenue")}</span>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 min-h-[280px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 0, right: 0, top: 10, bottom: 10 }}
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
                width={40}
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
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
