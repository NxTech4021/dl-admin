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
import { getUserGrowthData, getUserGrowthThisWeekData } from "@/data/mock-chart-data";

// === Chart configuration
const chartConfig = {
  users: {
    label: "User Growth",
  },
  totalUsers: {
    label: "Total Users",
    color: "#3B82F6",
  },
  payingMembers: {
    label: "Paying Members",
    color: "#FACC15", // changed to yellow
  },
} satisfies ChartConfig;

interface UserGrowthChartProps {
  chartRange?: "monthly" | "average" | "thisWeek";
  historyRange?: 1 | 3 | 6;
}

export function UserGrowthChart({
  chartRange = "monthly",
  historyRange = 3,
}: UserGrowthChartProps) {
  // Use static mock data based on history range
  const chartData = React.useMemo(() => 
    getUserGrowthData(historyRange), 
    [historyRange]
  );

  const formatMonth = (value: string) => {
    // Handle special cases like "Week X", "Week of...", or other custom labels
    if (value.includes("Week") || value.includes("This Week")) {
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
    if (chartRange === "average") {
      // Calculate weekly averages (divide monthly data by ~4.3 weeks)
      return chartData.map((item, index) => ({
        ...item,
        totalUsers: Math.round(item.totalUsers / 4.3),
        payingMembers: Math.round(item.payingMembers / 4.3),
        month: `Week ${index + 1}`,
      }));
    }

    if (chartRange === "thisWeek") {
      // using mock data
      const weeklyData = getUserGrowthThisWeekData(chartData);
      
      return [weeklyData];
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

      <CardContent className="px-4 py-6 sm:px-8 sm:py-8">
        {/* === Totals === */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <div className="text-2xl font-bold">
              {total.totalUsers.toLocaleString()}
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Paying Members</span>
            </div>
            <div className="text-2xl font-bold text-yellow-500">
              {total.payingMembers.toLocaleString()}
            </div>
          </div>
        </div>

        {/* === Chart === */}
        <ChartContainer
          key={`${chartRange}-${historyRange}`} // Force re-render when props change
          config={chartConfig}
          className="aspect-auto h-[450px] w-full"
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
