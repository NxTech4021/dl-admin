"use client";

import * as React from "react";

import {
  Line,
  LineChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Static mock data for the last 12 weeks (realistic for 100+ member app with fluctuations)

// Generate dynamic mock data based on chart range and history range

const generateMatchData = (
  chartRange: "monthly" | "average" | "thisWeek",
  historyRange: 1 | 3 | 6
) => {
  const weeksToShow = historyRange * 4; // Approximate weeks per month

  const data = [];

  const currentDate = new Date();

  // Base match numbers per sport

  const baseMatches = {
    tennisLeague: 12,
    tennisFriendly: 7,

    pickleballLeague: 8,
    pickleballFriendly: 5,

    padelLeague: 4,
    padelFriendly: 3,
  };

  const multiplier =
    chartRange === "average" ? 1 : chartRange === "thisWeek" ? 1.2 : 1;

  for (let i = weeksToShow - 1; i >= 0; i--) {
    const weekDate = new Date(currentDate);

    weekDate.setDate(weekDate.getDate() - i * 7);

    const randomVariation = () => 0.7 + Math.random() * 0.6; // ±30% variation

    data.push({
      week: `Week ${weeksToShow - i}`,

      date: weekDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),

      tennisLeague: Math.round(
        baseMatches.tennisLeague * multiplier * randomVariation()
      ),

      tennisFriendly: Math.round(
        baseMatches.tennisFriendly * multiplier * randomVariation()
      ),

      pickleballLeague: Math.round(
        baseMatches.pickleballLeague * multiplier * randomVariation()
      ),

      pickleballFriendly: Math.round(
        baseMatches.pickleballFriendly * multiplier * randomVariation()
      ),

      padelLeague: Math.round(
        baseMatches.padelLeague * multiplier * randomVariation()
      ),

      padelFriendly: Math.round(
        baseMatches.padelFriendly * multiplier * randomVariation()
      ),
    });
  }

  return data;
};

const chartConfig = {
  tennisLeague: {
    label: "Tennis League",

    color: "#ABFE4D",
  },

  tennisFriendly: {
    label: "Tennis Friendly",

    color: "#8FE83A",
  },

  pickleballLeague: {
    label: "Pickleball League",

    color: "#A04DFE",
  },

  pickleballFriendly: {
    label: "Pickleball Friendly",

    color: "#B366FF",
  },

  padelLeague: {
    label: "Padel League",

    color: "#4DABFE",
  },

  padelFriendly: {
    label: "Padel Friendly",

    color: "#6BB6FF",
  },
} satisfies ChartConfig;

type SportFilter = "all" | "tennis" | "pickleball" | "padel";

type ChartType = "line" | "bar";

interface MatchActivityChartProps {
  chartRange?: "monthly" | "average" | "thisWeek";

  historyRange?: 1 | 3 | 6;
}

