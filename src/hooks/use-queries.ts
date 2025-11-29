import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { playerSchema, Player } from "@/constants/zod/player-schema";
import { leagueSchema, League } from "@/constants/zod/league-schema";
import { seasonSchema, Season } from "@/constants/zod/season-schema";
import { divisionSchema, Division } from "@/constants/zod/division-schema";
import { adminSchema, Admin } from "@/constants/zod/admin-schema";
import { matchSchema, Match, matchStatsSchema, MatchStats, MatchFilters } from "@/constants/zod/match-schema";
import { endpoints } from "@/lib/endpoints";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HOST_URL,
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
      return z.array(leagueSchema).parse(result.data);
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
// UTILITY HOOKS
// ============================================

// ============================================
// MATCHES
// ============================================

/**
 * Get all matches with filters
 */
export function useMatches(filters: MatchFilters = {}) {
  return useQuery({
    queryKey: queryKeys.matches.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

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
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));

      const response = await axiosInstance.get(
        `${endpoints.admin.matches.getAll}?${params.toString()}`
      );

      return {
        matches: z.array(matchSchema).parse(response.data.matches),
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
      return matchSchema.parse(response.data.data);
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
      return matchStatsSchema.parse(response.data);
    },
  });
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
    invalidateAll: () => queryClient.invalidateQueries(),
  };
}
