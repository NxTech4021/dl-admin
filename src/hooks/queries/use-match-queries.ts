import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { matchSchema, Match, matchStatsSchema, MatchStats, MatchFilters, MatchReportCategory } from "@/constants/zod/match-schema";
import { endpoints } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api-error";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";
import { logger } from "@/lib/logger";

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

      const response = await apiClient.get(
        `${endpoints.admin.matches.getAll}?${params.toString()}`
      );

      // Safe parse with error handling for schema mismatches
      const parseResult = z.array(matchSchema).safeParse(response.data.matches);
      if (!parseResult.success) {
        logger.error("Match schema validation failed:", parseResult.error.issues);
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
      const response = await apiClient.get(
        endpoints.admin.matches.getById(id)
      );
      // Safe parse with error handling for schema mismatches
      const parseResult = matchSchema.safeParse(response.data.data);
      if (!parseResult.success) {
        logger.error("Match detail schema validation failed:", parseResult.error.issues);
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

      const response = await apiClient.get(
        `${endpoints.admin.matches.getStats}?${params.toString()}`
      );
      // Safe parse with error handling for schema mismatches
      const parseResult = matchStatsSchema.safeParse(response.data);
      if (!parseResult.success) {
        logger.error("Match stats schema validation failed:", parseResult.error.issues);
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
      const response = await apiClient.post(
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
      logger.error("Failed to void match:", getErrorMessage(error, "Unknown error"));
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
      // Backend expects winnerId (not winningPlayerId) and walkoverReason (enum)
      const response = await apiClient.post(
        endpoints.admin.matches.convertWalkover(matchId),
        {
          winnerId: winningPlayerId,
          reason,
          walkoverReason: reason,
          defaultingPlayerId,
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
      logger.error("Failed to convert match to walkover:", getErrorMessage(error, "Unknown error"));
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
      const response = await apiClient.post(
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
      logger.error("Failed to edit match result:", getErrorMessage(error, "Unknown error"));
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
      const response = await apiClient.post(
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
      logger.error("Failed to message participants:", getErrorMessage(error, "Unknown error"));
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
      const response = await apiClient.post(
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
      logger.error("Failed to review cancellation:", getErrorMessage(error, "Unknown error"));
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

      const response = await apiClient.get(
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
      const response = await apiClient.post(
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
      const response = await apiClient.put(
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
      logger.error("Failed to edit participants:", getErrorMessage(error, "Unknown error"));
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
      const response = await apiClient.post(
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
      logger.error("Failed to hide match:", getErrorMessage(error, "Unknown error"));
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
      const response = await apiClient.post(
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
      logger.error("Failed to unhide match:", getErrorMessage(error, "Unknown error"));
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
      const response = await apiClient.post(
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
      logger.error("Failed to report match abuse:", getErrorMessage(error, "Unknown error"));
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
      const response = await apiClient.post(
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
      logger.error("Failed to clear match report:", getErrorMessage(error, "Unknown error"));
    },
  });
}
