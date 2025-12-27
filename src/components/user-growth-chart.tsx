"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
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
import { useUserGrowth } from "@/hooks/use-queries";

// === Constants
const WEEKS_PER_MONTH = 4.3;

// === Chart configuration
const chartConfig = {
  users: {
    label: "User Growth",
  },
  totalUsers: {
    label: "Total Users",
    color: "var(--chart-user-total)",
  },
  payingMembers: {
    label: "Paying Members",
    color: "var(--chart-user-paying)",
  },
} satisfies ChartConfig;

interface UserGrowthChartProps {
  chartRange?: "monthly" | "average";
  historyRange?: 1 | 3 | 6;
}

function ChartSkeleton() {
  return (
    <Card className="h-full flex flex-col border border-border">
      <CardHeader className="pb-0 pt-5 px-5 shrink-0">
        <Skeleton className="h-5 w-32 mb-1" />
        <Skeleton className="h-3 w-48" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-5 px-5 pb-5 min-h-0">
        <div className="flex items-center gap-6 mb-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex-1 min-h-[280px]">
          <Skeleton className="h-full w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function UserGrowthChart({
  chartRange = "monthly",
  historyRange = 3,
}: UserGrowthChartProps) {
  // Fetch real data from API
  const { data: chartData, isLoading, error } = useUserGrowth(historyRange);

  const formatMonth = (value: string) => {
    if (value.includes("Week") || value.includes("This Week")) {
      return value;
    }
    if (["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].includes(value)) {
      return value;
    }
    try {
      const date = new Date(value + "-01");
      return date.toLocaleDateString("en-US", {
        month: "short",
      });
    } catch {
      return value;
    }
  };

  const transformedData = React.useMemo(() => {
    if (!chartData) return [];

    if (chartRange === "average") {
      return chartData.map((item, index) => ({
        ...item,
        totalUsers: Math.round(item.totalUsers / WEEKS_PER_MONTH),
        payingMembers: Math.round(item.payingMembers / WEEKS_PER_MONTH),
        month: `Week ${index + 1}`,
      }));
    }

    return chartData;
  }, [chartRange, chartData]);

  const total = React.useMemo(
    () => ({
      totalUsers: transformedData[transformedData.length - 1]?.totalUsers ?? 0,
      payingMembers:
        transformedData[transformedData.length - 1]?.payingMembers ?? 0,
    }),
    [transformedData]
  );

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (error || !chartData || chartData.length === 0) {
    return (
      <Card className="h-full flex flex-col border border-border">
        <CardHeader className="pb-0 pt-5 px-5 shrink-0">
          <CardTitle className="text-base font-medium">User Growth</CardTitle>
          <CardDescription className="text-xs">No data available</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center px-5 min-h-0">
          <div className="text-sm text-muted-foreground">
            No user growth data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border border-border">
      <CardHeader className="pb-0 pt-5 px-5 shrink-0">
        <CardTitle className="text-base font-medium">User Growth</CardTitle>
        <CardDescription className="text-xs">
          {chartRange === "average" ? "Weekly average" : "Monthly"} for past {historyRange}mo
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-5 px-5 pb-5 min-h-0">
        {/* Inline legend/totals */}
        <div className="flex items-center gap-6 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--chart-user-total)]" />
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-sm font-medium tabular-nums">{total.totalUsers.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--chart-user-paying)]" />
            <span className="text-xs text-muted-foreground">Paying</span>
            <span className="text-sm font-medium tabular-nums">{total.payingMembers.toLocaleString()}</span>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 min-h-[280px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart
              accessibilityLayer
              data={transformedData}
              margin={{ left: 0, right: 0, top: 10, bottom: 10 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="var(--border)"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={formatMonth}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.toString()}
                domain={["dataMin - 10", "dataMax + 10"]}
                tick={{ fontSize: 11 }}
                width={40}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[160px]"
                    labelFormatter={(value) => {
                      if (value.includes("Week") || value.includes("This Week")) {
                        return value;
                      }
                      if (["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].includes(value)) {
                        return value;
                      }
                      try {
                        return new Date(value + "-01").toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        });
                      } catch {
                        return value;
                      }
                    }}
                    formatter={(value, name) => {
                      const config = chartConfig[name as keyof typeof chartConfig];
                      const color = "color" in config ? config.color : "#374F35";
                      return [
                        <div className="flex items-center gap-2" key={name}>
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-sm font-medium tabular-nums">
                            {new Intl.NumberFormat().format(value as number)}
                          </span>
                        </div>,
                        <span className="text-xs text-muted-foreground" key={`${name}-label`}>
                          {config?.label || name}
                        </span>,
                      ];
                    }}
                  />
                }
              />
              <Line
                dataKey="totalUsers"
                type="monotone"
                stroke="var(--color-totalUsers)"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                dataKey="payingMembers"
                type="monotone"
                stroke="var(--color-payingMembers)"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
