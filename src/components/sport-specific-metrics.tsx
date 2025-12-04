"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Target } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useSportMetrics } from "@/hooks/use-queries"

function formatValue(value: number, format: "number" | "currency" | "percentage" = "number"): string {
  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: "MYR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)
    case "percentage":
      return `${value.toFixed(1)}%`
    case "number":
    default:
      return new Intl.NumberFormat("en-US").format(value)
  }
}

// Sport icon mapping
const sportIcons: Record<string, string> = {
  Tennis: "🎾",
  Pickleball: "🏓",
  Padel: "🎾",
}

// Sport color mapping
const sportColors: Record<string, string> = {
  Tennis: "#374F35",
  Pickleball: "#512546",
  Padel: "#7D3C03",
}

function SportMetricsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-2.5 pt-0">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center justify-between p-2 rounded-md border">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function SportSpecificMetrics() {
  const { data: sportMetrics, isLoading, error } = useSportMetrics()

  if (isLoading) {
    return <SportMetricsSkeleton />
  }

  if (error || !sportMetrics || sportMetrics.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Sport-Specific Metrics</h3>
            <p className="text-sm text-muted-foreground">
              Performance breakdown by sport category
            </p>
          </div>
        </div>
        <Card className="p-6 text-center text-muted-foreground">
          No sport metrics available
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Sport-Specific Metrics</h3>
          <p className="text-sm text-muted-foreground">
            Performance breakdown by sport category
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sportMetrics.map((sport) => (
          <Card key={sport.sport} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">{sportIcons[sport.sport] || "🏃"}</span>
                <span
                  className="font-semibold"
                  style={{ color: sportColors[sport.sport] || "#666" }}
                >
                  {sport.sport}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2.5 pt-0">
              {/* Total Users */}
              <div className="flex items-center justify-between p-2 rounded-md border">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/20">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-medium">Total Users</p>
                </div>
                <p className="text-lg font-bold">{formatValue(sport.users)}</p>
              </div>

              {/* Paying Members */}
              <div className="flex items-center justify-between p-2 rounded-md border">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/20">
                    <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm font-medium">Paying Members</p>
                </div>
                <p className="text-lg font-bold">{formatValue(sport.payingMembers)}</p>
              </div>

              {/* Revenue */}
              <div className="flex items-center justify-between p-2 rounded-md border">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/20">
                    <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-sm font-medium">Revenue</p>
                </div>
                <p className="text-lg font-bold">{formatValue(sport.revenue, "currency")}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
