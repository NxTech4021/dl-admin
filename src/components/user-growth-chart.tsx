"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck } from "lucide-react"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Static mock data for the last 12 months - realistic fluctuations for 100+ member app
const chartData = [
  { month: "2024-01", totalUsers: 145, payingMembers: 68 },
  { month: "2024-02", totalUsers: 167, payingMembers: 72 },
  { month: "2024-03", totalUsers: 189, payingMembers: 85 },
  { month: "2024-04", totalUsers: 203, payingMembers: 91 },
  { month: "2024-05", totalUsers: 196, payingMembers: 87 },
  { month: "2024-07", totalUsers: 234, payingMembers: 108 },
  { month: "2024-08", totalUsers: 229, payingMembers: 104 }, 
  { month: "2024-09", totalUsers: 251, payingMembers: 118 },
  { month: "2024-10", totalUsers: 267, payingMembers: 125 },
  { month: "2024-11", totalUsers: 259, payingMembers: 121 },
  { month: "2024-12", totalUsers: 284, payingMembers: 132 },
]

const chartConfig = {
  users: {
    label: "User Growth",
  },
  totalUsers: {
    label: "Total Users",
    color: "#374F35",
  },
  payingMembers: {
    label: "Paying Members",
    color: "#512546",
  },
} satisfies ChartConfig

export function UserGrowthChart() {
  const [activeChart, setActiveChart] = 
    React.useState<keyof typeof chartConfig>("totalUsers")
  const [timeRange, setTimeRange] = React.useState("12m")

  const formatMonth = (value: string) => {
    const date = new Date(value + "-01")
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const filteredData = React.useMemo(() => {
    let monthsToShow = 12
    
    if (timeRange === "6m") monthsToShow = 6
    if (timeRange === "3m") monthsToShow = 3
    
    return chartData.slice(-monthsToShow)
  }, [timeRange])

  const total = React.useMemo(
    () => ({
      totalUsers: filteredData[filteredData.length - 1].totalUsers,
      payingMembers: filteredData[filteredData.length - 1].payingMembers,
    }),
    [filteredData]
  )

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-2 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>User Growth Over Time</CardTitle>
          <CardDescription>
            Showing growth trends over selected time period
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a time range"
          >
            <SelectValue placeholder="Last 12 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="12m" className="rounded-lg">
              Last 12 months
            </SelectItem>
            <SelectItem value="6m" className="rounded-lg">
              Last 6 months
            </SelectItem>
            <SelectItem value="3m" className="rounded-lg">
              Last 3 months
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-4 py-6 sm:px-8 sm:py-8">
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <div className="text-2xl font-bold">{total.totalUsers.toLocaleString()}</div>
          </div>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Paying Members</span>
            </div>
            <div className="text-2xl font-bold">{total.payingMembers.toLocaleString()}</div>
          </div>
        </div>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[450px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={filteredData}
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
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[180px]"
                  labelFormatter={(value) => {
                    return new Date(value + "-01").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  formatter={(value, name) => {
                    const config = chartConfig[name as keyof typeof chartConfig]
                    const color = 'color' in config ? config.color : '#374F35'
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
                      <span className="text-xs text-muted-foreground" key={`${name}-label`}>
                        {config?.label || name}
                      </span>
                    ]
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
  )
}
