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
import { useMembershipReport } from "@/hooks/queries";
import { formatValue } from "@/lib/utils/format";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Calendar,
  ArrowLeft,
  Users,
  UserCheck,
  UserX,
  RefreshCw,
  Clock,
  Timer,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/reports/membership")({
  component: MembershipReport,
});

const chartConfig = {
  new: { label: "New", color: "hsl(var(--chart-1))" },
  renewed: { label: "Renewed", color: "hsl(var(--chart-2))" },
  expired: { label: "Expired", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

function MembershipReport() {
  const { data, isLoading, isError } = useMembershipReport();

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <PageHeader
            icon={Calendar}
            title="Membership Report"
            description="Analyze membership tiers, renewals, and subscription patterns."
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
                  Failed to load membership data
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
                              Total Members
                            </p>
                            <p className="text-2xl font-bold">
                              {formatValue(data.totalMembers)}
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
                              Active Members
                            </p>
                            <p className="text-2xl font-bold">
                              {formatValue(data.activeMembers)}
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
                              Expired Members
                            </p>
                            <p className="text-2xl font-bold">
                              {formatValue(data.expiredMembers)}
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
                              Renewal Rate
                            </p>
                            <p className="text-2xl font-bold">
                              {formatValue(data.renewalRate, "percentage")}
                            </p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <RefreshCw className="size-5 text-primary" />
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
                              Upcoming Renewals
                            </p>
                            <p className="text-2xl font-bold">
                              {formatValue(data.upcomingRenewals)}
                            </p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <Clock className="size-5 text-primary" />
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
                              Avg Duration
                            </p>
                            <p className="text-2xl font-bold">
                              {formatValue(data.averageMembershipDuration)} days
                            </p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <Timer className="size-5 text-primary" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                </StaggerContainer>

                {data.membershipsByMonth.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Memberships by Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={chartConfig}
                        className="h-[300px] w-full"
                      >
                        <BarChart
                          accessibilityLayer
                          data={data.membershipsByMonth}
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
                          <Bar
                            dataKey="new"
                            fill="var(--color-new)"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="renewed"
                            fill="var(--color-renewed)"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="expired"
                            fill="var(--color-expired)"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                )}

                {data.membershipsByTier.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Memberships by Tier</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                Tier
                              </th>
                              <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                Members
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.membershipsByTier.map((t) => (
                              <tr
                                key={t.tier}
                                className="border-b last:border-0"
                              >
                                <td className="py-3 px-4 font-medium">
                                  {t.tier}
                                </td>
                                <td className="text-right py-3 px-4 tabular-nums">
                                  {formatValue(t.count)}
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

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </>
  );
}
