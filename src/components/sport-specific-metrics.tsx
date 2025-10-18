"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Target } from "lucide-react"

// Static mock data for sport-specific metrics (realistic for 100+ member app)
const sportMetricsData = [
  {
    sport: "Tennis",
    icon: "🎾",
    users: 127,
    payingMembers: 68,
    revenue: 1700,
    fill: "#374F35",
  },
  {
    sport: "Pickleball", 
    icon: "🏓",
    users: 98,
    payingMembers: 42,
    revenue: 1260,
    fill: "#512546",
  },
  {
    sport: "Padel",
    icon: "🎾",
    users: 59,
    payingMembers: 22,
    revenue: 1000,
    fill: "#7D3C03",
  },
]

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

export function SportSpecificMetrics() {
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
        {sportMetricsData.map((sport) => (
          <Card key={sport.sport} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">{sport.icon}</span>
                <span 
                  className="font-semibold"
                  style={{ color: sport.fill }}
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
