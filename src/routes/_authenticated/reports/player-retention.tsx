import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-container";
import { usePlayerRetentionReport } from "@/hooks/queries";
import { formatValue } from "@/lib/utils/format";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  ArrowLeft,
  Users,
  UserCheck,
  UserX,
  Activity,
  UserMinus,
  RefreshCw,
} from "lucide-react";

export const Route = createFileRoute(
  "/_authenticated/reports/player-retention",
)({
  component: PlayerRetentionReport,
});

const retentionConfig = {
  retained: { label: "Retained", color: "hsl(var(--chart-1))" },
  churned: { label: "Churned", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

const tierConfig = {
  count: { label: "Players", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

function PlayerRetentionReport() {
  const { data, isLoading, isError } = usePlayerRetentionReport();

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <PageHeader
            icon={TrendingUp}
            title="Player Retention"
            description="Analyze player retention rates, churn patterns, and engagement metrics."
            actions={
              <Link to="/reports">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="size-4 mr-2" /> Back to Reports
                </Button>
              </Link>
            }
          />

          <div className="flex-1 px-4 lg:px-6 pb-6 space-y-6">
            {isLoading && <LoadingSkeleton />}

            {isError && (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">
                  Failed to load retention data
                </p>
              </div>
            )}

            {data && (
              <>
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StaggerItem>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total Players
                            </p>
                            <p className="text-2xl font-bold">
                              {formatValue(data.totalPlayers)}
                            </p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <Users className="size-5 text-primary" />
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
                              Active Players
                            </p>
                            <p className="text-2xl font-bold">
                              {formatValue(data.activePlayers)}
                            </p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <UserCheck className="size-5 text-primary" />
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
                              Inactive Players
                            </p>
                            <p className="text-2xl font-bold">
                              {formatValue(data.inactivePlayers)}
                            </p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <UserMinus className="size-5 text-primary" />
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
                              Churned
                            </p>
                            <p className="text-2xl font-bold">
                              {formatValue(data.churned)}
                            </p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <UserX className="size-5 text-primary" />
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
                              Retention Rate
                            </p>
                            <p className="text-2xl font-bold">
                              {formatValue(data.retentionRate, "percentage")}
                            </p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <Activity className="size-5 text-primary" />
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
                              Reactivated
                            </p>
                            <p className="text-2xl font-bold">
                              {formatValue(data.reactivatedPlayers)}
                            </p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <RefreshCw className="size-5 text-primary" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                </StaggerContainer>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {data.retentionByMonth.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Retention by Month</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={retentionConfig}
                          className="h-[300px] w-full"
                        >
                          <LineChart
                            accessibilityLayer
                            data={data.retentionByMonth}
                            margin={{
                              left: 10,
                              right: 10,
                              top: 10,
                              bottom: 25,
                            }}
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
                              tick={{ fontSize: 11 }}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tick={{ fontSize: 11 }}
                              width={40}
                            />
                            <ChartTooltip
                              content={<ChartTooltipContent />}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Line
                              dataKey="retained"
                              type="monotone"
                              stroke="var(--color-retained)"
                              strokeWidth={2}
                              dot={false}
                            />
                            <Line
                              dataKey="churned"
                              type="monotone"
                              stroke="var(--color-churned)"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  )}

                  {data.engagementTiers.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Engagement Tiers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={tierConfig}
                          className="h-[300px] w-full"
                        >
                          <BarChart
                            accessibilityLayer
                            data={data.engagementTiers}
                            margin={{
                              left: 10,
                              right: 10,
                              top: 10,
                              bottom: 25,
                            }}
                          >
                            <CartesianGrid
                              vertical={false}
                              strokeDasharray="3 3"
                              stroke="var(--border)"
                              strokeOpacity={0.5}
                            />
                            <XAxis
                              dataKey="tier"
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
                            <ChartTooltip
                              content={<ChartTooltipContent />}
                            />
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
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-16" />
                </div>
                <Skeleton className="h-11 w-11 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
