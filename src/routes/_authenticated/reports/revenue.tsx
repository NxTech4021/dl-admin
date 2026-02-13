import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-container";
import { useRevenueReport } from "@/hooks/queries";
import { formatCurrency, formatValue } from "@/lib/utils/format";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  DollarSign,
  ArrowLeft,
  TrendingUp,
  Wallet,
  CreditCard,
  RefreshCw,
  CalendarClock,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/reports/revenue")({
  component: RevenueReport,
});

const chartConfig = {
  amount: { label: "Revenue", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

function RevenueReport() {
  const { data, isLoading, isError } = useRevenueReport();

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <PageHeader
            icon={DollarSign}
            title="Revenue Report"
            description="Track registration fees, sponsorship revenue, and financial performance."
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
                  Failed to load revenue data
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
                              Total Revenue
                            </p>
                            <p className="text-2xl font-bold">
                              {formatCurrency(data.totalRevenue)}
                            </p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <Wallet className="size-5 text-primary" />
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
                              This Month
                            </p>
                            <p className="text-2xl font-bold">
                              {formatCurrency(data.revenueThisMonth)}
                            </p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <DollarSign className="size-5 text-primary" />
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
                              Last Month
                            </p>
                            <p className="text-2xl font-bold">
                              {formatCurrency(data.revenueLastMonth)}
                            </p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <CalendarClock className="size-5 text-primary" />
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
                              Growth Rate
                            </p>
                            <p className="text-2xl font-bold">
                              {formatValue(data.growthRate, "percentage")}
                            </p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <TrendingUp className="size-5 text-primary" />
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
                              Outstanding
                            </p>
                            <p className="text-2xl font-bold">
                              {formatCurrency(data.outstandingPayments)}
                            </p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <CreditCard className="size-5 text-primary" />
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
                              Refunds Issued
                            </p>
                            <p className="text-2xl font-bold">
                              {formatCurrency(data.refundsIssued)}
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

                {data.revenueByMonth.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue by Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={chartConfig}
                        className="h-[300px] w-full"
                      >
                        <BarChart
                          accessibilityLayer
                          data={data.revenueByMonth}
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
                            width={70}
                            tickFormatter={(value) => formatCurrency(value)}
                          />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                formatter={(value) =>
                                  formatCurrency(value as number)
                                }
                              />
                            }
                          />
                          <Bar
                            dataKey="amount"
                            fill="var(--color-amount)"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                )}

                {data.revenueBySource.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue by Source</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                Source
                              </th>
                              <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.revenueBySource.map((s) => (
                              <tr
                                key={s.source}
                                className="border-b last:border-0"
                              >
                                <td className="py-3 px-4 font-medium">
                                  {s.source}
                                </td>
                                <td className="text-right py-3 px-4 tabular-nums">
                                  {formatCurrency(s.amount)}
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
