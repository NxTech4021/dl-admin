"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconCategory,
  IconCheck,
  IconX,
  IconUser,
  IconUsers,
  IconRefresh,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useDivisionsStats } from "@/hooks/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  statsGridContainer,
  statsCardVariants,
  defaultTransition,
} from "@/lib/animation-variants";

interface DivisionStatsCardsProps {
  seasonId?: string;
}

export function DivisionStatsCards({ seasonId }: DivisionStatsCardsProps) {
  const { data: stats, isLoading, error, refetch } = useDivisionsStats(seasonId);

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

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="lg:col-span-5">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <IconAlertTriangle className="size-8 text-destructive mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Failed to load division statistics
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
      title: "Total Divisions",
      value: stats.total,
      description: "All divisions",
      icon: IconCategory,
      iconColor: "text-blue-500",
    },
    {
      title: "Active",
      value: stats.active,
      description: "Currently running",
      icon: IconCheck,
      iconColor: "text-emerald-500",
    },
    {
      title: "Inactive",
      value: stats.inactive,
      description: "Paused or ended",
      icon: IconX,
      iconColor: "text-slate-500",
    },
    {
      title: "Singles",
      value: stats.byGameType?.singles || 0,
      description: "Singles divisions",
      icon: IconUser,
      iconColor: "text-violet-500",
    },
    {
      title: "Doubles",
      value: stats.byGameType?.doubles || 0,
      description: "Doubles divisions",
      icon: IconUsers,
      iconColor: "text-amber-500",
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
