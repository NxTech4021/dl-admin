import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  playerRegistrationSchema,
  playerRetentionSchema,
  seasonPerformanceSchema,
  disputeAnalysisSchema,
  revenueSchema,
  membershipReportSchema,
  type PlayerRegistrationStats,
  type PlayerRetentionStats,
  type SeasonPerformanceStats,
  type DisputeAnalysisStats,
  type RevenueStats,
  type MembershipReportStats,
} from "@/constants/zod/report-schema";
import { endpoints } from "@/lib/endpoints";
import { apiClient } from "@/lib/api-client";
import { logger } from "@/lib/logger";
import { queryKeys } from "./query-keys";

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

function buildParams(filters?: DateRangeFilter): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters?.startDate) params.startDate = filters.startDate;
  if (filters?.endDate) params.endDate = filters.endDate;
  return params;
}

/** Get player registration statistics with optional date range filter */
export function usePlayerRegistrationReport(filters?: DateRangeFilter) {
  return useQuery({
    queryKey: queryKeys.reports.playerRegistration(filters),
    queryFn: async (): Promise<PlayerRegistrationStats> => {
      const response = await apiClient.get(
        endpoints.admin.reports.playerRegistration,
        { params: buildParams(filters) },
      );
      const payload = response.data.data ?? response.data;
      const parseResult = playerRegistrationSchema.safeParse(payload);
      if (!parseResult.success) {
        logger.error("Player registration report schema validation failed:", parseResult.error.issues);
        return payload;
      }
      return parseResult.data;
    },
    staleTime: 60000,
  });
}

/** Get player retention statistics with optional date range filter */
export function usePlayerRetentionReport(filters?: DateRangeFilter) {
  return useQuery({
    queryKey: queryKeys.reports.playerRetention(filters),
    queryFn: async (): Promise<PlayerRetentionStats> => {
      const response = await apiClient.get(
        endpoints.admin.reports.playerRetention,
        { params: buildParams(filters) },
      );
      const payload = response.data.data ?? response.data;
      const parseResult = playerRetentionSchema.safeParse(payload);
      if (!parseResult.success) {
        logger.error("Player retention report schema validation failed:", parseResult.error.issues);
        return payload;
      }
      return parseResult.data;
    },
    staleTime: 60000,
  });
}

/** Get season performance statistics (returns array of seasons) */
export function useSeasonPerformanceReport(seasonId?: string) {
  return useQuery({
    queryKey: queryKeys.reports.seasonPerformance(seasonId),
    queryFn: async (): Promise<SeasonPerformanceStats[]> => {
      const response = await apiClient.get(
        endpoints.admin.reports.seasonPerformance,
        { params: seasonId ? { seasonId } : {} },
      );
      const payload = response.data.data ?? response.data;
      const parseResult = z.array(seasonPerformanceSchema).safeParse(payload);
      if (!parseResult.success) {
        logger.error("Season performance report schema validation failed:", parseResult.error.issues);
        return payload;
      }
      return parseResult.data;
    },
    staleTime: 60000,
  });
}

/** Get dispute analysis statistics with optional date range filter */
export function useDisputeAnalysisReport(filters?: DateRangeFilter) {
  return useQuery({
    queryKey: queryKeys.reports.disputeAnalysis(filters),
    queryFn: async (): Promise<DisputeAnalysisStats> => {
      const response = await apiClient.get(
        endpoints.admin.reports.disputeAnalysis,
        { params: buildParams(filters) },
      );
      const payload = response.data.data ?? response.data;
      const parseResult = disputeAnalysisSchema.safeParse(payload);
      if (!parseResult.success) {
        logger.error("Dispute analysis report schema validation failed:", parseResult.error.issues);
        return payload;
      }
      return parseResult.data;
    },
    staleTime: 60000,
  });
}

/** Get revenue statistics with optional date range filter */
export function useRevenueReport(filters?: DateRangeFilter) {
  return useQuery({
    queryKey: queryKeys.reports.revenue(filters),
    queryFn: async (): Promise<RevenueStats> => {
      const response = await apiClient.get(
        endpoints.admin.reports.revenue,
        { params: buildParams(filters) },
      );
      const payload = response.data.data ?? response.data;
      const parseResult = revenueSchema.safeParse(payload);
      if (!parseResult.success) {
        logger.error("Revenue report schema validation failed:", parseResult.error.issues);
        return payload;
      }
      return parseResult.data;
    },
    staleTime: 60000,
  });
}

/** Get membership statistics with optional date range filter */
export function useMembershipReport(filters?: DateRangeFilter) {
  return useQuery({
    queryKey: queryKeys.reports.membership(filters),
    queryFn: async (): Promise<MembershipReportStats> => {
      const response = await apiClient.get(
        endpoints.admin.reports.membership,
        { params: buildParams(filters) },
      );
      const payload = response.data.data ?? response.data;
      const parseResult = membershipReportSchema.safeParse(payload);
      if (!parseResult.success) {
        logger.error("Membership report schema validation failed:", parseResult.error.issues);
        return payload;
      }
      return parseResult.data;
    },
    staleTime: 60000,
  });
}
