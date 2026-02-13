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
} from "@/components/ui/chart";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";

import { Skeleton } from "@/components/ui/skeleton";
import { useMatchActivity } from "@/hooks/queries";
import { MatchActivity } from "@/constants/zod/dashboard-schema";
import { cn } from "@/lib/utils";

/** Type-safe accessor for numeric sport data fields */
const getNumericValue = (item: MatchActivity, key: string): number => {
  switch (key) {
    case "tennisLeague":
      return item.tennisLeague;
    case "tennisFriendly":
      return item.tennisFriendly;
    case "pickleballLeague":
      return item.pickleballLeague;
    case "pickleballFriendly":
      return item.pickleballFriendly;
    case "padelLeague":
      return item.padelLeague;
    case "padelFriendly":
      return item.padelFriendly;
    default:
      return 0;
  }
};

const chartConfig = {
  tennisLeague: {
    label: "Tennis League",
    color: "var(--chart-tennis-league)",
  },

  tennisFriendly: {
    label: "Tennis Friendly",
    color: "var(--chart-tennis-friendly)",
  },

  pickleballLeague: {
    label: "Pickleball League",
    color: "var(--chart-pickleball-league)",
  },

  pickleballFriendly: {
    label: "Pickleball Friendly",
    color: "var(--chart-pickleball-friendly)",
  },

  padelLeague: {
    label: "Padel League",
    color: "var(--chart-padel-league)",
  },

  padelFriendly: {
    label: "Padel Friendly",
    color: "var(--chart-padel-friendly)",
  },
} satisfies ChartConfig;

type SportFilter = "all" | "tennis" | "pickleball" | "padel";

type ChartType = "line" | "bar";

interface MatchActivityChartProps {
  chartRange?: "monthly" | "average";
  historyRange?: 1 | 3 | 6;
}

function ChartSkeleton() {
  return (
    <Card className="border border-border">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-2 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3 mb-4 sm:mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
        <Skeleton className="h-[280px] w-full" />
      </CardContent>
    </Card>
  );
}

