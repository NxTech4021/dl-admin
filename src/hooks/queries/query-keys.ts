import { MatchFilters } from "@/constants/zod/match-schema";
import { TeamChangeRequestStatus } from "@/constants/zod/team-change-request-schema";
import { PaymentFilters } from "@/constants/zod/payment-schema";
import { WithdrawalRequestStatus } from "@/constants/zod/partnership-admin-schema";

// Query Keys
export const queryKeys = {
  players: {
    all: ["players"] as const,
    list: () => [...queryKeys.players.all, "list"] as const,
    detail: (id: string) => [...queryKeys.players.all, "detail", id] as const,
    stats: () => [...queryKeys.players.all, "stats"] as const,
  },
  leagues: {
    all: ["leagues"] as const,
    list: () => [...queryKeys.leagues.all, "list"] as const,
    detail: (id: string) => [...queryKeys.leagues.all, "detail", id] as const,
  },
  seasons: {
    all: ["seasons"] as const,
    list: () => [...queryKeys.seasons.all, "list"] as const,
    detail: (id: string) => [...queryKeys.seasons.all, "detail", id] as const,
  },
  divisions: {
    all: ["divisions"] as const,
    list: () => [...queryKeys.divisions.all, "list"] as const,
    detail: (id: string) => [...queryKeys.divisions.all, "detail", id] as const,
  },
  admins: {
    all: ["admins"] as const,
    list: () => [...queryKeys.admins.all, "list"] as const,
    detail: (id: string) => [...queryKeys.admins.all, "detail", id] as const,
    session: () => [...queryKeys.admins.all, "session"] as const,
    statusHistory: (id: string) => [...queryKeys.admins.all, "statusHistory", id] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: () => [...queryKeys.categories.all, "list"] as const,
  },
  sponsors: {
    all: ["sponsors"] as const,
    list: () => [...queryKeys.sponsors.all, "list"] as const,
  },
  matches: {
    all: ["matches"] as const,
    lists: () => [...queryKeys.matches.all, "list"] as const,
    list: (filters: MatchFilters) => [...queryKeys.matches.lists(), filters] as const,
    details: () => [...queryKeys.matches.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.matches.details(), id] as const,
    stats: (filters?: { leagueId?: string; seasonId?: string; divisionId?: string }) =>
      [...queryKeys.matches.all, "stats", filters] as const,
  },
  disputes: {
    all: ["disputes"] as const,
    lists: () => [...queryKeys.disputes.all, "list"] as const,
    list: (filters?: { status?: string; priority?: string }) =>
      [...queryKeys.disputes.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.disputes.all, "detail", id] as const,
    openCount: () => [...queryKeys.disputes.all, "openCount"] as const,
  },
  inactivity: {
    all: ["inactivity"] as const,
    settings: (params?: { leagueId?: string; seasonId?: string }) =>
      [...queryKeys.inactivity.all, "settings", params] as const,
    allSettings: () => [...queryKeys.inactivity.all, "allSettings"] as const,
    stats: () => [...queryKeys.inactivity.all, "stats"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    stats: () => [...queryKeys.dashboard.all, "stats"] as const,
    kpi: () => [...queryKeys.dashboard.all, "kpi"] as const,
    sports: () => [...queryKeys.dashboard.all, "sports"] as const,
    matchActivity: (weeks?: number) => [...queryKeys.dashboard.all, "matchActivity", weeks] as const,
    userGrowth: (months?: number) => [...queryKeys.dashboard.all, "userGrowth", months] as const,
    sportComparison: () => [...queryKeys.dashboard.all, "sportComparison"] as const,
  },
  teamChangeRequests: {
    all: ["teamChangeRequests"] as const,
    lists: () => [...queryKeys.teamChangeRequests.all, "list"] as const,
    list: (filters?: { status?: TeamChangeRequestStatus; seasonId?: string }) =>
      [...queryKeys.teamChangeRequests.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.teamChangeRequests.all, "detail", id] as const,
    pendingCount: () => [...queryKeys.teamChangeRequests.all, "pendingCount"] as const,
  },
  bug: {
    all: ["bug"] as const,
    app: (appId: string) => [...queryKeys.bug.all, "app", appId] as const,
    settings: (appId: string) => [...queryKeys.bug.all, "settings", appId] as const,
  },
  payments: {
    all: ["payments"] as const,
    lists: () => [...queryKeys.payments.all, "list"] as const,
    list: (filters: Partial<PaymentFilters>) => [...queryKeys.payments.lists(), filters] as const,
    stats: (filters?: { seasonId?: string; startDate?: Date; endDate?: Date }) =>
      [...queryKeys.payments.all, "stats", filters] as const,
  },
  partnershipAdmin: {
    all: ["partnershipAdmin"] as const,
    withdrawalRequests: () => [...queryKeys.partnershipAdmin.all, "withdrawalRequests"] as const,
    withdrawalRequestList: (filters?: { status?: WithdrawalRequestStatus; seasonId?: string; search?: string }) =>
      [...queryKeys.partnershipAdmin.withdrawalRequests(), filters] as const,
    withdrawalRequestStats: () => [...queryKeys.partnershipAdmin.all, "stats"] as const,
    dissolvedPartnerships: () => [...queryKeys.partnershipAdmin.all, "dissolved"] as const,
    dissolvedPartnershipList: (filters?: { seasonId?: string; search?: string; status?: string }) =>
      [...queryKeys.partnershipAdmin.dissolvedPartnerships(), filters] as const,
    dissolvedPartnershipDetail: (id: string) =>
      [...queryKeys.partnershipAdmin.dissolvedPartnerships(), "detail", id] as const,
  },
  reports: {
    all: ["reports"] as const,
    playerRegistration: (filters?: { startDate?: string; endDate?: string }) =>
      [...queryKeys.reports.all, "playerRegistration", filters] as const,
    playerRetention: (filters?: { startDate?: string; endDate?: string }) =>
      [...queryKeys.reports.all, "playerRetention", filters] as const,
    seasonPerformance: (seasonId?: string) =>
      [...queryKeys.reports.all, "seasonPerformance", seasonId] as const,
    disputeAnalysis: (filters?: { startDate?: string; endDate?: string }) =>
      [...queryKeys.reports.all, "disputeAnalysis", filters] as const,
    revenue: (filters?: { startDate?: string; endDate?: string }) =>
      [...queryKeys.reports.all, "revenue", filters] as const,
    membership: (filters?: { startDate?: string; endDate?: string }) =>
      [...queryKeys.reports.all, "membership", filters] as const,
  },
  adminLogs: {
    all: ["adminLogs"] as const,
    lists: () => [...queryKeys.adminLogs.all, "list"] as const,
    list: (filters?: Partial<import("@/constants/zod/admin-log-schema").AdminLogFilters>) =>
      [...queryKeys.adminLogs.lists(), filters] as const,
    actionTypes: () => [...queryKeys.adminLogs.all, "actionTypes"] as const,
    targetTypes: () => [...queryKeys.adminLogs.all, "targetTypes"] as const,
    summary: (options?: { days?: number; adminId?: string }) =>
      [...queryKeys.adminLogs.all, "summary", options] as const,
    forTarget: (targetType?: string, targetId?: string) =>
      [...queryKeys.adminLogs.all, "forTarget", targetType, targetId] as const,
  },
  userActivity: {
    all: ["userActivity"] as const,
    lists: () => [...queryKeys.userActivity.all, "list"] as const,
    list: (filters?: Partial<import("@/constants/zod/admin-log-schema").UserActivityFilters>) =>
      [...queryKeys.userActivity.lists(), filters] as const,
    forUser: (userId?: string) =>
      [...queryKeys.userActivity.all, "forUser", userId] as const,
    forTarget: (targetType?: string, targetId?: string) =>
      [...queryKeys.userActivity.all, "forTarget", targetType, targetId] as const,
  },
};
