import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { playerSchema, Player } from "@/constants/zod/player-schema";
import { leagueSchema, League } from "@/constants/zod/league-schema";
import { seasonSchema, Season } from "@/constants/zod/season-schema";
import { divisionSchema, Division } from "@/constants/zod/division-schema";
import { adminSchema, Admin } from "@/constants/zod/admin-schema";
import { matchSchema, Match, matchStatsSchema, MatchStats, MatchFilters, MatchReportCategory } from "@/constants/zod/match-schema";
import { inactivitySettingsSchema, inactivityStatsSchema, InactivitySettings, InactivityStats, InactivitySettingsInput } from "@/constants/zod/inactivity-settings-schema";
import { dashboardStatsSchema, dashboardKPISchema, sportMetricsSchema, matchActivitySchema, userGrowthSchema, sportComparisonSchema, DashboardStats, DashboardKPI, SportMetrics, MatchActivity, UserGrowth, SportComparison } from "@/constants/zod/dashboard-schema";
import { teamChangeRequestSchema, teamChangeRequestsResponseSchema, TeamChangeRequest, TeamChangeRequestStatus } from "@/constants/zod/team-change-request-schema";
import {
  paymentRecordSchema,
  paymentStatsSchema,
  paginatedPaymentsSchema,
  PaymentRecord,
  PaymentStats,
  PaginatedPayments,
  PaymentFilters,
  UpdatePaymentStatusRequest,
  BulkUpdatePaymentStatusRequest,
} from "@/constants/zod/payment-schema";
import {
  withdrawalRequestAdminSchema,
  withdrawalRequestStatsSchema,
  dissolvedPartnershipSchema,
  WithdrawalRequestAdmin,
  WithdrawalRequestStats,
  DissolvedPartnership,
  WithdrawalRequestStatus,
} from "@/constants/zod/partnership-admin-schema";
import { endpoints } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api-error";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

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
    dissolvedPartnershipList: (filters?: { seasonId?: string; search?: string }) =>
      [...queryKeys.partnershipAdmin.dissolvedPartnerships(), filters] as const,
    dissolvedPartnershipDetail: (id: string) =>
      [...queryKeys.partnershipAdmin.dissolvedPartnerships(), "detail", id] as const,
  },
};

// ============================================
// PLAYERS
// ============================================

export function usePlayers() {
  return useQuery({
    queryKey: queryKeys.players.list(),
    queryFn: async (): Promise<Player[]> => {
      const response = await axiosInstance.get("/api/player/");
      const result = response.data;
      return z.array(playerSchema).parse(result.data);
    },
  });
}

export function usePlayer(id: string) {
  return useQuery({
    queryKey: queryKeys.players.detail(id),
    queryFn: async (): Promise<Player> => {
      const response = await axiosInstance.get(`/api/player/${id}`);
      return playerSchema.parse(response.data.data);
    },
    enabled: !!id,
  });
}

export function usePlayerStats() {
  return useQuery({
    queryKey: queryKeys.players.stats(),
    queryFn: async () => {
      const response = await axiosInstance.get("/api/player/stats");
      return response.data.data;
    },
  });
}

// ============================================
// LEAGUES
// ============================================

export function useLeagues() {
  return useQuery({
    queryKey: queryKeys.leagues.list(),
    queryFn: async (): Promise<League[]> => {
      const response = await axiosInstance.get("/api/league/");
      const result = response.data;
      // API returns { data: { leagues: [...] } } structure
      const leaguesData = result.data?.leagues || result.data || [];
      return z.array(leagueSchema).parse(leaguesData);
    },
  });
}

export function useLeague(id: string) {
  return useQuery({
    queryKey: queryKeys.leagues.detail(id),
    queryFn: async (): Promise<League> => {
      const response = await axiosInstance.get(`/api/league/${id}`);
      return leagueSchema.parse(response.data.data);
    },
    enabled: !!id,
  });
}

export function useCreateLeague() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<League>) => {
      const response = await axiosInstance.post("/api/league/create", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.all });
    },
  });
}

