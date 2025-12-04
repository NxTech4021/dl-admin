import { z } from "zod";

/**
 * Dashboard KPI Stats Schema
 */
export const dashboardKPISchema = z.object({
  totalUsers: z.number(),
  leagueParticipants: z.number(),
  conversionRate: z.number(),
  totalRevenue: z.number(),
  previousTotalUsers: z.number(),
  previousLeagueParticipants: z.number(),
  previousRevenue: z.number(),
});

export type DashboardKPI = z.infer<typeof dashboardKPISchema>;

/**
 * Sport Metrics Schema
 */
export const sportMetricsSchema = z.object({
  sport: z.string(),
  sportType: z.enum(["TENNIS", "PICKLEBALL", "PADEL"]),
  users: z.number(),
  payingMembers: z.number(),
  revenue: z.number(),
  matches: z.number(),
});

export type SportMetrics = z.infer<typeof sportMetricsSchema>;

/**
 * Match Activity Data Schema (for charts)
 */
export const matchActivitySchema = z.object({
  week: z.string(),
  date: z.string(),
  tennisLeague: z.number(),
  tennisFriendly: z.number(),
  pickleballLeague: z.number(),
  pickleballFriendly: z.number(),
  padelLeague: z.number(),
  padelFriendly: z.number(),
});

export type MatchActivity = z.infer<typeof matchActivitySchema>;

/**
 * User Growth Data Schema (for charts)
 */
export const userGrowthSchema = z.object({
  month: z.string(),
  totalUsers: z.number(),
  payingMembers: z.number(),
});

export type UserGrowth = z.infer<typeof userGrowthSchema>;

/**
 * Sport Comparison Data Schema (for charts)
 */
export const sportComparisonSchema = z.object({
  sport: z.string(),
  payingMembers: z.number(),
  revenue: z.number(),
  fill: z.string(),
});

export type SportComparison = z.infer<typeof sportComparisonSchema>;

/**
 * Combined Dashboard Stats Schema
 */
export const dashboardStatsSchema = z.object({
  kpi: dashboardKPISchema,
  sportMetrics: z.array(sportMetricsSchema),
  matchActivity: z.array(matchActivitySchema),
  userGrowth: z.array(userGrowthSchema),
  sportComparison: z.array(sportComparisonSchema),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
