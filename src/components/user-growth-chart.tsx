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
import { Users, UserCheck } from "lucide-react";
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
  chartRange?: "monthly" | "average" | "thisWeek";
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
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <Skeleton className="h-[300px] w-full" />
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
    // Handle special cases like "Week X", "Week of...", or other custom labels
    if (value.includes("Week") || value.includes("This Week")) {
      return value;
    }
    // For day names (Mon, Tue, etc.)
    if (["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].includes(value)) {
      return value;
    }
    // For regular month strings, format as date
    try {
      const date = new Date(value + "-01");
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return value; // Fallback to original value
    }
  };

  // === Chart Range logic (monthly, average/week, thisWeek)
  const transformedData = React.useMemo(() => {
    if (!chartData) return [];

    if (chartRange === "average") {
      // Calculate weekly averages (divide monthly data by ~4.3 weeks)
      return chartData.map((item, index) => ({
        ...item,
        totalUsers: Math.round(item.totalUsers / WEEKS_PER_MONTH),
        payingMembers: Math.round(item.payingMembers / WEEKS_PER_MONTH),
        month: `Week ${index + 1}`,
      }));
    }

    if (chartRange === "thisWeek") {
      // Generate daily data for the current week based on latest month
      const latestMonth = chartData[chartData.length - 1] || { totalUsers: 0, payingMembers: 0 };
      const weeklyUsers = Math.round(latestMonth.totalUsers / 4.3);
      const weeklyMembers = Math.round(latestMonth.payingMembers / 4.3);

      return [
        { month: "Mon", totalUsers: Math.round(weeklyUsers * 0.8), payingMembers: Math.round(weeklyMembers * 0.8) },
        { month: "Tue", totalUsers: Math.round(weeklyUsers * 0.85), payingMembers: Math.round(weeklyMembers * 0.85) },
        { month: "Wed", totalUsers: Math.round(weeklyUsers * 0.9), payingMembers: Math.round(weeklyMembers * 0.9) },
        { month: "Thu", totalUsers: Math.round(weeklyUsers * 0.95), payingMembers: Math.round(weeklyMembers * 0.95) },
        { month: "Fri", totalUsers: weeklyUsers, payingMembers: weeklyMembers },
        { month: "Sat", totalUsers: Math.round(weeklyUsers * 1.05), payingMembers: Math.round(weeklyMembers * 1.05) },
        { month: "Sun", totalUsers: Math.round(weeklyUsers * 1.1), payingMembers: Math.round(weeklyMembers * 1.1) },
      ];
    }

    // Default monthly
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
      <Card>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-2 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>User Growth Over Time</CardTitle>
            <CardDescription>No data available</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No user growth data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-2 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>User Growth Over Time</CardTitle>
          <CardDescription>
            Showing {chartRange === "average"
              ? "average per week"
              : chartRange === "thisWeek"
              ? "this week"
              : "monthly"}{" "}
            data for the past {historyRange} month
            {historyRange > 1 ? "s" : ""}
          </CardDescription>
        </div>

        {/* Range info display */}
        <div className="text-sm text-muted-foreground">
          {chartRange === "average" ? "Weekly Average" : chartRange === "thisWeek" ? "Current Week" : "Monthly"} • {historyRange} month{historyRange > 1 ? "s" : ""}
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {/* === Totals === */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {total.totalUsers.toLocaleString()}
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Paying Members</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-yellow-500">
              {total.payingMembers.toLocaleString()}
            </div>
          </div>
        </div>

        {/* === Chart === */}
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] sm:h-[400px] md:h-[450px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={transformedData}
            margin={{
              left: 20,
              right: 20,
              top: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={formatMonth}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toString()}
              domain={["dataMin - 10", "dataMax + 10"]}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[180px]"
                  labelFormatter={(value) => {
                    // Handle special cases like "Week X", "Week of...", or other custom labels
                    if (value.includes("Week") || value.includes("This Week")) {
                      return value;
                    }
                    // For day names
                    if (["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].includes(value)) {
                      return value;
                    }
                    // For regular month strings, format as date
                    try {
                      return new Date(value + "-01").toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      );
                    } catch (e) {
                      return value; // Fallback to original value
                    }
                  }}
                  formatter={(value, name) => {
                    const config =
                      chartConfig[name as keyof typeof chartConfig];
                    const color =
                      "color" in config ? config.color : "#374F35";
                    return [
                      <div className="flex items-center gap-2" key={name}>
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-medium">
                          {new Intl.NumberFormat().format(value as number)}
                        </span>
                      </div>,
                      <span
                        className="text-xs text-muted-foreground"
                        key={`${name}-label`}
                      >
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
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="payingMembers"
              type="monotone"
              stroke="var(--color-payingMembers)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
