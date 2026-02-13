import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { dashboardStatsSchema, dashboardKPISchema, sportMetricsSchema, matchActivitySchema, userGrowthSchema, sportComparisonSchema, DashboardStats, DashboardKPI, SportMetrics, MatchActivity, UserGrowth, SportComparison } from "@/constants/zod/dashboard-schema";
import { endpoints } from "@/lib/endpoints";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";
import { logger } from "@/lib/logger";

/**
 * Get all dashboard stats in one call
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: async (): Promise<DashboardStats> => {
      const response = await apiClient.get(endpoints.admin.dashboard.getAll);
      const payload = response.data?.data ?? response.data;
      const parseResult = dashboardStatsSchema.safeParse(payload);
      if (!parseResult.success) {
        logger.error("dashboardStatsSchema validation failed:", parseResult.error.issues);
        return payload;
      }
      return parseResult.data;
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
      const response = await apiClient.get(endpoints.admin.dashboard.getKPI);
      const payload = response.data?.data ?? response.data;
      const parseResult = dashboardKPISchema.safeParse(payload);
      if (!parseResult.success) {
        logger.error("dashboardKPISchema validation failed:", parseResult.error.issues);
        return payload;
      }
      return parseResult.data;
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
      const response = await apiClient.get(endpoints.admin.dashboard.getSports);
      const payload = response.data?.data ?? response.data;
      const parseResult = z.array(sportMetricsSchema).safeParse(payload);
      if (!parseResult.success) {
        logger.error("sportMetricsSchema validation failed:", parseResult.error.issues);
        return payload;
      }
      return parseResult.data;
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
      const response = await apiClient.get(`${endpoints.admin.dashboard.getMatchActivity}${params}`);
      const payload = response.data?.data ?? response.data;
      const parseResult = z.array(matchActivitySchema).safeParse(payload);
      if (!parseResult.success) {
        logger.error("matchActivitySchema validation failed:", parseResult.error.issues);
        return payload;
      }
      return parseResult.data;
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
      const response = await apiClient.get(`${endpoints.admin.dashboard.getUserGrowth}${params}`);
      const payload = response.data?.data ?? response.data;
      const parseResult = z.array(userGrowthSchema).safeParse(payload);
      if (!parseResult.success) {
        logger.error("userGrowthSchema validation failed:", parseResult.error.issues);
        return payload;
      }
      return parseResult.data;
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
      const response = await apiClient.get(endpoints.admin.dashboard.getSportComparison);
      const payload = response.data?.data ?? response.data;
      const parseResult = z.array(sportComparisonSchema).safeParse(payload);
      if (!parseResult.success) {
        logger.error("sportComparisonSchema validation failed:", parseResult.error.issues);
        return payload;
      }
      return parseResult.data;
    },
    staleTime: 60000,
  });
}
