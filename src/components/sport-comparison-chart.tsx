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

// Mock data for sport comparison (realistic for 100+ member app)
const chartData = [
  {
    sport: "Tennis",
    payingMembers: 68,
    revenue: 1700,
    fill: "#ABFE4D",
  },
  {
    sport: "Pickleball",
    payingMembers: 42,
    revenue: 1260,
    fill: "#A04DFE",
  },
  {
    sport: "Padel",
    payingMembers: 22,
    revenue: 1000,
    fill: "#4DABFE",
  },
];

const chartConfig = {
  payingMembers: {
    label: "Paying Members",
    color: "#374F35",
  },
  revenue: {
    label: "Revenue (RM)",
    color: "#512546",
  },
} satisfies ChartConfig;

type MetricType = "payingMembers" | "revenue";

export function SportComparisonChart() {
  const [activeMetric, setActiveMetric] =
    React.useState<MetricType>("payingMembers");

  const formatValue = (value: number, metric: MetricType) => {
    if (metric === "revenue") {
      return new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: "MYR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return new Intl.NumberFormat("en-US").format(value);
  };

  const getYAxisDomain = (metric: MetricType) => {
    const values = chartData.map((item) => item[metric]);
    const max = Math.max(...values);
    return [0, Math.ceil(max * 1.1)];
  };

  const totalMembers = chartData.reduce(
    (sum, item) => sum + item.payingMembers,
    0
  );
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-2 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Sport Comparison</CardTitle>
          <CardDescription>
            Compare paying members and revenue across sports
          </CardDescription>
        </div>
        <Select
          value={activeMetric}
          onValueChange={(value) => setActiveMetric(value as MetricType)}
        >
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
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
        <div className="grid gap-4 md:grid-cols-2 mb-6">
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
              {formatValue(totalRevenue, "revenue")}
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
                          {formatValue(value as number, activeMetric)}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
          {chartData.map((sport) => (
            <div
              key={sport.sport}
              className="flex flex-col space-y-2 p-4 rounded-lg border bg-muted/50"
            >
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: sport.fill }}
                />
                <span className="font-medium">{sport.sport}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Members</p>
                  <p className="font-semibold">
                    {sport.payingMembers.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Revenue</p>
                  <p className="font-semibold">
                    {formatValue(sport.revenue, "revenue")}
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {((sport.payingMembers / totalMembers) * 100).toFixed(1)}% of
                total members
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