export function MatchActivityChart({
  chartRange = "monthly",

  historyRange = 3,
}: MatchActivityChartProps) {
  const [sportFilter, setSportFilter] = React.useState<SportFilter>("all");

  const [chartType, setChartType] = React.useState<ChartType>("line");

  // Generate data based on current props

  const chartData = React.useMemo(
    () => generateMatchData(chartRange, historyRange),

    [chartRange, historyRange]
  );

  const getFilteredConfig = (sport: SportFilter) => {
    if (sport === "all") return chartConfig;

    const filtered: ChartConfig = {};

    Object.entries(chartConfig).forEach(([key, value]) => {
      if (key.startsWith(sport)) {
        filtered[key] = value;
      }
    });

    return filtered;
  };

  const getDataKeys = (sport: SportFilter) => {
    if (sport === "all") {
      return Object.keys(chartConfig);
    }

    return Object.keys(chartConfig).filter((key) => key.startsWith(sport));
  };

  const aggregatedData = React.useMemo(() => {
    return chartData.map((item) => {
      const keys = getDataKeys(sportFilter);

      const total = keys.reduce(
        (sum, key) => sum + (item[key as keyof typeof item] as number),
        0
      );

      return { ...item, total };
    });
  }, [chartData, sportFilter]);

  const filteredConfig = getFilteredConfig(sportFilter);

  const dataKeys = getDataKeys(sportFilter);

  const totalMatches = aggregatedData.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const avgMatchesPerWeek = Math.round(totalMatches / aggregatedData.length);

  const latestWeek = aggregatedData[aggregatedData.length - 1];

  const previousWeek = aggregatedData[aggregatedData.length - 2];

  const weeklyGrowth = previousWeek
    ? ((latestWeek.total - previousWeek.total) / previousWeek.total) * 100
    : 0;

  const getSportDisplayName = (sport: SportFilter) => {
    switch (sport) {
      case "all":
        return "All Sports";

      case "tennis":
        return "Tennis";

      case "pickleball":
        return "Pickleball";

      case "padel":
        return "Padel";

      default:
        return "All Sports";
    }
  };

  const ChartComponent = chartType === "line" ? LineChart : BarChart;

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-2 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Match Activity</CardTitle>

          <CardDescription>
            Weekly matches (league + friendly) per sport -{" "}
            {chartRange === "average"
              ? "Average per week"
              : chartRange === "thisWeek"
              ? "This week"
              : "Monthly"}{" "}
            ({historyRange} month{historyRange > 1 ? "s" : ""})
          </CardDescription>
        </div>

        <div className="flex items-center space-x-2">
          <Select
            value={sportFilter}
            onValueChange={(value) => setSportFilter(value as SportFilter)}
          >
            <SelectTrigger className="w-[120px] rounded-lg">
              <SelectValue />
            </SelectTrigger>

            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg">
                All Sports
              </SelectItem>

              <SelectItem value="tennis" className="rounded-lg">
                Tennis
              </SelectItem>

              <SelectItem value="pickleball" className="rounded-lg">
                Pickleball
              </SelectItem>

              <SelectItem value="padel" className="rounded-lg">
                Padel
              </SelectItem>
            </SelectContent>
          </Select>

          <ToggleGroup
            type="single"
            value={chartType}
            onValueChange={(value) => value && setChartType(value as ChartType)}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="line">Line</ToggleGroupItem>

            <ToggleGroupItem value="bar">Bar</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {getSportDisplayName(sportFilter)}
              </Badge>
            </div>

            <div className="text-2xl font-bold">
              {totalMatches.toLocaleString()}
            </div>

            <div className="text-xs text-muted-foreground">
              Total matches ({chartData.length} weeks)
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium">Average per Week</span>

            <div className="text-2xl font-bold">{avgMatchesPerWeek}</div>

            <div className="text-xs text-muted-foreground">
              Matches per week
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium">This Week</span>

            <div className="text-2xl font-bold">{latestWeek.total}</div>

            <div className="text-xs text-muted-foreground">
              {weeklyGrowth > 0 ? "+" : ""}
              {weeklyGrowth.toFixed(1)}% from last week
            </div>
          </div>
        </div>

        <ChartContainer
          config={filteredConfig}
          className="aspect-auto h-[350px] w-full"
        >
          <ChartComponent
            accessibilityLayer
            data={aggregatedData}
            margin={{
              left: 12,

              right: 12,

              top: 12,

              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              className="text-xs"
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />

            <ChartTooltip
              cursor={
                chartType === "line"
                  ? {
                      strokeDasharray: "3 3",
                      stroke: "hsl(var(--muted-foreground))",
                      strokeWidth: 1,
                    }
                  : { fill: "hsl(var(--muted))", fillOpacity: 0.3 }
              }
              content={
                <ChartTooltipContent
                  className="w-[220px]"
                  labelFormatter={(value) => `${value}`}
                  formatter={(value, name, item, index) => {
                    const config =
                      filteredConfig[name as keyof typeof filteredConfig];

                    const matchType = name.toString().includes("League")
                      ? "League"
                      : "Friendly";

                    const sport = name
                      .toString()
                      .replace("League", "")
                      .replace("Friendly", "");

                    const sportName =
                      sport.charAt(0).toUpperCase() + sport.slice(1);

                    const isLastItem = index === dataKeys.length - 1;

                    return (
                      <>
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
                          style={
                            {
                              "--color-bg": `var(--color-${name})`,
                            } as React.CSSProperties
                          }
                        />
                        {sportName} {matchType}
                        <div className="text-foreground ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums">
                          {value}

                          <span className="text-muted-foreground font-normal">
                            matches
                          </span>
                        </div>
                        {/* Add total after the last item */}
                        {isLastItem && (
                          <div className="text-foreground mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium">
                            Total
                            <div className="text-foreground ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums">
                              {dataKeys.reduce(
                                (sum, key) => sum + (item.payload[key] || 0),
                                0
                              )}

                              <span className="text-muted-foreground font-normal">
                                matches
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  }}
                  indicator={chartType === "line" ? "line" : "dot"}
                />
              }
            />

            {sportFilter === "all" && (
              <ChartLegend content={<ChartLegendContent />} />
            )}

            {chartType === "line"
              ? dataKeys.map((key, index) => (
                  <Line
                    key={key}
                    dataKey={key}
                    type="monotone"
                    stroke={`var(--color-${key})`}
                    strokeWidth={2}
                    dot={false}
                  />
                ))
              : dataKeys.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={`var(--color-${key})`}
                    radius={[2, 2, 0, 0]}
                    stackId="matches"
                  />
                ))}
          </ChartComponent>
        </ChartContainer>

        {sportFilter !== "all" && (
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
            <div className="flex flex-col space-y-2 p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      chartConfig[
                        `${sportFilter}League` as keyof typeof chartConfig
                      ]?.color || "#374F35",
                  }}
                />

                <span className="font-medium">League Matches</span>
              </div>

              <div className="text-xl font-bold">
                {aggregatedData.reduce(
                  (sum, item) =>
                    sum +
                    (item[
                      `${sportFilter}League` as keyof typeof item
                    ] as number),
                  0
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                Official league matches
              </div>
            </div>

            <div className="flex flex-col space-y-2 p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      chartConfig[
                        `${sportFilter}Friendly` as keyof typeof chartConfig
                      ]?.color || "#512546",
                  }}
                />

                <span className="font-medium">Friendly Matches</span>
              </div>

              <div className="text-xl font-bold">
                {aggregatedData.reduce(
                  (sum, item) =>
                    sum +
                    (item[
                      `${sportFilter}Friendly` as keyof typeof item
                    ] as number),
                  0
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                Casual friendly matches
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
