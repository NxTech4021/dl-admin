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
import { useDisputeAnalysisReport } from "@/hooks/queries";
import { formatValue } from "@/lib/utils/format";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  AlertTriangle,
  ArrowLeft,
  FileWarning,
  CheckCircle,
  Clock,
  Scale,
} from "lucide-react";

export const Route = createFileRoute(
  "/_authenticated/reports/dispute-analysis"
)({
  component: DisputeAnalysisReport,
});

const monthlyConfig = {
  count: { label: "Filed", color: "hsl(var(--chart-4))" },
  resolved: { label: "Resolved", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const categoryConfig = {
  count: { label: "Disputes", color: "hsl(var(--chart-3))" },
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
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="size-11 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    </>
  );
}

function DisputeAnalysisReport() {
  const { data, isLoading, isError } = useDisputeAnalysisReport();

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <PageHeader
            icon={AlertTriangle}
            title="Dispute Analysis"
            description="Track dispute resolution rates, categories, and trends."
            actions={
              <Link to="/reports">
                <Button variant="outline" size="sm">
                  <ArrowLeft /> Back to Reports
                </Button>
              </Link>
            }
          />
          <div className="flex-1 px-4 lg:px-6 pb-6 space-y-6">
            {isLoading && <LoadingSkeleton />}

            {isError && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">
                  Failed to load dispute data
                </p>
              </div>
            )}

            {data && (
              <>
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StaggerItem>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total Disputes
                            </p>
                            <p className="text-2xl font-bold">
                              {formatValue(data.totalDisputes)}
                            </p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <FileWarning className="size-5 text-primary" />
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
                              Open
                            </p>
                            <p className="text-2xl font-bold">
                              {formatValue(data.openDisputes)}
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
                              Resolved
                            </p>
                            <p className="text-2xl font-bold">
                              {formatValue(data.resolvedDisputes)}
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
                              Avg Resolution
                            </p>
                            <p className="text-2xl font-bold">
                              {formatValue(data.averageResolutionTime)}h
                            </p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <Scale className="size-5 text-primary" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                </StaggerContainer>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {data.disputesByMonth.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Disputes by Month</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={monthlyConfig}
                          className="h-[300px] w-full"
                        >
                          <BarChart
                            accessibilityLayer
                            data={data.disputesByMonth}
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
                            <ChartLegend
                              content={<ChartLegendContent />}
                            />
                            <Bar
                              dataKey="count"
                              fill="var(--color-count)"
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar
                              dataKey="resolved"
                              fill="var(--color-resolved)"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  )}

                  {data.disputesByCategory.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>By Category</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={categoryConfig}
                          className="h-[300px] w-full"
                        >
                          <BarChart
                            accessibilityLayer
                            data={data.disputesByCategory}
                            layout="vertical"
                            margin={{
                              left: 20,
                              right: 20,
                              top: 10,
                              bottom: 10,
                            }}
                          >
                            <CartesianGrid
                              horizontal={false}
                              strokeDasharray="3 3"
                              stroke="var(--border)"
                              strokeOpacity={0.5}
                            />
                            <XAxis
                              type="number"
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 11 }}
                            />
                            <YAxis
                              dataKey="category"
                              type="category"
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 11 }}
                              width={130}
                            />
                            <ChartTooltip
                              content={<ChartTooltipContent />}
                            />
                            <Bar
                              dataKey="count"
                              fill="var(--color-count)"
                              radius={[0, 4, 4, 0]}
                            />
                          </BarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {data.resolutionOutcomes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Resolution Outcomes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                Outcome
                              </th>
                              <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                Count
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.resolutionOutcomes.map((r) => (
                              <tr
                                key={r.outcome}
                                className="border-b last:border-0"
                              >
                                <td className="py-3 px-4 font-medium">
                                  {r.outcome}
                                </td>
                                <td className="text-right py-3 px-4 tabular-nums">
                                  {formatValue(r.count)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {data.repeatOffenders.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Repeat Offenders</CardTitle>
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
                                Disputes
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.repeatOffenders.map((o) => (
                              <tr
                                key={o.userId}
                                className="border-b last:border-0"
                              >
                                <td className="py-3 px-4 font-medium">
                                  {o.name}
                                </td>
                                <td className="text-right py-3 px-4 tabular-nums">
                                  {formatValue(o.disputeCount)}
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
