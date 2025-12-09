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
import { UserCheck, CreditCard } from "lucide-react";
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
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-2 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </div>
        <Skeleton className="h-10 w-40" />
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

export function SportComparisonChart({
  chartRange = "monthly",
  historyRange = 3,
}: SportComparisonChartProps) {
  const [activeMetric, setActiveMetric] =
    React.useState<MetricType>("payingMembers");

  // Fetch real data from API
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

  const totalMembers = React.useMemo(() =>
    chartData?.reduce((sum, item) => sum + item.payingMembers, 0) ?? 0,
    [chartData]
  );
  const totalRevenue = React.useMemo(() =>
    chartData?.reduce((sum, item) => sum + item.revenue, 0) ?? 0,
    [chartData]
  );

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (error || !chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-2 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Sport Comparison</CardTitle>
            <CardDescription>No data available</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No sport comparison data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-2 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Sport Comparison</CardTitle>
          <CardDescription>
            Compare paying members and revenue across sports - {chartRange === "average" ? "Weekly average" : "Monthly"} ({historyRange} month{historyRange > 1 ? "s" : ""})
          </CardDescription>
        </div>
        <Select
          value={activeMetric}
          onValueChange={(value) => setActiveMetric(value as MetricType)}
        >
          <SelectTrigger
            className="w-full sm:w-[160px] h-9 sm:h-10 rounded-lg sm:ml-auto touch-manipulation"
            aria-label="Select metric"
          >
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="payingMembers" className="rounded-lg">
              Paying Members
            </SelectItem>
            <SelectItem value="revenue" className="rounded-lg">
              Revenue
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Paying Members</span>
            </div>
            <div className="text-2xl font-bold">
              {totalMembers.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Across all sports
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Revenue</span>
            </div>
            <div className="text-2xl font-bold">
              {formatMetricValue(totalRevenue, "revenue")}
            </div>
            <div className="text-xs text-muted-foreground">
              Combined from all sports
            </div>
          </div>
        </div>

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-muted"
            />
            <XAxis
              dataKey="sport"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={getYAxisDomain(activeMetric)}
              tickFormatter={(value) => {
                if (activeMetric === "revenue") {
                  return value >= 1000
                    ? `RM${(value / 1000).toFixed(1)}k`
                    : `RM${value}`;
                }
                return value.toString();
              }}
              className="text-xs"
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", fillOpacity: 0.3 }}
              content={
                <ChartTooltipContent
                  className="w-[180px]"
                  labelFormatter={(value) => `${value}`}
                  formatter={(value, name, payload) => {
                    const sportData = payload?.payload;
                    return [
                      <div className="flex items-center gap-2" key={name}>
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: sportData?.fill }}
                        />
                        <span className="font-medium">
                          {formatMetricValue(value as number, activeMetric)}
                        </span>
                      </div>,
                      <span
                        className="text-muted-foreground text-xs"
                        key={`${name}-label`}
                      >
                        {activeMetric === "payingMembers"
                          ? "Paying Members"
                          : "Revenue"}
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
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
          {chartData.map((sport) => (
            <div
              key={sport.sport}
              className="flex flex-col space-y-2 p-3 sm:p-4 rounded-lg border bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0"
                  style={{ backgroundColor: sport.fill }}
                />
                <span className="text-sm font-medium">{sport.sport}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Members</p>
                  <p className="text-sm font-semibold truncate">
                    {sport.payingMembers.toLocaleString()}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Revenue</p>
                  <p className="text-sm font-semibold truncate">
                    {formatMetricValue(sport.revenue, "revenue")}
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground leading-tight">
                {totalMembers > 0
                  ? ((sport.payingMembers / totalMembers) * 100).toFixed(1)
                  : 0}% of total
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
