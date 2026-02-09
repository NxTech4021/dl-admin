"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconTrophy,
  IconClock,
  IconAlertTriangle,
  IconBan,
  IconUsers,
  IconRefresh,
  IconHeartHandshake,
} from "@tabler/icons-react";
import { useMatchStats } from "@/hooks/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  statsGridContainer,
  statsCardVariants,
  defaultTransition,
} from "@/lib/animation-variants";

interface MatchStatsCardsProps {
  leagueId?: string;
  seasonId?: string;
  divisionId?: string;
  leagueMatchCount?: number;
  friendlyMatchCount?: number;
}

export function MatchStatsCards({
  leagueId,
  seasonId,
  divisionId,
  leagueMatchCount,
  friendlyMatchCount,
}: MatchStatsCardsProps) {
  const { data: stats, isLoading, error, refetch } = useMatchStats({
    leagueId,
    seasonId,
    divisionId,
  });

  // Track if we've ever had data - used to skip skeleton and animation on subsequent fetches
  const hasHadData = useRef(false);
  if (stats) {
    hasHadData.current = true;
  }

  // Only show skeleton on the very first load (no previous data)
  if (isLoading && !hasHadData.current) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state with retry option
  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="lg:col-span-5">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <IconAlertTriangle className="size-8 text-destructive mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Failed to load match statistics
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <IconRefresh className="size-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: "Total Matches",
      value: stats.totalMatches,
      description: "All matches",
      icon: IconTrophy,
      iconColor: "text-blue-500",
      breakdown: leagueMatchCount !== undefined && friendlyMatchCount !== undefined
        ? { league: leagueMatchCount, friendly: friendlyMatchCount }
        : undefined,
    },
    {
      title: "Scheduled",
      value: stats.byStatus.SCHEDULED,
      description: "Upcoming matches",
      icon: IconClock,
      iconColor: "text-green-500",
    },
    {
      title: "Pending Confirmation",
      value: stats.pendingConfirmation,
      description: "Awaiting approval",
      icon: IconUsers,
      iconColor: "text-yellow-500",
    },
    {
      title: "Disputed",
      value: stats.disputed,
      description: "Under review",
      icon: IconAlertTriangle,
      iconColor: "text-red-500",
    },
    {
      title: "Requires Review",
      value: stats.requiresAdminReview,
      description: "Admin action needed",
      icon: IconBan,
      iconColor: "text-orange-500",
    },
  ];

  return (
    <motion.div
      initial={hasHadData.current ? false : "hidden"}
      animate="visible"
      variants={statsGridContainer}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            variants={hasHadData.current ? undefined : statsCardVariants}
            transition={defaultTransition}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className={`size-4 ${card.iconColor}`} />
              </CardHeader>
              <CardContent>
                {card.breakdown ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">{card.value}</div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <IconTrophy className="size-3.5" />
                          <span className="font-medium tabular-nums">{card.breakdown.league}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-pink-600 dark:text-pink-400">
                          <IconHeartHandshake className="size-3.5" />
                          <span className="font-medium tabular-nums">{card.breakdown.friendly}</span>
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {card.description}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {card.description}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
