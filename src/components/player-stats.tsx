"use client"

import * as React from "react"
import { IconUsers } from "@tabler/icons-react"
import { Skeleton } from "@/components/ui/skeleton"

interface PlayerStatsData {
  total: number
  active: number
  inactive: number
  verified: number
}

export function PlayerStats() {
  const [stats, setStats] = React.useState<PlayerStatsData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/player/stats")
        if (!response.ok) {
          throw new Error("Failed to fetch stats")
        }
        const result = await response.json()
        setStats(result.data)
      } catch (error) {
        console.error("Failed to fetch player stats:", error)
        setStats({ total: 0, active: 0, inactive: 0, verified: 0 })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return <StatsSkeleton />
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div className="flex items-center gap-3 rounded-lg border p-4">
        <div className="rounded-full bg-primary/10 p-2">
          <IconUsers className="size-4 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{stats?.total ?? 0}</p>
          <p className="text-sm text-muted-foreground">Total Players</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-lg border p-4">
        <div className="rounded-full bg-green-500/10 p-2">
          <div className="size-4 rounded-full bg-green-500"></div>
        </div>
        <div>
          <p className="text-2xl font-bold">{stats?.active ?? 0}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-lg border p-4">
        <div className="rounded-full bg-yellow-500/10 p-2">
          <div className="size-4 rounded-full bg-yellow-500"></div>
        </div>
        <div>
          <p className="text-2xl font-bold">{stats?.inactive ?? 0}</p>
          <p className="text-sm text-muted-foreground">Inactive</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-lg border p-4">
        <div className="rounded-full bg-blue-500/10 p-2">
          <div className="size-4 rounded-full bg-blue-500"></div>
        </div>
        <div>
          <p className="text-2xl font-bold">{stats?.verified ?? 0}</p>
          <p className="text-sm text-muted-foreground">Verified</p>
        </div>
      </div>
    </div>
  )
}

const StatsSkeleton = () => (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="flex items-center gap-3 rounded-lg border p-4">
        <Skeleton className="size-9 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-8" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    ))}
  </div>
)
