import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-container";
import { useSeasonPerformanceReport } from "@/hooks/queries";
import { formatValue } from "@/lib/utils/format";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Trophy,
  ArrowLeft,
  Swords,
  CheckCircle,
  Percent,
  Users,
} from "lucide-react";

export const Route = createFileRoute(
  "/_authenticated/reports/season-performance",
)({
  component: SeasonPerformanceReport,
});

const matchDistConfig = {
  count: { label: "Matches", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

function LoadingSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="size-11 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function SeasonPerformanceReport() {
  const { data: seasons, isLoading, isError } = useSeasonPerformanceReport();
  const [selectedSeasonId, setSelectedSeasonId] = React.useState<string>("");

  const selectedSeason = React.useMemo(() => {
    if (!seasons?.length) return null;
    if (!selectedSeasonId) return seasons[0];
    return seasons.find((s) => s.seasonId === selectedSeasonId) ?? seasons[0];
  }, [seasons, selectedSeasonId]);

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <PageHeader
            icon={Trophy}
            title="Season Performance"
            description="Season-by-season analysis of league performance and standings."
            actions={
              <Link to="/reports">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="size-4 mr-2" /> Back to Reports
                </Button>
              </Link>
            }
          />

          <div className="flex-1 px-4 lg:px-6 pb-6 space-y-6">
            {/* Loading State */}
            {isLoading && <LoadingSkeleton />}

            {/* Error State */}
            {isError && (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">
                  Failed to load season performance data
                </p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && seasons && seasons.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">
                  No season data available
                </p>
              </div>
            )}

            {/* Data Loaded */}
            {!isLoading && !isError && selectedSeason && (
              <>
                {/* Season Selector */}
                {seasons && seasons.length > 1 && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      Season:
                    </span>
                    <Select
                      value={selectedSeason?.seasonId ?? ""}
                      onValueChange={setSelectedSeasonId}
                    >
                      <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent>
                        {seasons.map((s) => (
                          <SelectItem key={s.seasonId} value={s.seasonId}>
                            {s.seasonName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Stat Cards */}
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StaggerItem>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total Matches
                            </p>
                            <p className="text-2xl font-bold">
                              {formatValue(selectedSeason.totalMatches)}
                            </p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <Swords className="size-5 text-primary" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                  <StaggerItem>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Completed
                            </p>
                            <p className="text-2xl font-bold">
                              {formatValue(selectedSeason.completedMatches)}
                            </p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <CheckCircle className="size-5 text-primary" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                  <StaggerItem>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Completion Rate
                            </p>
                            <p className="text-2xl font-bold">
                              {formatValue(
                                selectedSeason.completionRate,
                                "percentage",
                              )}
                            </p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <Percent className="size-5 text-primary" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                  <StaggerItem>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total Players
                            </p>
                            <p className="text-2xl font-bold">
                              {formatValue(selectedSeason.totalPlayers)}
                            </p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <Users className="size-5 text-primary" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                </StaggerContainer>

                {/* Active Participants */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Active Participants
                        </p>
                        <p className="text-2xl font-bold">
                          {formatValue(selectedSeason.activeParticipants)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Players who completed at least one match
                        </p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Users className="size-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Match Distribution Chart */}
                {selectedSeason.matchDistribution.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Match Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={matchDistConfig}
                        className="h-[300px] w-full"
                      >
                        <BarChart
                          accessibilityLayer
                          data={selectedSeason.matchDistribution}
                          margin={{ left: 10, right: 10, top: 10, bottom: 25 }}
                        >
                          <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            stroke="var(--border)"
                            strokeOpacity={0.5}
                          />
                          <XAxis
                            dataKey="week"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fontSize: 11 }}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fontSize: 11 }}
                            width={40}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar
                            dataKey="count"
                            fill="var(--color-count)"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Divisions Table */}
                {selectedSeason.divisions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Divisions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                Division
                              </th>
                              <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                Players
                              </th>
                              <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                Matches
                              </th>
                              <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                Completion Rate
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedSeason.divisions.map((div) => (
                              <tr
                                key={div.id}
                                className="border-b last:border-0"
                              >
                                <td className="py-3 px-4 font-medium">
                                  {div.name}
                                </td>
                                <td className="text-right py-3 px-4 tabular-nums">
                                  {formatValue(div.players)}
                                </td>
                                <td className="text-right py-3 px-4 tabular-nums">
                                  {formatValue(div.matches)}
                                </td>
                                <td className="text-right py-3 px-4 tabular-nums">
                                  {formatValue(div.completionRate, "percentage")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Top Players Table */}
                {selectedSeason.topPlayers.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Players</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                Player
                              </th>
                              <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                Wins
                              </th>
                              <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                Matches
                              </th>
                              <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                Win Rate
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedSeason.topPlayers.map((player) => (
                              <tr
                                key={player.id}
                                className="border-b last:border-0"
                              >
                                <td className="py-3 px-4 font-medium">
                                  {player.name}
                                </td>
                                <td className="text-right py-3 px-4 tabular-nums">
                                  {formatValue(player.wins)}
                                </td>
                                <td className="text-right py-3 px-4 tabular-nums">
                                  {formatValue(player.matches)}
                                </td>
                                <td className="text-right py-3 px-4 tabular-nums">
                                  {formatValue(player.winRate, "percentage")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
