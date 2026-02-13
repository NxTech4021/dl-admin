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
import { usePlayerRegistrationReport } from "@/hooks/queries";
import { formatValue } from "@/lib/utils/format";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  UserCheck,
  ArrowLeft,
  Users,
  UserPlus,
  Calendar,
  TrendingDown,
} from "lucide-react";

export const Route = createFileRoute(
  "/_authenticated/reports/player-registration",
)({
  component: PlayerRegistrationReport,
});

const registrationChartConfig = {
  count: { label: "Registrations", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const funnelChartConfig = {
  value: { label: "Players", color: "hsl(var(--chart-2))" },
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
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function PlayerRegistrationReport() {
  const { data, isLoading, isError } = usePlayerRegistrationReport();

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <PageHeader
            icon={UserCheck}
            title="Player Registration"
            description="Monitor new player signups, onboarding completion, and dropout rates."
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
                  Failed to load registration data
                </p>
              </div>
            )}
            {data && <DataContent data={data} />}
          </div>
        </div>
      </div>
    </>
  );
}

function DataContent({
  data,
}: {
  data: NonNullable<
    ReturnType<typeof usePlayerRegistrationReport>["data"]
  >;
}) {
  const onboardingData = [
    { step: "Registered", value: data.onboardingCompletion.total },
    { step: "Profile Complete", value: data.onboardingCompletion.withProfile },
    { step: "First Match", value: data.onboardingCompletion.withMatches },
    {
      step: "Fully Onboarded",
      value: data.onboardingCompletion.fullyOnboarded,
    },
  ];

  return (
    <>
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Registrations
                  </p>
                  <p className="text-2xl font-bold">
                    {formatValue(data.totalRegistrations)}
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
                    New This Month
                  </p>
                  <p className="text-2xl font-bold">
                    {formatValue(data.newThisMonth)}
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <UserPlus className="size-5 text-primary" />
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
                    New This Week
                  </p>
                  <p className="text-2xl font-bold">
                    {formatValue(data.newThisWeek)}
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Calendar className="size-5 text-primary" />
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
                  <p className="text-sm text-muted-foreground">Dropout Rate</p>
                  <p className="text-2xl font-bold">
                    {formatValue(data.dropoutRate, "percentage")}
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <TrendingDown className="size-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.registrationsByMonth.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Registrations by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={registrationChartConfig}
                className="h-[300px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={data.registrationsByMonth}
                  margin={{ left: 10, right: 10, top: 10, bottom: 25 }}
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

        <Card>
          <CardHeader>
            <CardTitle>Onboarding Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={funnelChartConfig}
              className="h-[250px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={onboardingData}
                layout="vertical"
                margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
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
                  dataKey="step"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  width={120}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="value"
                  fill="var(--color-value)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
