"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Season } from "@/constants/zod/season-schema";
import {
  IconUsers,
  IconTrophy,
  IconCalendar,
  IconTrendingUp,
} from "@tabler/icons-react";
import { statsGridContainer, statsCardVariants, fastTransition } from "@/lib/animation-variants";

interface SeasonOverviewStatsProps {
  season: Season;
}

export default function SeasonOverviewStats({
  season,
}: SeasonOverviewStatsProps) {
  // Calculate player statistics with null safety
  const memberships = season.memberships || [];
  const activePlayers = memberships.filter(
    (m) => m.status === "ACTIVE"
  ).length;
  const waitlistedPlayers = memberships.filter(
    (m) => m.status === "WAITLISTED"
  ).length;
  const pendingPlayers = memberships.filter(
    (m) => m.status === "PENDING"
  ).length;
  // Use the larger of registeredUserCount or actual memberships count
  // This handles cases where registeredUserCount isn't synced with actual data
  const totalRegisteredUsers = Math.max(season.registeredUserCount || 0, memberships.length);

  // Calculate division statistics with null safety
  const divisions = season.divisions || [];
  const totalDivisions = divisions.length;

  // Calculate withdrawal requests with null safety
  const withdrawalRequests = season.withdrawalRequests || [];
  const pendingWithdrawals = withdrawalRequests.filter(
    (r) => r.status === "PENDING"
  ).length;

  // Calculate revenue with proper type handling
  const calculateRevenue = () => {
    const entryFee = typeof season.entryFee === 'number' ? season.entryFee : 0;
    if (!entryFee || season.registeredUserCount === 0) return "RM 0.00";
    const totalRevenue = entryFee * season.registeredUserCount;
    return `RM ${totalRevenue.toFixed(2)}`;
  };

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
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegisteredUsers}</div>
            <p className="text-xs text-muted-foreground">
              {activePlayers} active, {waitlistedPlayers} waitlisted
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
              {totalDivisions === 0 ? "No divisions created" : "Active divisions"}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revenue Card */}
      <motion.div variants={statsCardVariants} transition={fastTransition}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateRevenue()}</div>
            <p className="text-xs text-muted-foreground">
              {season.registeredUserCount > 0
                ? `${season.registeredUserCount} players × RM ${
                    typeof season.entryFee === 'number' ? season.entryFee : 0
                  }`
                : "No revenue yet"}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Withdrawal Requests Card */}
      <motion.div variants={statsCardVariants} transition={fastTransition}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Withdrawals</CardTitle>
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingWithdrawals}</div>
            <p className="text-xs text-muted-foreground">
              {pendingWithdrawals === 0
                ? "No pending requests"
                : "Pending requests"}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
