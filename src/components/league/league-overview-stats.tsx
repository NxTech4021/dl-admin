"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconUsers,
  IconCalendar,
  IconTrophy,
  IconBuilding,
} from "@tabler/icons-react";
import { statsGridContainer, statsCardVariants, fastTransition } from "@/lib/animation-variants";

interface LeagueOverviewStatsProps {
  uniqueMemberCount: number;
  seasonsCount: number;
  totalDivisions: number;
  sponsorCount: number;
  activeSeasonCount: number;
}

export function LeagueOverviewStats({
  uniqueMemberCount,
  seasonsCount,
  totalDivisions,
  sponsorCount,
  activeSeasonCount,
}: LeagueOverviewStatsProps) {
  return (
    <motion.div
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      initial="hidden"
      animate="visible"
      variants={statsGridContainer}
    >
      {/* Total Players Card */}
      <motion.div variants={statsCardVariants} transition={fastTransition}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Players</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueMemberCount}</div>
            <p className="text-xs text-muted-foreground">Across all seasons</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Seasons Card */}
      <motion.div variants={statsCardVariants} transition={fastTransition}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seasons</CardTitle>
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seasonsCount}</div>
            <p className="text-xs text-muted-foreground">
              {activeSeasonCount} active
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Divisions Card */}
      <motion.div variants={statsCardVariants} transition={fastTransition}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Divisions</CardTitle>
            <IconTrophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDivisions}</div>
            <p className="text-xs text-muted-foreground">
              Total across all seasons
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sponsors Card */}
      <motion.div variants={statsCardVariants} transition={fastTransition}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sponsors</CardTitle>
            <IconBuilding className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sponsorCount}</div>
            <p className="text-xs text-muted-foreground">
              {sponsorCount > 0 ? "Linked sponsors" : "No sponsors yet"}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default LeagueOverviewStats;