export function MatchActivityChart({
  chartRange = "monthly",
  historyRange = 3,
}: MatchActivityChartProps) {
  const [sportFilter, setSportFilter] = React.useState<SportFilter>("all");
  const [chartType, setChartType] = React.useState<ChartType>("line");
  const [hiddenSeries, setHiddenSeries] = React.useState<Set<string>>(
    new Set()
  );

  // Convert history range to weeks (approximate)
  const weeks = historyRange * 4;

  // Fetch real data from API
  const { data: chartData, isLoading, error } = useMatchActivity(weeks);

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
    if (!chartData) return [];

    return chartData.map((item) => {
      const keys = getDataKeys(sportFilter).filter(
        (key) => !hiddenSeries.has(key)
      );

      const total = keys.reduce(
        (sum, key) => sum + getNumericValue(item, key),
        0
      );

      return { ...item, total };
    });
  }, [chartData, sportFilter, hiddenSeries]);

  const filteredConfig = getFilteredConfig(sportFilter);

  const dataKeys = getDataKeys(sportFilter);

  const totalMatches = aggregatedData.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const avgMatchesPerWeek = aggregatedData.length > 0
    ? Math.round(totalMatches / aggregatedData.length)
    : 0;

  const latestWeek = aggregatedData[aggregatedData.length - 1] || { total: 0 };

  const previousWeek = aggregatedData[aggregatedData.length - 2];

  const weeklyGrowth = previousWeek && previousWeek.total > 0
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

  const toggleSeries = (seriesKey: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(seriesKey)) {
        next.delete(seriesKey);
      } else {
        next.add(seriesKey);
      }
      return next;
    });
  };

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (error || !chartData || chartData.length === 0) {
    return (
      <Card className="border border-border">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-2 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Match Activity</CardTitle>
            <CardDescription>No data available</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="h-[280px] flex items-center justify-center text-muted-foreground">
            No match activity data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-2 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Match Activity</CardTitle>

          <CardDescription>
            Weekly matches (league + friendly) per sport -{" "}
            {chartRange === "average"
              ? "Weekly average"
              : "Monthly"}{" "}
            ({historyRange} month{historyRange > 1 ? "s" : ""})
          </CardDescription>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={sportFilter}
            onValueChange={(value) => setSportFilter(value as SportFilter)}
          >
            <SelectTrigger className="w-full sm:w-[120px] h-9 sm:h-10 rounded-lg touch-manipulation">
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

          <div className="inline-flex items-center rounded-md bg-muted/60 p-0.5 shrink-0 border border-border/50">
            <button
              onClick={() => setChartType("line")}
              className={cn(
                "inline-flex items-center justify-center rounded px-3 py-1.5 text-xs font-medium transition-all cursor-pointer h-9 sm:h-8 touch-manipulation",
                chartType === "line"
                  ? "bg-background text-foreground shadow-sm border border-border/50"
                  : "text-foreground/70 hover:text-foreground"
              )}
            >
              Line
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={cn(
                "inline-flex items-center justify-center rounded px-3 py-1.5 text-xs font-medium transition-all cursor-pointer h-9 sm:h-8 touch-manipulation",
                chartType === "bar"
                  ? "bg-background text-foreground shadow-sm border border-border/50"
                  : "text-foreground/70 hover:text-foreground"
              )}
            >
              Bar
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3 mb-4 sm:mb-6">
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
              Total matches ({aggregatedData.length} weeks)
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
          key={`${sportFilter}-${chartType}`}
          config={filteredConfig}
          className="aspect-auto h-[280px] sm:h-[320px] md:h-[350px] w-full"
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
              tickFormatter={(value) => {
                if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                return value.toString();
              }}
              tick={{ fontSize: 11 }}
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
              <ChartLegend
                content={({ payload }) => {
                  if (!payload?.length) return null;

                  return (
                    <div className="flex items-center justify-center gap-3 sm:gap-4 pt-3 flex-wrap">
                      {payload.map((item) => {
                        const key = String(item.dataKey || item.value);
                        const isHidden = hiddenSeries.has(key);
                        const itemConfig =
                          chartConfig[key as keyof typeof chartConfig];

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => toggleSeries(key)}
                            className={cn(
                              "flex items-center gap-1.5 cursor-pointer transition-opacity hover:opacity-100 min-h-[40px] touch-manipulation px-2 py-1.5",
                              isHidden && "opacity-30"
                            )}
                            aria-label={`${isHidden ? "Show" : "Hide"} ${itemConfig?.label}`}
                            aria-pressed={!isHidden}
                          >
                            <div
                              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                              style={{
                                backgroundColor: item.color,
                              }}
                            />
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              {itemConfig?.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                }}
              />
            )}

            {chartType === "line"
              ? dataKeys
                  .filter((key) => !hiddenSeries.has(key))
                  .map((key) => (
                    <Line
                      key={key}
                      dataKey={key}
                      type="monotone"
                      stroke={`var(--color-${key})`}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))
              : dataKeys
                  .filter((key) => !hiddenSeries.has(key))
                  .map((key) => (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
            <div className="flex flex-col space-y-2 p-3 sm:p-4 rounded-lg border border-border bg-muted/50">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      chartConfig[
                        `${sportFilter}League` as keyof typeof chartConfig
                      ]?.color || "var(--chart-sport-members)",
                  }}
                />

                <span className="text-sm font-medium">League Matches</span>
              </div>

              <div className="text-xl sm:text-2xl font-bold">
                {aggregatedData.reduce(
                  (sum, item) =>
                    sum + getNumericValue(item, `${sportFilter}League`),
                  0
                )}
              </div>

              <div className="text-xs text-muted-foreground leading-tight">
                Official league matches
              </div>
            </div>

            <div className="flex flex-col space-y-2 p-3 sm:p-4 rounded-lg border border-border bg-muted/50">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      chartConfig[
                        `${sportFilter}Friendly` as keyof typeof chartConfig
                      ]?.color || "var(--chart-sport-revenue)",
                  }}
                />

                <span className="text-sm font-medium">Friendly Matches</span>
              </div>

              <div className="text-xl sm:text-2xl font-bold">
                {aggregatedData.reduce(
                  (sum, item) =>
                    sum + getNumericValue(item, `${sportFilter}Friendly`),
                  0
                )}
              </div>

              <div className="text-xs text-muted-foreground leading-tight">
                Casual friendly matches
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