export function useUpdateLeague() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<League> }) => {
      const response = await axiosInstance.put(`/api/league/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.list() });
    },
  });
}

export function useDeleteLeague() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/api/league/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.all });
    },
  });
}

// ============================================
// SEASONS
// ============================================

export function useSeasons() {
  return useQuery({
    queryKey: queryKeys.seasons.list(),
    queryFn: async (): Promise<Season[]> => {
      const response = await axiosInstance.get("/api/season/");
      const result = response.data;
      return z.array(seasonSchema).parse(result.data);
    },
  });
}

export function useSeason(id: string) {
  return useQuery({
    queryKey: queryKeys.seasons.detail(id),
    queryFn: async (): Promise<Season> => {
      const response = await axiosInstance.get(`/api/season/${id}`);
      return seasonSchema.parse(response.data.data);
    },
    enabled: !!id,
  });
}

export function useCreateSeason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Season>) => {
      const response = await axiosInstance.post("/api/season/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seasons.all });
    },
  });
}

export function useDeleteSeason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/api/season/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seasons.all });
    },
  });
}

// ============================================
// DIVISIONS
// ============================================

export function useDivisions() {
  return useQuery({
    queryKey: queryKeys.divisions.list(),
    queryFn: async (): Promise<Division[]> => {
      const response = await axiosInstance.get("/api/division/");
      const result = response.data;
      return z.array(divisionSchema).parse(result.data);
    },
  });
}

export function useDivision(id: string) {
  return useQuery({
    queryKey: queryKeys.divisions.detail(id),
    queryFn: async (): Promise<Division> => {
      const response = await axiosInstance.get(`/api/division/${id}`);
      return divisionSchema.parse(response.data.data);
    },
    enabled: !!id,
  });
}

export function useDeleteDivision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/api/division/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.divisions.all });
    },
  });
}

interface DivisionStats {
  total: number;
  active: number;
  inactive: number;
  byLevel: { beginner: number; intermediate: number; advanced: number };
  byGameType: { singles: number; doubles: number };
}

export function useDivisionsStats(seasonId?: string) {
  return useQuery({
    queryKey: [...queryKeys.divisions.all, "stats", seasonId],
    queryFn: async (): Promise<DivisionStats> => {
      // Fetch divisions and compute stats client-side
      const url = seasonId
        ? `/api/division/season/${seasonId}`
        : "/api/division/";
      const response = await axiosInstance.get(url);
      const divisions = response.data?.data || response.data?.divisions || response.data || [];
      const divisionsArray = Array.isArray(divisions) ? divisions : [];

      return {
        total: divisionsArray.length,
        active: divisionsArray.filter((d: any) => d.isActive).length,
        inactive: divisionsArray.filter((d: any) => !d.isActive).length,
        byLevel: {
          beginner: divisionsArray.filter((d: any) => d.divisionLevel === "beginner").length,
          intermediate: divisionsArray.filter((d: any) => d.divisionLevel === "intermediate").length,
          advanced: divisionsArray.filter((d: any) => d.divisionLevel === "advanced").length,
        },
        byGameType: {
          singles: divisionsArray.filter((d: any) => d.gameType === "singles").length,
          doubles: divisionsArray.filter((d: any) => d.gameType === "doubles").length,
        },
      };
    },
  });
}

// ============================================
// ADMINS
// ============================================

export function useAdmins() {
  return useQuery({
    queryKey: queryKeys.admins.list(),
    queryFn: async (): Promise<Admin[]> => {
      const response = await axiosInstance.get("/api/admin/getadmins");
      const result = response.data;
      return z.array(adminSchema).parse(result.data.getAllAdmins);
    },
  });
}

export function useAdminSession() {
  return useQuery({
    queryKey: queryKeys.admins.session(),
    queryFn: async () => {
      const response = await axiosInstance.get("/api/admin/session");
      return response.data.data;
    },
    retry: false,
    staleTime: Infinity,
  });
}

// ============================================
// SPONSORS
// ============================================

/** Sponsor option for dropdown selection */
export interface SponsorOption {
  id: string;
  name: string;
}

/** Raw sponsorship from API */
interface SponsorshipResponse {
  id: string;
  sponsoredName?: string;
  company?: {
    id: string;
    name: string;
  };
}

export function useSponsors(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.sponsors.list(),
    queryFn: async (): Promise<SponsorOption[]> => {
      const response = await axiosInstance.get(endpoints.sponsors.getAll);
      const api = response.data;
      const sponsorships = (api?.data?.sponsorships || api?.data || api || []) as SponsorshipResponse[];
      return sponsorships.map((s) => ({
        id: s.id,
        name: s.company?.name || s.sponsoredName || "Unnamed Sponsor",
      }));
    },
    enabled,
  });
}

// ============================================
// MATCHES
// ============================================

/**
 * Get all matches with filters
 */
interface MatchesResponse {
  matches: Match[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useMatches(filters: MatchFilters = {}) {
  return useQuery({
    queryKey: queryKeys.matches.list(filters),
    queryFn: async (): Promise<MatchesResponse> => {
      const params = new URLSearchParams();

      if (filters.sport) params.append("sport", filters.sport);
      if (filters.leagueId) params.append("leagueId", filters.leagueId);
      if (filters.seasonId) params.append("seasonId", filters.seasonId);
      if (filters.divisionId) params.append("divisionId", filters.divisionId);
      if (filters.status) {
        const statusArray = Array.isArray(filters.status)
          ? filters.status
          : [filters.status];
        params.append("status", statusArray.join(","));
      }
      if (filters.startDate)
        params.append("startDate", filters.startDate.toISOString());
      if (filters.endDate)
        params.append("endDate", filters.endDate.toISOString());
      if (filters.search) params.append("search", filters.search);
      if (filters.isDisputed !== undefined)
        params.append("isDisputed", String(filters.isDisputed));
      if (filters.hasLateCancellation !== undefined)
        params.append("hasLateCancellation", String(filters.hasLateCancellation));
      if (filters.isWalkover !== undefined)
        params.append("isWalkover", String(filters.isWalkover));
      if (filters.requiresAdminReview !== undefined)
        params.append("requiresAdminReview", String(filters.requiresAdminReview));
      if (filters.matchContext && filters.matchContext !== "all")
        params.append("matchContext", filters.matchContext);
      if (filters.showHidden !== undefined)
        params.append("showHidden", String(filters.showHidden));
      if (filters.showReported !== undefined)
        params.append("showReported", String(filters.showReported));
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));

      const response = await axiosInstance.get(
        `${endpoints.admin.matches.getAll}?${params.toString()}`
      );

      // Safe parse with error handling for schema mismatches
      const parseResult = z.array(matchSchema).safeParse(response.data.matches);
      if (!parseResult.success) {
        console.error("Match schema validation failed:", parseResult.error.issues);
        // Return raw data as fallback to prevent complete failure
        return {
          matches: response.data.matches ?? [],
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
        };
      }

      return {
        matches: parseResult.data,
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
      };
    },
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Get single match by ID
 */
export function useMatch(id: string) {
  return useQuery({
    queryKey: queryKeys.matches.detail(id),
    queryFn: async (): Promise<Match> => {
      const response = await axiosInstance.get(
        endpoints.admin.matches.getById(id)
      );
      // Safe parse with error handling for schema mismatches
      const parseResult = matchSchema.safeParse(response.data.data);
      if (!parseResult.success) {
        console.error("Match detail schema validation failed:", parseResult.error.issues);
        // Return raw data as fallback
        return response.data.data;
      }
      return parseResult.data;
    },
    enabled: !!id,
  });
}

/**
 * Get match statistics
 */
export function useMatchStats(filters?: {
  leagueId?: string;
  seasonId?: string;
  divisionId?: string;
}) {
  return useQuery({
    queryKey: queryKeys.matches.stats(filters),
    queryFn: async (): Promise<MatchStats> => {
      const params = new URLSearchParams();
      if (filters?.leagueId) params.append("leagueId", filters.leagueId);
      if (filters?.seasonId) params.append("seasonId", filters.seasonId);
      if (filters?.divisionId) params.append("divisionId", filters.divisionId);

      const response = await axiosInstance.get(
        `${endpoints.admin.matches.getStats}?${params.toString()}`
      );
      // Safe parse with error handling for schema mismatches
      const parseResult = matchStatsSchema.safeParse(response.data);
      if (!parseResult.success) {
        console.error("Match stats schema validation failed:", parseResult.error.issues);
        // Return raw data as fallback
        return response.data;
      }
      return parseResult.data;
    },
  });
}

/** Mutation error type for match operations */
export interface MatchMutationError {
  message: string;
  matchId: string;
}

/**
 * Void a match (admin action)
 */
export function useVoidMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      reason,
      notifyParticipants,
    }: {
      matchId: string;
      reason: string;
      notifyParticipants?: boolean;
    }) => {
      const response = await axiosInstance.post(
        endpoints.admin.matches.voidMatch(matchId),
        {
          reason,
          notifyParticipants,
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.detail(variables.matchId),
      });
    },
    onError: (error) => {
      console.error("Failed to void match:", getErrorMessage(error, "Unknown error"));
    },
  });
}

/**
 * Convert match to walkover (admin action)
 */
export function useConvertToWalkover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      reason,
      defaultingPlayerId,
      winningPlayerId,
      notifyParticipants,
    }: {
      matchId: string;
      reason: string;
      defaultingPlayerId: string;
      winningPlayerId: string;
      notifyParticipants?: boolean;
    }) => {
      const response = await axiosInstance.post(
        endpoints.admin.matches.convertWalkover(matchId),
        {
          reason,
          defaultingPlayerId,
          winningPlayerId,
          notifyParticipants,
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.detail(variables.matchId),
      });
    },
    onError: (error) => {
      console.error("Failed to convert match to walkover:", getErrorMessage(error, "Unknown error"));
    },
  });
}

/**
 * Edit match result (admin action)
 */
export function useEditMatchResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      team1Score,
      team2Score,
      setScores,
      outcome,
      reason,
    }: {
      matchId: string;
      team1Score?: number;
      team2Score?: number;
      setScores?: { setNumber: number; team1Games: number; team2Games: number }[];
      outcome?: string;
      reason: string;
    }) => {
      const response = await axiosInstance.post(
        endpoints.admin.matches.editResult(matchId),
        {
          team1Score,
          team2Score,
          setScores,
          outcome,
          reason,
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.detail(variables.matchId),
      });
    },
    onError: (error) => {
      console.error("Failed to edit match result:", getErrorMessage(error, "Unknown error"));
    },
  });
}

/**
 * Message match participants (admin action)
 */
export function useMessageParticipants() {
  return useMutation({
    mutationFn: async ({
      matchId,
      subject,
      message,
      sendEmail,
      sendPush,
    }: {
      matchId: string;
      subject: string;
      message: string;
      sendEmail?: boolean;
      sendPush?: boolean;
    }) => {
      const response = await axiosInstance.post(
        endpoints.admin.matches.messageParticipants(matchId),
        {
          subject,
          message,
          sendEmail,
          sendPush,
        }
      );
      return response.data;
    },
    onError: (error) => {
      console.error("Failed to message participants:", getErrorMessage(error, "Unknown error"));
    },
  });
}

/**
 * Review late cancellation (admin action)
 */
export function useReviewCancellation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      approved,
      applyPenalty,
      penaltySeverity,
      reason,
    }: {
      matchId: string;
      approved: boolean;
      applyPenalty?: boolean;
      penaltySeverity?: string;
      reason?: string;
    }) => {
      const response = await axiosInstance.post(
        endpoints.admin.matches.reviewCancellation(matchId),
        {
          approved,
          applyPenalty,
          penaltySeverity,
          reason,
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.detail(variables.matchId),
      });
    },
    onError: (error) => {
      console.error("Failed to review cancellation:", getErrorMessage(error, "Unknown error"));
    },
  });
}

// ============================================
// DISPUTES
// ============================================

/**
 * Get all disputes with filters
 */
export function useDisputes(filters?: {
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.disputes.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.priority) params.append("priority", filters.priority);
      if (filters?.page) params.append("page", String(filters.page));
      if (filters?.limit) params.append("limit", String(filters.limit));

      const response = await axiosInstance.get(
        `${endpoints.admin.disputes.getAll}?${params.toString()}`
      );
      return response.data;
    },
  });
}

/**
 * Get single dispute by ID
 */
export function useDispute(id: string) {
  return useQuery({
    queryKey: queryKeys.disputes.detail(id),
    queryFn: async () => {
      const response = await axiosInstance.get(
        endpoints.admin.disputes.getById(id)
      );
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Start reviewing a dispute - sets status to UNDER_REVIEW
 */
export function useStartDisputeReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (disputeId: string) => {
      const response = await axiosInstance.post(
        endpoints.admin.disputes.startReview(disputeId)
      );
      return response.data;
    },
    onSuccess: (_, disputeId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.disputes.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.disputes.detail(disputeId),
      });
    },
  });
}

/**
 * Resolve dispute (admin action)
 */
export function useResolveDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      disputeId,
      action,
      finalScore,
      reason,
      notifyPlayers,
    }: {
      disputeId: string;
      action: string;
      finalScore?: any;
      reason: string;
      notifyPlayers?: boolean;
    }) => {
      const response = await axiosInstance.post(
        endpoints.admin.disputes.resolve(disputeId),
        {
          action,
          finalScore,
          reason,
          notifyPlayers,
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.disputes.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.disputes.detail(variables.disputeId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
    },
  });
}

/**
 * Get open disputes count for sidebar badge
 */
export function useOpenDisputeCount() {
  return useQuery({
    queryKey: queryKeys.disputes.openCount(),
    queryFn: async () => {
      // Fetch only OPEN and UNDER_REVIEW disputes to get the count
      const params = new URLSearchParams();
      params.append("status", "OPEN,UNDER_REVIEW");
      params.append("limit", "1"); // We only need the total count

      const response = await axiosInstance.get(
        `${endpoints.admin.disputes.getAll}?${params.toString()}`
      );
      return response.data?.total || 0;
    },
    staleTime: 60000, // Cache for 1 minute
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Add note to dispute (admin action)
 */
export function useAddDisputeNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      disputeId,
      note,
      isInternalOnly = true,
    }: {
      disputeId: string;
      note: string;
      isInternalOnly?: boolean;
    }) => {
      const response = await axiosInstance.post(
        `${endpoints.admin.disputes.getById(disputeId)}/notes`,
        {
          note,
          isInternalOnly,
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.disputes.detail(variables.disputeId),
      });
    },
  });
}

// ============================================
// MATCH PARTICIPANTS
// ============================================

export interface ParticipantInput {
  userId: string;
  team: "team1" | "team2" | null;
  role: "CREATOR" | "OPPONENT" | "PARTNER" | "INVITED";
}

export interface AvailablePlayer {
  id: string;
  name: string;
  username: string;
  image: string | null;
  rating: number | null;
}

/**
 * Get available players for a division (for participant picker)
 */
export function useAvailablePlayers(
  divisionId: string | undefined,
  excludeMatchId?: string,
  search?: string
) {
  return useQuery({
    queryKey: ["availablePlayers", divisionId, excludeMatchId, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (excludeMatchId) params.append("excludeMatchId", excludeMatchId);
      if (search) params.append("search", search);

      const response = await axiosInstance.get(
        `${endpoints.admin.divisions.availablePlayers(divisionId!)}?${params.toString()}`
      );
      return response.data as AvailablePlayer[];
    },
    enabled: !!divisionId,
  });
}

/**
 * Validate participant edit before submission
 */
export function useValidateParticipants() {
  return useMutation({
    mutationFn: async ({
      matchId,
      participants,
    }: {
      matchId: string;
      participants: ParticipantInput[];
    }) => {
      const response = await axiosInstance.post(
        endpoints.admin.matches.validateParticipants(matchId),
        { participants }
      );
      return response.data as {
        isValid: boolean;
        errors: string[];
        warnings: string[];
      };
    },
  });
}

/**
 * Edit match participants (admin action)
 */
export function useEditMatchParticipants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      participants,
      reason,
    }: {
      matchId: string;
      participants: ParticipantInput[];
      reason: string;
    }) => {
      const response = await axiosInstance.put(
        endpoints.admin.matches.editParticipants(matchId),
        { participants, reason }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.detail(variables.matchId),
      });
    },
    onError: (error) => {
      console.error("Failed to edit participants:", getErrorMessage(error, "Unknown error"));
    },
  });
}

// ============================================
// FRIENDLY MATCH MODERATION
// ============================================

/**
 * Hide a friendly match from public view (admin action)
 */
export function useHideMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      reason,
    }: {
      matchId: string;
      reason: string;
    }) => {
      const response = await axiosInstance.post(
        endpoints.admin.matches.hideMatch(matchId),
        { reason }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.detail(variables.matchId),
      });
    },
    onError: (error) => {
      console.error("Failed to hide match:", getErrorMessage(error, "Unknown error"));
    },
  });
}

/**
 * Unhide a friendly match (admin action)
 */
export function useUnhideMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId }: { matchId: string }) => {
      const response = await axiosInstance.post(
        endpoints.admin.matches.unhideMatch(matchId)
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.detail(variables.matchId),
      });
    },
    onError: (error) => {
      console.error("Failed to unhide match:", getErrorMessage(error, "Unknown error"));
    },
  });
}

/**
 * Report a friendly match for abuse (admin action)
 */
export function useReportMatchAbuse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      reason,
      category,
    }: {
      matchId: string;
      reason: string;
      category: MatchReportCategory;
    }) => {
      const response = await axiosInstance.post(
        endpoints.admin.matches.reportAbuse(matchId),
        { reason, category }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.detail(variables.matchId),
      });
    },
    onError: (error) => {
      console.error("Failed to report match abuse:", getErrorMessage(error, "Unknown error"));
    },
  });
}

/**
 * Clear abuse report from a friendly match (admin action)
 */
export function useClearMatchReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId }: { matchId: string }) => {
      const response = await axiosInstance.post(
        endpoints.admin.matches.clearReport(matchId)
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.detail(variables.matchId),
      });
    },
    onError: (error) => {
      console.error("Failed to clear match report:", getErrorMessage(error, "Unknown error"));
    },
  });
}

// ============================================
// INACTIVITY SETTINGS
// ============================================

/**
 * Get inactivity settings (global, league-specific, or season-specific)
 */
export function useInactivitySettings(params?: { leagueId?: string; seasonId?: string }) {
  return useQuery({
    queryKey: queryKeys.inactivity.settings(params),
    queryFn: async (): Promise<InactivitySettings | null> => {
      const queryParams = new URLSearchParams();
      if (params?.leagueId) queryParams.append("leagueId", params.leagueId);
      if (params?.seasonId) queryParams.append("seasonId", params.seasonId);

      const url = queryParams.toString()
        ? `${endpoints.admin.inactivity.getSettings}?${queryParams.toString()}`
        : endpoints.admin.inactivity.getSettings;

      const response = await axiosInstance.get(url);

      // Backend may return null if no settings exist
      if (!response.data || !response.data.data) {
        return null;
      }

      return inactivitySettingsSchema.parse(response.data.data);
    },
  });
}

/**
 * Get all inactivity settings across all scopes
 */
export function useAllInactivitySettings() {
  return useQuery({
    queryKey: queryKeys.inactivity.allSettings(),
    queryFn: async (): Promise<InactivitySettings[]> => {
      const response = await axiosInstance.get(endpoints.admin.inactivity.getAllSettings);
      return z.array(inactivitySettingsSchema).parse(response.data.data || []);
    },
  });
}

/**
 * Get inactivity statistics
 */
export function useInactivityStats() {
  return useQuery({
    queryKey: queryKeys.inactivity.stats(),
    queryFn: async (): Promise<InactivityStats> => {
      const response = await axiosInstance.get(endpoints.admin.inactivity.getStats);
      return inactivityStatsSchema.parse(response.data.data);
    },
  });
}

/**
 * Update inactivity settings
 */
export function useUpdateInactivitySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: InactivitySettingsInput) => {
      const response = await axiosInstance.put(
        endpoints.admin.inactivity.updateSettings,
        input
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inactivity.all });
    },
    onError: (error) => {
      console.error("Failed to update inactivity settings:", getErrorMessage(error, "Unknown error"));
    },
  });
}

/**
 * Delete inactivity settings (revert to defaults)
 */
export function useDeleteInactivitySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settingsId: string) => {
      const response = await axiosInstance.delete(
        endpoints.admin.inactivity.deleteSettings(settingsId)
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inactivity.all });
    },
    onError: (error) => {
      console.error("Failed to delete inactivity settings:", getErrorMessage(error, "Unknown error"));
    },
  });
}

/**
 * Manually trigger inactivity check
 */
export function useTriggerInactivityCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post(endpoints.admin.inactivity.triggerCheck);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inactivity.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.players.all });
    },
    onError: (error) => {
      console.error("Failed to trigger inactivity check:", getErrorMessage(error, "Unknown error"));
    },
  });
}

// ============================================
// DASHBOARD STATS
// ============================================

/**
 * Get all dashboard stats in one call
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: async (): Promise<DashboardStats> => {
      const response = await axiosInstance.get(endpoints.admin.dashboard.getAll);
      return dashboardStatsSchema.parse(response.data.data);
    },
    staleTime: 60000, // 1 minute cache
  });
}

/**
 * Get KPI stats only
 */
export function useDashboardKPI() {
  return useQuery({
    queryKey: queryKeys.dashboard.kpi(),
    queryFn: async (): Promise<DashboardKPI> => {
      const response = await axiosInstance.get(endpoints.admin.dashboard.getKPI);
      return dashboardKPISchema.parse(response.data.data);
    },
    staleTime: 60000,
  });
}

/**
 * Get sport-specific metrics
 */
export function useSportMetrics() {
  return useQuery({
    queryKey: queryKeys.dashboard.sports(),
    queryFn: async (): Promise<SportMetrics[]> => {
      const response = await axiosInstance.get(endpoints.admin.dashboard.getSports);
      return z.array(sportMetricsSchema).parse(response.data.data);
    },
    staleTime: 60000,
  });
}

/**
 * Get match activity data for charts
 */
export function useMatchActivity(weeks?: number) {
  return useQuery({
    queryKey: queryKeys.dashboard.matchActivity(weeks),
    queryFn: async (): Promise<MatchActivity[]> => {
      const params = weeks ? `?weeks=${weeks}` : "";
      const response = await axiosInstance.get(`${endpoints.admin.dashboard.getMatchActivity}${params}`);
      return z.array(matchActivitySchema).parse(response.data.data);
    },
    staleTime: 60000,
  });
}

/**
 * Get user growth data for charts
 */
export function useUserGrowth(months?: number) {
  return useQuery({
    queryKey: queryKeys.dashboard.userGrowth(months),
    queryFn: async (): Promise<UserGrowth[]> => {
      const params = months ? `?months=${months}` : "";
      const response = await axiosInstance.get(`${endpoints.admin.dashboard.getUserGrowth}${params}`);
      return z.array(userGrowthSchema).parse(response.data.data);
    },
    staleTime: 60000,
  });
}

/**
 * Get sport comparison data for charts
 */
export function useSportComparison() {
  return useQuery({
    queryKey: queryKeys.dashboard.sportComparison(),
    queryFn: async (): Promise<SportComparison[]> => {
      const response = await axiosInstance.get(endpoints.admin.dashboard.getSportComparison);
      return z.array(sportComparisonSchema).parse(response.data.data);
    },
    staleTime: 60000,
  });
}

// ============================================
// TEAM CHANGE REQUESTS
// ============================================

/**
 * Get all team change requests with optional filters
 */
export function useTeamChangeRequests(filters?: {
  status?: TeamChangeRequestStatus;
  seasonId?: string;
}) {
  return useQuery({
    queryKey: queryKeys.teamChangeRequests.list(filters),
    queryFn: async (): Promise<TeamChangeRequest[]> => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.seasonId) params.append("seasonId", filters.seasonId);

      const url = params.toString()
        ? `${endpoints.teamChangeRequests.getAll}?${params.toString()}`
        : endpoints.teamChangeRequests.getAll;

      const response = await axiosInstance.get(url);
      return teamChangeRequestsResponseSchema.parse(response.data);
    },
  });
}

/**
 * Get a single team change request by ID
 */
export function useTeamChangeRequest(id: string | null) {
  return useQuery({
    queryKey: queryKeys.teamChangeRequests.detail(id || ""),
    queryFn: async (): Promise<TeamChangeRequest | null> => {
      if (!id) return null;
      const response = await axiosInstance.get(endpoints.teamChangeRequests.getById(id));
      return teamChangeRequestSchema.parse(response.data);
    },
    enabled: !!id,
  });
}

/**
 * Get pending team change requests count
 */
export function usePendingTeamChangeRequestsCount() {
  return useQuery({
    queryKey: queryKeys.teamChangeRequests.pendingCount(),
    queryFn: async (): Promise<number> => {
      const response = await axiosInstance.get(endpoints.teamChangeRequests.getPendingCount);
      return response.data.count || 0;
    },
  });
}

/**
 * Process a team change request (approve/deny)
 */
export function useProcessTeamChangeRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      status,
      adminId,
      adminNotes,
    }: {
      requestId: string;
      status: "APPROVED" | "DENIED";
      adminId: string;
      adminNotes?: string;
    }) => {
      const response = await axiosInstance.patch(
        endpoints.teamChangeRequests.process(requestId),
        { status, adminId, adminNotes }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teamChangeRequests.all });
    },
    onError: (error) => {
      console.error("Failed to process team change request:", getErrorMessage(error, "Unknown error"));
    },
  });
}

// ============================================
// UTILITY HOOKS
// ============================================

export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return {
    invalidatePlayers: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.players.all }),
    invalidateLeagues: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.all }),
    invalidateSeasons: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.seasons.all }),
    invalidateDivisions: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.divisions.all }),
    invalidateAdmins: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.admins.all }),
    invalidateMatches: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all }),
    invalidateDisputes: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.disputes.all }),
    invalidateSponsors: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.sponsors.all }),
    invalidateBugSettings: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.bug.all }),
    invalidatePayments: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
    invalidateAll: () => queryClient.invalidateQueries(),
  };
}

// ============================================
// BUG REPORT SETTINGS
// ============================================

// Types for bug report settings
export interface BugReportSettings {
  id: string;
  appId: string;
  syncEnabled: boolean;
  googleSheetId: string | null;
  googleSheetName: string | null;
  enableScreenshots: boolean;
  enableAutoCapture: boolean;
  enableConsoleCapture: boolean;
  enableNetworkCapture: boolean;
  maxScreenshots: number;
  maxFileSize: number;
  notifyEmails: string[] | null;
  slackWebhookUrl: string | null;
  discordWebhookUrl: string | null;
  notifyOnNew: boolean;
  notifyOnStatusChange: boolean;
  defaultPriority: string;
  updatedAt: string;
  createdAt: string;
}

export interface BugReportSettingsInput {
  syncEnabled?: boolean;
  googleSheetId?: string;
  googleSheetName?: string;
  enableScreenshots?: boolean;
  enableAutoCapture?: boolean;
  enableConsoleCapture?: boolean;
  enableNetworkCapture?: boolean;
  maxScreenshots?: number;
  maxFileSize?: number;
  notifyEmails?: string[];
  slackWebhookUrl?: string;
  discordWebhookUrl?: string;
  notifyOnNew?: boolean;
  notifyOnStatusChange?: boolean;
  defaultPriority?: string;
}

/**
 * Initialize the DLA app and get its ID
 */
export function useBugAppInit() {
  return useQuery({
    queryKey: queryKeys.bug.app("dla"),
    queryFn: async (): Promise<{ appId: string; name: string }> => {
      const response = await axiosInstance.get(endpoints.bug.init);
      return { appId: response.data.appId, name: response.data.name || "DLA" };
    },
    staleTime: Infinity, // App ID won't change
  });
}

/**
 * Get bug report settings for an app
 */
export function useBugReportSettings(appId: string | null) {
  return useQuery({
    queryKey: queryKeys.bug.settings(appId || ""),
    queryFn: async (): Promise<BugReportSettings | null> => {
      if (!appId) return null;
      const response = await axiosInstance.get(endpoints.bug.getSettings(appId));
      return response.data;
    },
    enabled: !!appId,
  });
}

/**
 * Update bug report settings for an app
 */
export function useUpdateBugReportSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appId, data }: { appId: string; data: BugReportSettingsInput }) => {
      const response = await axiosInstance.put(endpoints.bug.updateSettings(appId), data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bug.settings(variables.appId) });
    },
    onError: (error) => {
      console.error("Failed to update bug report settings:", getErrorMessage(error, "Unknown error"));
    },
  });
}

// ============================================
// PAYMENTS
// ============================================

/**
 * Get all payments with filters and pagination
 */
export function usePayments(filters: Partial<PaymentFilters> = {}) {
  return useQuery({
    queryKey: queryKeys.payments.list(filters),
    queryFn: async (): Promise<PaginatedPayments> => {
      const params = new URLSearchParams();

      if (filters.search) params.append("search", filters.search);
      if (filters.seasonId) params.append("seasonId", filters.seasonId);
      if (filters.status) params.append("status", filters.status);
      if (filters.startDate) params.append("startDate", filters.startDate.toISOString());
      if (filters.endDate) params.append("endDate", filters.endDate.toISOString());
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const response = await axiosInstance.get(
        `${endpoints.payments.getAll}?${params.toString()}`
      );

      // Safe parse with error handling
      const parseResult = paginatedPaymentsSchema.safeParse(response.data);
      if (!parseResult.success) {
        console.error("Payments schema validation failed:", parseResult.error.issues);
        // Return raw data as fallback
        return {
          data: response.data.data ?? [],
          pagination: response.data.pagination ?? {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
        };
      }

      return parseResult.data;
    },
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Get payment statistics
 */
export function usePaymentStats(filters?: {
  seasonId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  return useQuery({
    queryKey: queryKeys.payments.stats(filters),
    queryFn: async (): Promise<PaymentStats> => {
      const params = new URLSearchParams();
      if (filters?.seasonId) params.append("seasonId", filters.seasonId);
      if (filters?.startDate) params.append("startDate", filters.startDate.toISOString());
      if (filters?.endDate) params.append("endDate", filters.endDate.toISOString());

      const response = await axiosInstance.get(
        `${endpoints.payments.getStats}?${params.toString()}`
      );

      // Safe parse with error handling
      const parseResult = paymentStatsSchema.safeParse(response.data.data || response.data);
      if (!parseResult.success) {
        console.error("Payment stats schema validation failed:", parseResult.error.issues);
        // Return default stats as fallback
        return {
          total: 0,
          completed: 0,
          pending: 0,
          failed: 0,
          totalRevenue: 0,
          outstandingAmount: 0,
        };
      }

      return parseResult.data;
    },
    staleTime: 60000, // 1 minute
  });
}

/**
 * Update a single payment status
 */
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      membershipId,
      data,
    }: {
      membershipId: string;
      data: UpdatePaymentStatusRequest;
    }) => {
      const response = await axiosInstance.patch(
        endpoints.payments.updateStatus(membershipId),
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.seasons.all });
    },
    onError: (error) => {
      console.error("Failed to update payment status:", getErrorMessage(error, "Unknown error"));
    },
  });
}

/**
 * Bulk update payment statuses
 */
export function useBulkUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkUpdatePaymentStatusRequest) => {
      const response = await axiosInstance.patch(
        endpoints.payments.bulkUpdateStatus,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.seasons.all });
    },
    onError: (error) => {
      console.error("Failed to bulk update payment statuses:", getErrorMessage(error, "Unknown error"));
    },
  });
}

// ============================================
// PARTNERSHIP ADMIN
// ============================================

/**
 * Get all withdrawal requests with optional filters
 */
export function useWithdrawalRequestsAdmin(filters?: {
  status?: WithdrawalRequestStatus;
  seasonId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: queryKeys.partnershipAdmin.withdrawalRequestList(filters),
    queryFn: async (): Promise<WithdrawalRequestAdmin[]> => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.seasonId) params.append("seasonId", filters.seasonId);
      if (filters?.search) params.append("search", filters.search);

      const url = params.toString()
        ? `${endpoints.partnershipAdmin.getWithdrawalRequests}?${params.toString()}`
        : endpoints.partnershipAdmin.getWithdrawalRequests;

      const response = await axiosInstance.get(url);

      // Safe parse with error handling
      const parseResult = z.array(withdrawalRequestAdminSchema).safeParse(response.data);
      if (!parseResult.success) {
        console.error("Withdrawal requests schema validation failed:", parseResult.error.issues);
        return response.data ?? [];
      }

      return parseResult.data;
    },
    staleTime: 30000,
  });
}

/**
 * Get withdrawal request statistics
 */
export function useWithdrawalRequestStats() {
  return useQuery({
    queryKey: queryKeys.partnershipAdmin.withdrawalRequestStats(),
    queryFn: async (): Promise<WithdrawalRequestStats> => {
      const response = await axiosInstance.get(endpoints.partnershipAdmin.getWithdrawalRequestStats);

      const parseResult = withdrawalRequestStatsSchema.safeParse(response.data);
      if (!parseResult.success) {
        console.error("Withdrawal stats schema validation failed:", parseResult.error.issues);
        return { pending: 0, approved: 0, rejected: 0, total: 0, totalDissolved: 0 };
      }

      return parseResult.data;
    },
    staleTime: 60000,
  });
}

/**
 * Get all dissolved partnerships with lifecycle info
 */
export function useDissolvedPartnerships(filters?: {
  seasonId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: queryKeys.partnershipAdmin.dissolvedPartnershipList(filters),
    queryFn: async (): Promise<DissolvedPartnership[]> => {
      const params = new URLSearchParams();
      if (filters?.seasonId) params.append("seasonId", filters.seasonId);
      if (filters?.search) params.append("search", filters.search);

      const url = params.toString()
        ? `${endpoints.partnershipAdmin.getDissolvedPartnerships}?${params.toString()}`
        : endpoints.partnershipAdmin.getDissolvedPartnerships;

      const response = await axiosInstance.get(url);

      const parseResult = z.array(dissolvedPartnershipSchema).safeParse(response.data);
      if (!parseResult.success) {
        console.error("Dissolved partnerships schema validation failed:", parseResult.error.issues);
        return response.data ?? [];
      }

      return parseResult.data;
    },
    staleTime: 30000,
  });
}

/**
 * Get a single dissolved partnership by ID with full lifecycle
 */
export function useDissolvedPartnership(id: string | null) {
  return useQuery({
    queryKey: queryKeys.partnershipAdmin.dissolvedPartnershipDetail(id || ""),
    queryFn: async (): Promise<DissolvedPartnership | null> => {
      if (!id) return null;
      const response = await axiosInstance.get(endpoints.partnershipAdmin.getDissolvedPartnershipById(id));

      const parseResult = dissolvedPartnershipSchema.safeParse(response.data);
      if (!parseResult.success) {
        console.error("Dissolved partnership schema validation failed:", parseResult.error.issues);
        return response.data;
      }

      return parseResult.data;
    },
    enabled: !!id,
  });
}

/**
 * Process a withdrawal request (approve/reject)
 */
export function useProcessWithdrawalRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      status,
      adminNotes,
    }: {
      requestId: string;
      status: "APPROVED" | "REJECTED";
      adminNotes?: string;
    }) => {
      const response = await axiosInstance.patch(
        endpoints.withdrawal.process(requestId),
        { status, adminNotes }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partnershipAdmin.all });
    },
    onError: (error) => {
      console.error("Failed to process withdrawal request:", getErrorMessage(error, "Unknown error"));
    },
  });
}
