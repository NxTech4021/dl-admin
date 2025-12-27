"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconTrophy,
  IconClock,
  IconAlertTriangle,
  IconBan,
  IconUsers,
  IconRefresh,
} from "@tabler/icons-react";
import { useMatchStats } from "@/hooks/use-queries";
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
}

export function MatchStatsCards({
  leagueId,
  seasonId,
  divisionId,
}: MatchStatsCardsProps) {
  const { data: stats, isLoading, error, refetch } = useMatchStats({
    leagueId,
    seasonId,
    divisionId,
  });

  if (isLoading) {
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
      initial="hidden"
      animate="visible"
      variants={statsGridContainer}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            variants={statsCardVariants}
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
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
