import { z } from "zod";

// ========================================
// Player Registration
// ========================================
export const registrationByMonthSchema = z.object({
  month: z.string(),
  count: z.number(),
});

export const onboardingCompletionSchema = z.object({
  total: z.number(),
  withProfile: z.number(),
  withMatches: z.number(),
  fullyOnboarded: z.number(),
});

export const playerRegistrationSchema = z.object({
  totalRegistrations: z.number(),
  newThisMonth: z.number(),
  newThisWeek: z.number(),
  registrationsByMonth: z.array(registrationByMonthSchema),
  registrationsBySource: z.array(z.object({ source: z.string(), count: z.number() })),
  onboardingCompletion: onboardingCompletionSchema,
  dropoutRate: z.number(),
});

export type PlayerRegistrationStats = z.infer<typeof playerRegistrationSchema>;

// ========================================
// Player Retention
// ========================================
export const retentionByMonthSchema = z.object({
  month: z.string(),
  retained: z.number(),
  churned: z.number(),
  rate: z.number(),
});

export const engagementTierSchema = z.object({
  tier: z.string(),
  count: z.number(),
  percentage: z.number(),
});

export const playerRetentionSchema = z.object({
  totalPlayers: z.number(),
  activePlayers: z.number(),
  inactivePlayers: z.number(),
  churned: z.number(),
  retentionRate: z.number(),
  retentionByMonth: z.array(retentionByMonthSchema),
  engagementTiers: z.array(engagementTierSchema),
  averageLifespan: z.number(),
  reactivatedPlayers: z.number(),
});

export type PlayerRetentionStats = z.infer<typeof playerRetentionSchema>;

// ========================================
// Season Performance (response is array)
// ========================================
export const divisionPerformanceSchema = z.object({
  id: z.string(),
  name: z.string(),
  players: z.number(),
  matches: z.number(),
  completionRate: z.number(),
});

export const seasonPerformanceSchema = z.object({
  seasonId: z.string(),
  seasonName: z.string(),
  totalMatches: z.number(),
  completedMatches: z.number(),
  completionRate: z.number(),
  totalPlayers: z.number(),
  activeParticipants: z.number(),
  divisions: z.array(divisionPerformanceSchema),
  topPlayers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    wins: z.number(),
    matches: z.number(),
    winRate: z.number(),
  })),
  matchDistribution: z.array(z.object({ week: z.string(), count: z.number() })),
});

export type SeasonPerformanceStats = z.infer<typeof seasonPerformanceSchema>;

// ========================================
// Dispute Analysis
// ========================================
export const disputeAnalysisSchema = z.object({
  totalDisputes: z.number(),
  openDisputes: z.number(),
  resolvedDisputes: z.number(),
  averageResolutionTime: z.number(),
  disputesByCategory: z.array(z.object({ category: z.string(), count: z.number() })),
  disputesByMonth: z.array(z.object({ month: z.string(), count: z.number(), resolved: z.number() })),
  resolutionOutcomes: z.array(z.object({ outcome: z.string(), count: z.number() })),
  repeatOffenders: z.array(z.object({ userId: z.string(), name: z.string(), disputeCount: z.number() })),
});

export type DisputeAnalysisStats = z.infer<typeof disputeAnalysisSchema>;

// ========================================
// Revenue
// ========================================
export const revenueSchema = z.object({
  totalRevenue: z.number(),
  revenueThisMonth: z.number(),
  revenueLastMonth: z.number(),
  growthRate: z.number(),
  revenueBySource: z.array(z.object({ source: z.string(), amount: z.number() })),
  revenueByMonth: z.array(z.object({ month: z.string(), amount: z.number() })),
  outstandingPayments: z.number(),
  refundsIssued: z.number(),
});

export type RevenueStats = z.infer<typeof revenueSchema>;

// ========================================
// Membership
// ========================================
export const membershipReportSchema = z.object({
  totalMembers: z.number(),
  activeMembers: z.number(),
  expiredMembers: z.number(),
  renewalRate: z.number(),
  membershipsByTier: z.array(z.object({ tier: z.string(), count: z.number() })),
  membershipsByMonth: z.array(z.object({ month: z.string(), new: z.number(), renewed: z.number(), expired: z.number() })),
  averageMembershipDuration: z.number(),
  upcomingRenewals: z.number(),
});

export type MembershipReportStats = z.infer<typeof membershipReportSchema>;
